import Link from 'next/link'
import type { Metadata } from 'next'
import { ExternalLink, Mic, Radio } from 'lucide-react'
import { getProfileOrRedirect } from '@/lib/profile'
import {
  acessoDe, alunosDisponiveis, episodiosDoAluno, listarMembros, professoresDisponiveis, todosOsEpisodios,
} from '@/lib/podcast/dados'
import { NOME_PODCAST, ROTULO_AUTORIZACAO, ROTULO_EPISODIO, anoLetivoAtual, nomeDoQuadro, type Episodio } from '@/lib/podcast/tipos'
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
                {[nomeDoQuadro(e.quadro), `por ${e.autorNome.split(' ')[0]}`, e.audioUrl ? 'com áudio' : 'sem áudio'].filter(Boolean).join(' · ')}
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
export default async function PodcastPage() {
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
    const [membros, episodios, disponiveis, professores] = await Promise.all([
      listarMembros(), todosOsEpisodios(), alunosDisponiveis(), acesso.gestao ? professoresDisponiveis() : Promise.resolve([]),
    ])
    const esperando = episodios.filter(e => e.status === 'revisao')
    return (
      <div className="max-w-5xl mx-auto">
        {cabecalho}
        {acesso.gestao && <MonitoresPodcast monitores={membros.filter(m => m.papel === 'monitor')} professores={professores} />}

        <section className="mb-6">
          <h2 className="font-geom text-lg font-bold text-gray-900 mb-2">Esperando sua revisão {esperando.length > 0 && <span className="ml-1 text-sm bg-amber-100 text-amber-800 rounded-full px-2 py-0.5">{esperando.length}</span>}</h2>
          <ListaEpisodios eps={esperando} vazio="Nada esperando. Quando a equipe enviar um episódio, ele aparece aqui." />
        </section>

        <EquipePodcast
          alunos={membros.filter(m => m.papel === 'aluno')}
          disponiveis={disponiveis.map(a => ({ id: a.id, nome: a.nome, turma: a.turma, matricula: a.matricula, responsavel: a.responsavel }))}
          anoAtual={ano}
        />

        <NovoEpisodio />

        <section className="mb-6">
          <h2 className="font-geom text-lg font-bold text-gray-900 mb-2">Todos os episódios</h2>
          <ListaEpisodios eps={episodios.filter(e => e.status !== 'revisao')} vazio="Nenhum episódio ainda." />
        </section>
      </div>
    )
  }

  const m = acesso.membro
  if (m?.papel === 'aluno') {
    const eps = await episodiosDoAluno(user.id)
    return (
      <div className="max-w-5xl mx-auto">
        {cabecalho}
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
        {m.liberado && <NovoEpisodio />}
        <section>
          <h2 className="font-geom text-lg font-bold text-gray-900 mb-2">Meus episódios</h2>
          <ListaEpisodios eps={eps} vazio={m.liberado ? 'Você ainda não começou nenhum. Que tal o primeiro?' : 'Assim que liberar, seus episódios aparecem aqui.'} />
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
