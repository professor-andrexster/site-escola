import Link from 'next/link'
import type { Metadata } from 'next'
import { AlertTriangle, CheckCircle2, ExternalLink, FileCheck, Mic, Radio, ShieldCheck, Users } from 'lucide-react'
import { getProfileOrRedirect } from '@/lib/profile'
import {
  acessoDe, alunosDisponiveis, episodiosDoAluno, episodiosPorPessoa, listarMembros, listarQuadros, professoresDisponiveis, resumoDoPainel, todosOsEpisodios,
} from '@/lib/podcast/dados'
import { listarAuditoria } from '@/lib/podcast/auditoria'
import AbasPodcast, { ABAS, type Aba } from '@/components/admin/podcast/AbasPodcast'
import PainelAuditoria from '@/components/admin/podcast/PainelAuditoria'
import { NOME_PODCAST, ROTULO_AUTORIZACAO, ROTULO_EPISODIO, anoLetivoAtual, type Episodio } from '@/lib/podcast/tipos'
import QuadrosPodcast from '@/components/admin/podcast/QuadrosPodcast'
import MonitoresPodcast from '@/components/admin/podcast/MonitoresPodcast'
import EquipePodcast from '@/components/admin/podcast/EquipePodcast'
import NovoEpisodio from '@/components/admin/podcast/NovoEpisodio'

export const metadata: Metadata = { title: 'Podcast' }
export const dynamic = 'force-dynamic'

const COR: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-700', revisao: 'bg-amber-50 text-amber-800', ajustar: 'bg-red-50 text-red-700',
  publicado: 'bg-green-50 text-green-800', retirado: 'bg-gray-200 text-gray-700',
}

function ListaEpisodios({ eps, vazio }: { eps: Episodio[]; vazio: string }) {
  if (eps.length === 0) return <p className="text-sm text-gray-400">{vazio}</p>
  return (
    <ul className="divide-y divide-gray-100 border border-gray-100 rounded-xl bg-white">
      {eps.map(e => (
        <li key={e.id}>
          <Link href={`/admin/podcast/episodio/${e.id}`} className="flex items-center gap-3 p-3 hover:bg-gray-50">
            {e.tipo === 'entrevista' ? <Mic className="w-4 h-4 text-escola-azul flex-shrink-0" /> : <Radio className="w-4 h-4 text-gray-400 flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{e.titulo}</p>
              <p className="text-xs text-gray-500 truncate">
                {[e.quadroNome, `por ${e.autorNome.split(' ')[0]}`, e.audioUrl ? 'com áudio' : 'sem áudio'].filter(Boolean).join(' · ')}
              </p>
            </div>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${COR[e.status]}`}>{ROTULO_EPISODIO[e.status]}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

/**
 * Painel do podcast. Cada pessoa vê o que lhe cabe:
 * direção escolhe monitores; monitor cuida da equipe e aprova; aluno da
 * equipe grava (depois da autorização aceita); os demais são convidados a ouvir.
 */
interface Props { searchParams: Promise<{ aba?: string; pessoa?: string; acao?: string; antes?: string }> }

export default async function PodcastPage({ searchParams }: Props) {
  const sp = await searchParams
  const { user } = await getProfileOrRedirect()
  const acesso = await acessoDe(user.id)
  const ano = anoLetivoAtual()

  const cabecalho = (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-escola-vermelho mb-1">Podcast e rádio da escola</p>
        <h1 className="font-playfair text-3xl font-bold text-gray-900">{NOME_PODCAST}</h1>
        <p className="text-gray-500 mt-1">Feito pelos alunos, ouvido pela escola inteira.</p>
      </div>
      <Link href="/podcast" target="_blank" className="inline-flex items-center gap-2 border border-gray-200 bg-white px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:border-escola-azul">
        Página pública <ExternalLink className="w-4 h-4" />
      </Link>
    </div>
  )

  if (!acesso) {
    return <div className="max-w-5xl mx-auto">{cabecalho}<p className="text-gray-500">Sua conta ainda não foi aprovada.</p></div>
  }

  if (acesso.moderador) {
    const aba: Aba = (ABAS.map(a => a.chave) as string[]).includes(sp.aba ?? '') ? (sp.aba as Aba) : 'visao'
    const resumo = await resumoDoPainel()
    const contagem = { revisao: resumo.emRevisao, equipe: resumo.termoParaConferir + resumo.semPermissao }
    let corpo: React.ReactNode = null

    if (aba === 'visao') {
      const cards = [
        { rotulo: 'Monitores', valor: resumo.monitores, Icone: ShieldCheck, href: 'equipe' },
        { rotulo: 'Alunos na equipe', valor: resumo.alunos, Icone: Users, href: 'equipe' },
        { rotulo: 'Podem postar', valor: resumo.podemCriar, Icone: CheckCircle2, href: 'equipe' },
        { rotulo: 'No ar', valor: resumo.noAr, Icone: Radio, href: 'episodios' },
      ]
      const pendencias = [
        resumo.monitores === 0 && { texto: 'Nenhum professor monitor ainda.', href: 'equipe' },
        resumo.termoParaConferir > 0 && { texto: `${resumo.termoParaConferir} termo(s) assinado(s) esperando sua conferência.`, href: 'equipe' },
        resumo.semPermissao > 0 && { texto: `${resumo.semPermissao} aluno(s) com termo ok, mas sem permissão para postar.`, href: 'equipe' },
        resumo.esperandoTermo > 0 && { texto: `${resumo.esperandoTermo} aluno(s) esperando o termo assinado pelo responsável.`, href: 'equipe' },
        resumo.emRevisao > 0 && { texto: `${resumo.emRevisao} episódio(s) esperando revisão.`, href: 'revisao' },
      ].filter(Boolean) as { texto: string; href: string }[]
      const recentes = await listarAuditoria({ limite: 8 })
      corpo = (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {cards.map(c => (
              <Link key={c.rotulo} href={`/admin/podcast?aba=${c.href}`} className="panel-interativo p-5 block">
                <c.Icone className="w-5 h-5 text-escola-azul mb-2" />
                <p className="text-3xl font-bold text-gray-900">{c.valor}</p>
                <p className="text-sm text-gray-500">{c.rotulo}</p>
              </Link>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="panel p-6">
              <h2 className="font-geom text-lg font-bold text-gray-900 mb-3">O que precisa de você</h2>
              {pendencias.length === 0 ? (
                <p className="text-sm text-green-700 inline-flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Nada pendente agora.</p>
              ) : (
                <ul className="space-y-2">
                  {pendencias.map(p => (
                    <li key={p.texto}><Link href={`/admin/podcast?aba=${p.href}`} className="flex items-start gap-2 text-sm text-gray-800 hover:text-escola-azul"><AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />{p.texto}</Link></li>
                  ))}
                </ul>
              )}
            </section>
            <section className="panel p-6 min-w-0">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-geom text-lg font-bold text-gray-900">Últimas ações</h2>
                <Link href="/admin/podcast?aba=auditoria" className="text-sm text-escola-azul hover:underline">Auditoria completa</Link>
              </div>
              {recentes.length === 0 ? <p className="text-sm text-gray-400">Nada registrado ainda.</p> : (
                <ul className="space-y-2 text-sm">
                  {recentes.map(r => (
                    <li key={r.id} className="flex gap-2 min-w-0">
                      <FileCheck className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="min-w-0"><strong className="font-semibold text-gray-900">{r.atorNome?.split(' ')[0] ?? 'Alguém'}</strong> <span className="text-gray-600">{r.rotulo.toLowerCase()}</span>{r.alvoNome ? <span className="text-gray-800">: {r.alvoNome}</span> : null}
                        <span className="block text-xs text-gray-400">{new Date(r.quando).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span></span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )
    } else if (aba === 'equipe') {
      const [membros, disponiveis, professores, porPessoa] = await Promise.all([
        listarMembros(), alunosDisponiveis(), acesso.gestao ? professoresDisponiveis() : Promise.resolve([]), episodiosPorPessoa(),
      ])
      const monitores = membros.filter(m => m.papel === 'monitor')
      corpo = (
        <>
          {acesso.gestao ? (
            <MonitoresPodcast monitores={monitores} professores={professores} />
          ) : (
            <section className="panel p-6 mb-6">
              <h2 className="font-geom text-lg font-bold text-gray-900 mb-2">Professores monitores</h2>
              <ul className="flex flex-wrap gap-2">{monitores.map(m => <li key={m.id} className="rounded-full border border-gray-200 px-3 py-1 text-sm">{m.nome}</li>)}</ul>
              <p className="text-xs text-gray-500 mt-2">Só a direção adiciona ou tira monitores.</p>
            </section>
          )}
          <EquipePodcast
            alunos={membros.filter(m => m.papel === 'aluno')}
            disponiveis={disponiveis.map(a => ({ id: a.id, nome: a.nome, turma: a.turma, matricula: a.matricula, responsavel: a.responsavel }))}
            anoAtual={ano}
            episodios={porPessoa}
          />
        </>
      )
    } else if (aba === 'revisao' || aba === 'episodios') {
      const [episodios, quadros] = await Promise.all([todosOsEpisodios(), listarQuadros(true)])
      corpo = aba === 'revisao' ? (
        <section>
          <h2 className="font-geom text-lg font-bold text-gray-900 mb-2">Esperando sua revisão</h2>
          <ListaEpisodios eps={episodios.filter(e => e.status === 'revisao')} vazio="Nada esperando. Quando a equipe enviar um episódio, ele aparece aqui." />
        </section>
      ) : (
        <>
          <NovoEpisodio podeAudio quadros={quadros.map(q => ({ chave: q.chave, nome: q.nome, ideia: q.ideia }))} />
          <section>
            <h2 className="font-geom text-lg font-bold text-gray-900 mb-2">Todos os episódios</h2>
            <ListaEpisodios eps={episodios} vazio="Nenhum episódio ainda." />
          </section>
        </>
      )
    } else if (aba === 'quadros') {
      corpo = <QuadrosPodcast quadros={await listarQuadros()} />
    } else {
      const linhas = await listarAuditoria({ pessoa: sp.pessoa?.slice(0, 80), acao: sp.acao?.slice(0, 30), antesDe: /^\d+$/.test(sp.antes ?? '') ? sp.antes : undefined, limite: 100 })
      corpo = <PainelAuditoria linhas={linhas} pessoa={sp.pessoa ?? ''} acao={sp.acao ?? ''} maisAntigo={linhas.length === 100 ? linhas[linhas.length - 1].id : null} />
    }

    return (
      <div className="max-w-6xl mx-auto">
        {cabecalho}
        <AbasPodcast atual={aba} contagem={contagem} />
        {corpo}
      </div>
    )
  }

  const m = acesso.membro
  if (m?.papel === 'aluno') {
    const [eps, quadrosAtivos] = await Promise.all([episodiosDoAluno(user.id), listarQuadros(true)])
    return (
      <div className="max-w-5xl mx-auto">
        {cabecalho}
        {m.liberado && !m.podePostar && (
          <section className="panel p-6 mb-6 border-l-4 border-blue-400">
            <h2 className="font-geom text-lg font-bold text-gray-900">Seu termo está ok!</h2>
            <p className="text-sm text-gray-600 mt-1">Agora falta o monitor liberar você para postar. Assim que ele ligar, o botão de começar um episódio aparece aqui.</p>
          </section>
        )}
        {!m.liberado && (
          <section className="panel p-6 mb-6 border-l-4 border-amber-400">
            <h2 className="font-geom text-lg font-bold text-gray-900">Você está na equipe! Falta só uma coisa.</h2>
            <p className="text-sm text-gray-600 mt-1">
              {m.vencida
                ? `Sua autorização era de ${m.anoLetivo}. Para ${ano}, o monitor precisa de um termo novo assinado pelo seu responsável.`
                : m.autorizacaoStatus === 'enviada'
                  ? 'O termo assinado já chegou. Agora o monitor confere e libera. Falta pouco.'
                  : m.autorizacaoStatus === 'revogada'
                    ? 'A autorização foi revogada. Converse com o monitor do podcast.'
                    : 'Peça ao monitor o termo de autorização, leve para o seu responsável assinar e devolva. Assim que ele conferir, você já pode gravar.'}
            </p>
            <p className="text-xs text-gray-500 mt-2">Situação: {m.vencida ? 'autorização vencida' : ROTULO_AUTORIZACAO[m.autorizacaoStatus]}</p>
          </section>
        )}
        {m.podeCriar && <NovoEpisodio podeAudio={m.podeAudio} quadros={quadrosAtivos.map(q => ({ chave: q.chave, nome: q.nome, ideia: q.ideia }))} />}
        <section>
          <h2 className="font-geom text-lg font-bold text-gray-900 mb-2">Meus episódios</h2>
          <ListaEpisodios eps={eps} vazio={m.podeCriar ? 'Você ainda não começou nenhum. Que tal o primeiro?' : 'Assim que liberar, seus episódios aparecem aqui.'} />
        </section>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {cabecalho}
      <section className="panel p-6">
        <h2 className="font-geom text-lg font-bold text-gray-900">Quer fazer parte?</h2>
        <p className="text-sm text-gray-600 mt-1">
          A equipe do {NOME_PODCAST} é montada pelos professores monitores. Se você gosta de conversar, escrever ou mexer com áudio, fale com eles. Enquanto isso, ouça os episódios na <Link href="/podcast" className="text-escola-azul hover:underline">página do podcast</Link>.
        </p>
      </section>
    </div>
  )
}
