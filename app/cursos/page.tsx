import { createClient } from '@/lib/supabase/server'
import PageLayout from '@/components/PageLayout'
import VitrineCursosComModal from '@/components/cursos/VitrineCursosComModal'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cursos — E.E. Dr. João Beraldo',
  description: 'Conheça os cursos em vídeo e slides da E.E. Dr. João Beraldo, feitos pelos professores para alunos e equipe.',
}

export const revalidate = 60

export default async function CursosPublicoPage() {
  const supabase = await createClient()

  const [{ data: cursos }, { data: aulas }, { data: desafios }] = await Promise.all([
    supabase.from('cursos').select('*').eq('publicado', true).order('ordem'),
    supabase.from('aulas').select('id, titulo, ordem, curso_id, duracao_estimada_min').eq('publicado', true).order('ordem'),
    supabase.from('curso_desafios').select('id, aula_id, curso_id'),
  ])

  const aulasPorCurso = new Map<string, number>()
  const aulasDetalhesPorCurso: { [key: string]: any[] } = {}
  const desafiosPorAula = new Map<string, number>()

  for (const d of desafios ?? []) {
    if (!d.aula_id) continue
    desafiosPorAula.set(d.aula_id, (desafiosPorAula.get(d.aula_id) ?? 0) + 1)
  }

  for (const a of aulas ?? []) {
    aulasPorCurso.set(a.curso_id, (aulasPorCurso.get(a.curso_id) ?? 0) + 1)
    if (!aulasDetalhesPorCurso[a.curso_id]) {
      aulasDetalhesPorCurso[a.curso_id] = []
    }
    aulasDetalhesPorCurso[a.curso_id].push({
      ...a,
      totalDesafios: desafiosPorAula.get(a.id) ?? 0,
    })
  }

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
