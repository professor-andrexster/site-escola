import { createClient } from '@/lib/supabase/server'
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
  const { aulaSlug } = await params
  const supabase = await createClient()
  const { data: aula } = await supabase.from('aulas').select('titulo').eq('slug', aulaSlug).maybeSingle()
  return { title: aula?.titulo ?? 'Aula' }
}

export default async function AulaPlayerPage({ params }: Params) {
  const { cursoSlug, aulaSlug } = await params
  const supabase = await createClient()
  const { user } = await getProfileOrRedirect()

  const { data: curso } = await supabase
    .from('cursos')
    .select('*')
    .eq('slug', cursoSlug)
    .eq('publicado', true)
    .maybeSingle()

  if (!curso) notFound()

  const { data: aulas } = await supabase
    .from('aulas')
    .select('*')
    .eq('curso_id', curso.id)
    .eq('publicado', true)
    .order('ordem')

  const listaAulas = aulas ?? []
  const indiceAtual = listaAulas.findIndex((a) => a.slug === aulaSlug)
  const aula = listaAulas[indiceAtual]

  if (!aula) notFound()

  const proximaAula = listaAulas[indiceAtual + 1] ?? null

  const { data: progresso } = await supabase
    .from('progresso_aulas')
    .select('slide_atual, concluida')
    .eq('user_id', user.id)
    .eq('aula_id', aula.id)
    .maybeSingle()

  // Aula em slides (cursos importados de pptx) usa o SlideViewer
  if (aula.slides_urls && aula.slides_urls.length > 0) {
    return (
      <SlideViewer
        userId={user.id}
        cursoId={curso.id}
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
  const { data: desafios } = await supabase
    .from('curso_desafios')
    .select('id, titulo, enunciado, tipo, ordem')
    .eq('aula_id', aula.id)
    .order('ordem')

  return (
    <ConteudoViewer
      userId={user.id}
      cursoId={curso.id}
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
