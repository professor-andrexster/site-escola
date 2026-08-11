import { cursoComAulas, progressoDaAula, desafiosDaAula } from '@/lib/db/cursos'
import { getProfileOrRedirect } from '@/lib/profile'
import { notFound } from 'next/navigation'
import SlideViewer from '@/components/cursos/SlideViewer'
import ConteudoViewer from '@/components/cursos/ConteudoViewer'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface Params {
  params: Promise<{ cursoSlug: string; aulaSlug: string }>
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { cursoSlug, aulaSlug } = await params
  const dados = await cursoComAulas(cursoSlug)
  const aula = dados?.aulas.find(a => a.slug === aulaSlug) ?? null
  return { title: aula?.titulo ?? 'Aula' }
}

export default async function AulaPlayerPage({ params }: Params) {
  const { cursoSlug, aulaSlug } = await params
  const { user } = await getProfileOrRedirect()

  const dados = await cursoComAulas(cursoSlug)
  if (!dados) notFound()
  const { curso, aulas: listaAulas } = dados
  const indiceAtual = listaAulas.findIndex((a) => a.slug === aulaSlug)
  const aula = listaAulas[indiceAtual]

  if (!aula) notFound()

  const proximaAula = listaAulas[indiceAtual + 1] ?? null

  const progresso = await progressoDaAula(user.id, aula.id)

  // Aula em slides (cursos importados de pptx) usa o SlideViewer
  if (aula.slides_urls && aula.slides_urls.length > 0) {
    return (
      <SlideViewer
        cursoSlug={curso.slug}
        cursoTitulo={curso.titulo}
        aulaId={aula.id}
        aulaTitulo={aula.titulo}
        slidesUrls={aula.slides_urls}
        initialSlideAtual={progresso?.slide_atual ?? 0}
        initialConcluida={progresso?.concluida ?? false}
        nextAulaSlug={proximaAula?.slug ?? null}
      />
    )
  }

  // Aula em texto: busca os desafios (sem gabarito, coluna bloqueada para alunos)
  const desafios = await desafiosDaAula(aula.id)

  return (
    <ConteudoViewer
      cursoSlug={curso.slug}
      cursoTitulo={curso.titulo}
      aulaId={aula.id}
      aulaTitulo={aula.titulo}
      duracaoMin={aula.duracao_estimada_min}
      conteudo={aula.conteudo ?? '<p>Esta aula ainda não tem conteúdo.</p>'}
      desafios={desafios ?? []}
      initialConcluida={progresso?.concluida ?? false}
      nextAulaSlug={proximaAula?.slug ?? null}
    />
  )
}
