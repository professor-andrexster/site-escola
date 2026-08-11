import { catalogoPublico } from '@/lib/db/cursos'
import PageLayout from '@/components/PageLayout'
import VitrineCursosComModal from '@/components/cursos/VitrineCursosComModal'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cursos',
  description: 'Conheça os cursos em vídeo e slides da E.E. Dr. João Beraldo, feitos pelos professores para alunos e equipe.',
}

export const revalidate = 60

export default async function CursosPublicoPage() {
  // A camada ja devolve as aulas publicadas e a contagem de desafios de cada
  // uma; os tres Maps que existiam aqui viraram um join.
  const cursos = await catalogoPublico()
  const aulasPorCurso = new Map(cursos.map(c => [c.id, c.totalAulas]))
  const aulasDetalhesPorCurso = Object.fromEntries(cursos.map(c => [c.id, c.aulas]))

  const cursosComContagem = (cursos ?? []).map(c => ({
    ...c,
    totalAulas: aulasPorCurso.get(c.id) ?? 0,
  }))

  return (
    <PageLayout>
      <VitrineCursosComModal cursos={cursosComContagem} aulasPorCurso={aulasDetalhesPorCurso} />
    </PageLayout>
  )
}
