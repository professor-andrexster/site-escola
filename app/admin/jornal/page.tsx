import Link from 'next/link'
import type { Metadata } from 'next'
import { AlertTriangle, BadgeCheck, CheckCircle2, ExternalLink, FileText, Inbox, Newspaper, Printer } from 'lucide-react'
import { getProfileOrRedirect } from '@/lib/profile'
import { acessoDe } from '@/lib/podcast/dados'
import { listarAuditoria } from '@/lib/podcast/auditoria'
import { podeEscrever } from '@/lib/jornal/api'
import { listarEdicoes, materiasDoAutor, resumoDaRedacao, todasAsMaterias, todasAsPautas } from '@/lib/jornal/dados'
import { NOME_JORNAL, ROTULO_STATUS, ROTULO_TIPO, periodoDaEdicao, type Materia } from '@/lib/jornal/tipos'
import NovaMateria from '@/components/admin/jornal/NovaMateria'
import PautasRedacao from '@/components/admin/jornal/PautasRedacao'
import BotaoNovaEdicao from '@/components/admin/jornal/BotaoNovaEdicao'

export const metadata: Metadata = { title: 'Redação JBInforma' }
export const dynamic = 'force-dynamic'

const COR: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-700', revisao: 'bg-amber-50 text-amber-800', ajustar: 'bg-red-50 text-red-700',
  publicado: 'bg-green-50 text-green-800', retirado: 'bg-gray-200 text-gray-700',
}

const ABAS = [
  { chave: 'visao', rotulo: 'Visão geral', soModerador: true },
  { chave: 'materias', rotulo: 'Matérias', soModerador: false },
  { chave: 'revisao', rotulo: 'Revisão', soModerador: true },
  { chave: 'pautas', rotulo: 'Pautas', soModerador: false },
  { chave: 'edicoes', rotulo: 'Edições', soModerador: true },
  { chave: 'auditoria', rotulo: 'Auditoria', soModerador: true },
] as const
type Aba = (typeof ABAS)[number]['chave']

function Lista({ materias, vazio, comAutor }: { materias: Materia[]; vazio: string; comAutor: boolean }) {
  if (materias.length === 0) return <p className="text-sm text-gray-500">{vazio}</p>
  return (
    <ul className="divide-y divide-gray-100 border border-gray-100 rounded-xl bg-white">
      {materias.map(m => (
        <li key={m.id}>
          <Link href={`/admin/jornal/materia/${m.id}`} className="flex items-center gap-3 p-3 hover:bg-gray-50">
            {m.tipo === 'checagem' ? <BadgeCheck className="w-4 h-4 text-escola-azul flex-shrink-0" /> : <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />}
            <span className="flex-1 min-w-0">
              <span className="block font-semibold text-sm text-gray-900 truncate">{m.titulo}</span>
              <span className="block text-xs text-gray-500 truncate">{ROTULO_TIPO[m.tipo].nome}{comAutor && m.autorNome ? ` · ${m.autorNome}` : ''} · mexida em {new Date(m.atualizadoEm).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</span>
            </span>
            <span className={`flex-shrink-0 rounded-full text-xs font-semibold px-2.5 py-1 ${COR[m.status]}`}>{ROTULO_STATUS[m.status]}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

/**
 * Redação do JBInforma. A equipe é a mesma do podcast: o professor monitor
 * revisa e publica; o aluno com termo aceito e permissão de postar escreve.
 */
export default async function JornalPage({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const sp = await searchParams
  const { user } = await getProfileOrRedirect()
  const acesso = await acessoDe(user.id)

  const cabecalho = (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-escola-vermelho mb-1">Redação</p>
        <h1 className="font-playfair text-3xl font-bold text-gray-900">{NOME_JORNAL}</h1>
        <p className="text-gray-500 mt-1">A agência de notícias da escola. Toda matéria ouve gente daqui.</p>
      </div>
      <Link href="/noticias" target="_blank" className="inline-flex items-center gap-2 border border-gray-200 bg-white px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:border-escola-azul">
        Jornal no site <ExternalLink className="w-4 h-4" />
      </Link>
    </div>
  )

  if (!acesso) return <div className="max-w-5xl mx-auto">{cabecalho}<p className="text-gray-500">Sua conta ainda não foi aprovada.</p></div>

  const escreve = podeEscrever(acesso)
  if (!escreve) {
    const m = acesso.membro
    return (
      <div className="max-w-3xl mx-auto">
        {cabecalho}
        <section className="panel p-6">
          <h2 className="font-geom text-lg font-bold text-gray-900 mb-2">Quer ser repórter?</h2>
          {m?.papel === 'aluno' ? (
            <p className="text-sm text-gray-700">Você já está na equipe. Para escrever falta {m.liberado ? 'o monitor liberar a sua permissão de postar' : 'o termo assinado pelo seu responsável ser conferido'}. Veja como está em <Link href="/admin/podcast" className="text-escola-azul underline">Podcast JB no Ar</Link>.</p>
          ) : (
            <p className="text-sm text-gray-700">A equipe do jornal é a mesma do podcast JB no Ar. Fale com o professor monitor: ele coloca você na equipe e entrega o termo para o seu responsável assinar.</p>
          )}
          <p className="text-sm text-gray-700 mt-3">Enquanto isso, dá para ajudar: <Link href="/noticias/pauta" className="text-escola-azul underline">mande uma sugestão de pauta</Link>.</p>
        </section>
      </div>
    )
  }

  const moderador = acesso.moderador
  const abas = ABAS.filter(a => moderador || !a.soModerador)
  const aba: Aba = abas.some(a => a.chave === sp.aba) ? (sp.aba as Aba) : moderador ? 'visao' : 'materias'
  const resumo = moderador ? await resumoDaRedacao() : null
  const contagem: Partial<Record<Aba, number>> = resumo ? { revisao: resumo.revisao, pautas: resumo.pautasNovas } : {}
  let corpo: React.ReactNode = null

  if (aba === 'visao' && resumo) {
    const cards = [
      { rotulo: 'Esperando revisão', valor: resumo.revisao, Icone: AlertTriangle, href: 'revisao' },
      { rotulo: 'Matérias no ar', valor: resumo.noAr, Icone: Newspaper, href: 'materias' },
      { rotulo: 'Pautas na fila', valor: resumo.pautasFila, Icone: Inbox, href: 'pautas' },
      { rotulo: 'Edições publicadas', valor: resumo.edicoes, Icone: Printer, href: 'edicoes' },
    ]
    const pend = [
      resumo.revisao > 0 && { texto: `${resumo.revisao} matéria(s) esperando sua revisão.`, href: 'revisao' },
      resumo.pautasNovas > 0 && { texto: `${resumo.pautasNovas} sugestão(ões) de pauta do público para ler.`, href: 'pautas' },
      resumo.pautasFila === 0 && { texto: 'A fila de pautas está vazia. Sugira assuntos para a equipe.', href: 'pautas' },
    ].filter(Boolean) as { texto: string; href: string }[]
    const recentes = await listarAuditoria({ acao: 'jornal.', limite: 8 })
    corpo = (
      <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {cards.map(c => (
            <Link key={c.rotulo} href={`/admin/jornal?aba=${c.href}`} className="panel-interativo p-5 block">
              <c.Icone className="w-5 h-5 text-escola-azul mb-2" />
              <p className="text-3xl font-bold text-gray-900">{c.valor}</p>
              <p className="text-sm text-gray-500">{c.rotulo}</p>
            </Link>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="panel p-6">
            <h2 className="font-geom text-lg font-bold text-gray-900 mb-3">O que precisa de você</h2>
            {pend.length === 0 ? <p className="text-sm text-green-700 inline-flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Nada pendente agora.</p> : (
              <ul className="space-y-2">{pend.map(p => <li key={p.texto}><Link href={`/admin/jornal?aba=${p.href}`} className="flex items-start gap-2 text-sm text-gray-800 hover:text-escola-azul"><AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />{p.texto}</Link></li>)}</ul>
            )}
            <p className="text-xs text-gray-500 mt-4">Quem escreve: alunos da equipe do podcast com termo aceito e permissão de postar. Para incluir alguém, use a aba Equipe em <Link href="/admin/podcast?aba=equipe" className="text-escola-azul underline">Podcast JB no Ar</Link>.</p>
          </section>
          <section className="panel p-6 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-geom text-lg font-bold text-gray-900">Últimas ações</h2>
              <Link href="/admin/jornal?aba=auditoria" className="text-sm text-escola-azul hover:underline">Auditoria completa</Link>
            </div>
            {recentes.length === 0 ? <p className="text-sm text-gray-500">Nada registrado ainda.</p> : (
              <ul className="space-y-2 text-sm">
                {recentes.map(r => (
                  <li key={r.id} className="min-w-0"><strong className="font-semibold text-gray-900">{r.atorNome?.split(' ')[0] ?? 'Alguém'}</strong> <span className="text-gray-600">{r.rotulo.replace('Jornal: ', '')}</span>{r.alvoNome ? <span className="text-gray-800">: {r.alvoNome}</span> : null}
                    <span className="block text-xs text-gray-500">{new Date(r.quando).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span></li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </>
    )
  } else if (aba === 'materias' || aba === 'revisao') {
    const materias = moderador ? await todasAsMaterias() : await materiasDoAutor(user.id)
    corpo = aba === 'revisao' ? (
      <section>
        <h2 className="font-geom text-lg font-bold text-gray-900 mb-2">Esperando sua revisão</h2>
        <Lista materias={materias.filter(m => m.status === 'revisao')} comAutor vazio="Nada esperando. Quando um repórter enviar uma matéria, ela aparece aqui." />
      </section>
    ) : (
      <>
        <NovaMateria />
        <section>
          <h2 className="font-geom text-lg font-bold text-gray-900 mb-2">{moderador ? 'Todas as matérias da redação' : 'Minhas matérias'}</h2>
          <Lista materias={materias} comAutor={moderador} vazio="Nenhuma matéria ainda. Comece uma acima ou pegue uma pauta na aba Pautas." />
        </section>
      </>
    )
  } else if (aba === 'pautas') {
    const todas = await todasAsPautas()
    // Repórter não vê sugestão que a redação ainda não leu, nem a recusada, nem o detalhe de quem mandou.
    const visiveis = moderador ? todas : todas.filter(p => p.status !== 'nova' && p.status !== 'recusada')
    corpo = <PautasRedacao pautas={visiveis} moderador={moderador} podeEscrever />
  } else if (aba === 'edicoes') {
    const edicoes = await listarEdicoes()
    corpo = (
      <>
        <section className="panel p-6 mb-6">
          <h2 className="font-geom text-lg font-bold text-gray-900 mb-1">Edição da semana</h2>
          <p className="text-sm text-gray-500 mb-4">Toda sexta: junte o que saiu na semana, escolha a manchete e publique. Sai uma página no site e um PDF de uma folha para imprimir e colar no mural, na cantina e no comércio do bairro.</p>
          <BotaoNovaEdicao />
        </section>
        {edicoes.length === 0 ? <p className="text-sm text-gray-500">Nenhuma edição ainda.</p> : (
          <ul className="divide-y divide-gray-100 border border-gray-100 rounded-xl bg-white">
            {edicoes.map(e => (
              <li key={e.id}>
                <Link href={`/admin/jornal/edicao/${e.id}`} className="flex items-center gap-3 p-3 hover:bg-gray-50">
                  <Printer className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="flex-1 min-w-0"><span className="block font-semibold text-sm text-gray-900 truncate">Nº {e.numero} · {e.titulo}</span><span className="block text-xs text-gray-500">{periodoDaEdicao(e)} · {e.materias.length} matéria(s)</span></span>
                  <span className={`rounded-full text-xs font-semibold px-2.5 py-1 ${e.status === 'publicada' ? COR.publicado : COR.rascunho}`}>{e.status === 'publicada' ? 'Publicada' : 'Rascunho'}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </>
    )
  } else {
    const linhas = await listarAuditoria({ acao: 'jornal.', limite: 200 })
    corpo = (
      <section className="panel p-6 min-w-0">
        <h2 className="font-geom text-lg font-bold text-gray-900 mb-1">Auditoria da redação</h2>
        <p className="text-xs text-gray-500 mb-4">Quem fez o quê, quando e de onde. As 200 ações mais recentes. A busca por pessoa fica na auditoria do <Link href="/admin/podcast?aba=auditoria&acao=jornal." className="text-escola-azul underline">podcast</Link>, que guarda tudo junto.</p>
        {linhas.length === 0 ? <p className="text-sm text-gray-500">Nada registrado ainda.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[36rem]">
              <thead><tr className="text-left text-xs text-gray-500 border-b border-gray-100"><th className="py-2 pr-3 font-semibold">Quando</th><th className="py-2 pr-3 font-semibold">Quem</th><th className="py-2 pr-3 font-semibold">Ação</th><th className="py-2 pr-3 font-semibold">Em quê</th><th className="py-2 font-semibold">IP</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {linhas.map(l => (
                  <tr key={l.id} className="align-top">
                    <td className="py-2 pr-3 text-xs text-gray-500 whitespace-nowrap">{new Date(l.quando).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="py-2 pr-3 text-gray-900">{l.atorNome ?? 'Sistema'}</td>
                    <td className="py-2 pr-3 text-gray-700">{l.rotulo.replace('Jornal: ', '')}</td>
                    <td className="py-2 pr-3 text-gray-700">{l.alvoNome ?? ''}{l.detalhe ? <span className="block text-xs text-gray-500">{l.detalhe}</span> : null}</td>
                    <td className="py-2 text-xs text-gray-500">{l.ip ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {cabecalho}
      <nav className="flex gap-1 overflow-x-auto border-b border-gray-200 mb-6 -mx-1 px-1" aria-label="Seções da redação">
        {abas.map(a => {
          const ativo = a.chave === aba
          const n = contagem[a.chave]
          return (
            <Link key={a.chave} href={`/admin/jornal?aba=${a.chave}`} aria-current={ativo ? 'page' : undefined}
              className={`flex-shrink-0 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${ativo ? 'border-escola-azul text-escola-azul' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
              {a.rotulo}{n ? <span className="ml-1.5 rounded-full bg-amber-100 text-amber-800 text-[11px] px-1.5 py-0.5">{n}</span> : null}
            </Link>
          )
        })}
      </nav>
      {corpo}
    </div>
  )
}
