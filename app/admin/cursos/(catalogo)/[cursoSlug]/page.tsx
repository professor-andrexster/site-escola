import { buscarPorSlug, cursoParaAluno } from '@/lib/db/cursos'
import { getProfileOrRedirect } from '@/lib/profile'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Award, Lock, Play, Trophy } from 'lucide-react'
import AulaListItem, { type AulaStatus } from '@/components/cursos/AulaListItem'
import ProvaFinal from '@/components/cursos/ProvaFinal'
import DesafioFinal from '@/components/cursos/DesafioFinal'
import { desafioFinalDoCurso, envioDoAluno } from '@/lib/db/desafio-curso'
import type { Metadata } from 'next'
import { formatarDuracao } from '@/lib/duracao'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ cursoSlug: string }> }): Promise<Metadata> {
  const { cursoSlug } = await params
  const curso = await buscarPorSlug(cursoSlug)
  return { title: curso?.titulo ?? 'Curso' }
}

export default async function CursoDetalhePage({ params }: { params: Promise<{ cursoSlug: string }> }) {
  const { cursoSlug } = await params
  const { user } = await getProfileOrRedirect()

  // Uma funcao de camada em vez de cinco consultas. A contagem de perguntas
  // da prova vem so como numero: o gabarito nunca sai daqui.
  const dados = await cursoParaAluno(cursoSlug, user.id)
  if (!dados) notFound()
  const { curso, aulas, progresso, desafios: desafiosCurso, totalPerguntasProva, certificado } = dados

  // Desafio final: o caminho novo para o certificado. Quando o curso tem um,
  // ele substitui a prova de multipla escolha — sao dois jeitos de provar a
  // mesma coisa, e mostrar os dois confundiria.
  const desafioFinal = await desafioFinalDoCurso(curso.id)
  const envioFinal = desafioFinal ? await envioDoAluno(desafioFinal.id, user.id) : null

  const progressoMap = new Map(progresso.map(p => [p.aula_id, p]))

  function statusDe(aulaId: string): AulaStatus {
    const p = progressoMap.get(aulaId)
    if (!p) return 'nao_iniciada'
    if (p.concluida) return 'concluida'
    return 'em_andamento'
  }

  const listaAulas = aulas
  const primeiraNaoConcluida = listaAulas.find((a) => statusDe(a.id) !== 'concluida') ?? listaAulas[0]

  /**
   * As aulas que faltam, com a posição de cada uma.
   *
   * A caixa trancada dizia só "conclua as N aulas", e quem tinha 4 de 6 não
   * descobria QUAIS duas faltavam sem abrir uma por uma. Aconteceu de verdade:
   * duas aulas paradas no meio dos slides seguravam o desafio final.
   */
  const aulasFaltando = listaAulas
    .map((a, i) => ({ ...a, numero: i + 1 }))
    .filter((a) => statusDe(a.id) !== 'concluida')
  const totalConcluidas = listaAulas.filter((a) => statusDe(a.id) === 'concluida').length
  const progressoPct = listaAulas.length > 0 ? Math.round((totalConcluidas / listaAulas.length) * 100) : 0

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <Link href="/admin/cursos" className="inline-flex items-center gap-1.5 text-white/55 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar aos cursos
      </Link>

      {/*
        A capa fica AO LADO do texto, não atrás dele.

        Ela já traz a sigla, o título e a categoria desenhados — sobrepor o
        mesmo título por cima escrevia tudo duas vezes na mesma área, e o
        gradiente ainda tinha de apagar a arte para o texto caber. Ao lado, a
        capa é lida como o cartaz do curso e o texto respira.
      */}
      <div className="flex flex-col sm:flex-row gap-5 md:gap-6 mb-8">
        {curso.capa_url && (
          <div className="relative w-full sm:w-80 aspect-video rounded-xl overflow-hidden bg-black/40 ring-1 ring-white/10 flex-shrink-0">
            <Image src={curso.capa_url} alt="" fill sizes="(max-width: 640px) 100vw, 320px" className="object-cover" />
          </div>
        )}
        <div className="min-w-0 flex flex-col justify-center">
          {curso.categoria && (
            <p className="text-curso-ciano text-xs font-jetbrains uppercase tracking-widest mb-1.5">{curso.categoria}</p>
          )}
          <h1 className="text-2xl md:text-3xl font-black text-white font-geom mb-2 text-balance">{curso.titulo}</h1>
          <p className="text-white/70 text-sm max-w-2xl mb-4 leading-relaxed">{curso.descricao}</p>
          <div className="flex items-center gap-2">
            <Image src="/cursos/avatar.png" alt="" width={26} height={26} className="rounded-full ring-1 ring-white/15" />
            <span className="text-white/70 text-xs font-semibold">por {curso.autor_nome}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-white/55 font-jetbrains mb-1.5">
            <span>{totalConcluidas} de {listaAulas.length} aulas concluídas</span>
            <span>{progressoPct}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-curso-azul rounded-full transition-all" style={{ width: `${progressoPct}%` }} />
          </div>
        </div>
        {primeiraNaoConcluida && (
          <Link
            href={`/admin/cursos/${curso.slug}/${primeiraNaoConcluida.slug}`}
            className="inline-flex items-center gap-2 bg-curso-azul hover:bg-curso-azul-claro text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex-shrink-0"
          >
            <Play className="w-4 h-4" />
            {totalConcluidas === 0 ? 'Começar' : 'Continuar'}
          </Link>
        )}
      </div>

      <div className="space-y-2.5">
        {listaAulas.map((aula, i) => (
          <AulaListItem
            key={aula.id}
            aula={aula}
            numero={i + 1}
            status={statusDe(aula.id)}
            href={`/admin/cursos/${curso.slug}/${aula.slug}`}
          />
        ))}
      </div>

      {/* Desafio final: o caminho do certificado quando o curso tem um.
          Estava carregado mas nunca renderizado — por isso nenhum aluno
          conseguia entregar, em curso nenhum, e não havia um único envio no
          banco. Vem antes da prova, e a prova só aparece se não houver
          desafio (o comentário do topo explica por quê). */}
      {desafioFinal && (
        <section className="mt-10">
          <h2 className="text-white font-black text-lg font-geom flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-curso-ciano" />
            Certificado do curso
          </h2>
          {progressoPct === 100 || envioFinal || certificado ? (
            <DesafioFinal
              desafio={desafioFinal}
              envioInicial={
                envioFinal
                  ? { ...envioFinal, enviado_em: envioFinal.enviado_em.toISOString() }
                  : null
              }
              certificadoCodigo={certificado?.codigo ?? null}
            />
          ) : (
            <AulasQueFaltam
              cursoSlug={curso.slug}
              aulas={aulasFaltando}
              oQueLibera="o desafio final e o certificado do curso"
            />
          )}
        </section>
      )}

      {/* Prova final e certificado — só quando o curso não tem desafio final */}
      {!desafioFinal && (totalPerguntasProva ?? 0) > 0 && (
        <section className="mt-10">
          <h2 className="text-white font-black text-lg font-geom flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-curso-ciano" />
            Certificado do curso
          </h2>
          {certificado ? (
            <div className="bg-white/5 border border-green-400/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-start">
                <p className="text-white font-bold font-geom">Curso concluído com nota {certificado.nota}</p>
                <p className="text-white/50 text-sm mt-0.5">Certificado de {formatarDuracao(certificado.carga_min ?? certificado.carga_horaria * 60)} emitido em seu nome.</p>
              </div>
              <Link
                href={`/certificado/${certificado.codigo}`}
                className="inline-flex items-center gap-2 bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-green-800 transition-colors flex-shrink-0"
              >
                <Award className="w-4 h-4" />
                Ver Certificado
              </Link>
            </div>
          ) : progressoPct === 100 ? (
            <ProvaFinal cursoId={curso.id} totalPerguntas={totalPerguntasProva ?? 0} />
          ) : (
            <AulasQueFaltam
              cursoSlug={curso.slug}
              aulas={aulasFaltando}
              oQueLibera="a prova final e o certificado do curso"
            />
          )}
        </section>
      )}

      {(desafiosCurso ?? []).length > 0 && (
        <section className="mt-10">
          <h2 className="text-white font-black text-lg font-geom flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Projeto do curso
          </h2>
          <div className="space-y-3">
            {(desafiosCurso ?? []).map(d => (
              <div key={d.id} className="bg-white/5 border border-yellow-400/20 rounded-2xl p-5">
                <h3 className="text-white font-bold mb-2">{d.titulo}</h3>
                <div
                  className="[&_p]:text-white/70 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:text-white/70 [&_li]:text-sm [&_ol]:list-decimal [&_ol]:pl-5 [&_code]:font-jetbrains [&_code]:text-curso-ciano [&_pre]:bg-black/50 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:text-sm [&_pre]:text-white/80 text-white/70 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: d.enunciado }}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

/**
 * Lista as aulas que ainda faltam, com link direto para cada uma.
 *
 * Mostra no máximo cinco: com mais que isso a caixa vira uma segunda lista de
 * aulas, e a página já tem uma logo acima.
 */
function AulasQueFaltam({
  cursoSlug,
  aulas,
  oQueLibera,
}: {
  cursoSlug: string
  aulas: { id: string; slug: string; titulo: string; numero: number }[]
  oQueLibera: string
}) {
  const MOSTRAR = 5
  const visiveis = aulas.slice(0, MOSTRAR)
  const resto = aulas.length - visiveis.length

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <p className="flex items-center gap-2 text-white/60 text-sm mb-3">
        <Lock className="w-4 h-4 text-white/50 flex-shrink-0" />
        {aulas.length === 1 ? (
          <>Falta <strong className="text-white">1 aula</strong> para liberar {oQueLibera}.</>
        ) : (
          <>Faltam <strong className="text-white">{aulas.length} aulas</strong> para liberar {oQueLibera}.</>
        )}
      </p>

      <ul className="space-y-1.5">
        {visiveis.map((a) => (
          <li key={a.id}>
            <Link
              href={`/admin/cursos/${cursoSlug}/${a.slug}`}
              className="group flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/5 transition-colors"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full border border-white/20 text-white/50 text-xs font-jetbrains flex items-center justify-center">
                {a.numero}
              </span>
              <span className="text-white/70 text-sm group-hover:text-white transition-colors flex-1 min-w-0 truncate">
                {a.titulo}
              </span>
              <span className="text-curso-ciano/90 group-hover:text-curso-ciano text-xs flex-shrink-0 transition-colors">
                continuar
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {resto > 0 && (
        <p className="text-white/50 text-xs mt-2 ps-3">e mais {resto}.</p>
      )}

      <p className="text-white/50 text-xs mt-3 ps-3">
        A aula é marcada como concluída quando você chega no último slide.
      </p>
    </div>
  )
}
