import { createClient } from '@/lib/supabase/server'
import PageLayout from '@/components/PageLayout'
import VitrineCursos from '@/components/cursos/VitrineCursos'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cursos — E.E. Dr. João Beraldo',
  description: 'Conheça os cursos em vídeo e slides da E.E. Dr. João Beraldo, feitos pelos professores para alunos e equipe.',
}

export const revalidate = 60

export default async function CursosPublicoPage() {
  const supabase = await createClient()

  const [{ data: cursos }, { data: aulas }] = await Promise.all([
    supabase.from('cursos').select('*').eq('publicado', true).order('ordem'),
    supabase.from('aulas').select('id, curso_id').eq('publicado', true),
  ])

  const aulasPorCurso = new Map<string, number>()
  for (const a of aulas ?? []) {
    aulasPorCurso.set(a.curso_id, (aulasPorCurso.get(a.curso_id) ?? 0) + 1)
  }

  const cursosComContagem = (cursos ?? []).map(c => ({
    ...c,
    totalAulas: aulasPorCurso.get(c.id) ?? 0,
  }))

  return (
    <PageLayout>
      <VitrineCursos cursos={cursosComContagem} />
    </PageLayout>
  )
}
