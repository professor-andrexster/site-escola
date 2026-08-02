import type { SupabaseClient } from '@supabase/supabase-js'

export interface ProgressoCurso {
  id: string
  titulo: string
  slug: string
  categoria: string | null
  totalAulas: number
  aulasConcluidas: number
  percentual: number
}

/** Progresso do usuario em cada curso publicado, na mesma logica usada no
 * catalogo de cursos do proprio aluno (app/admin/cursos/(catalogo)/page.tsx),
 * reaproveitada aqui tambem para a visao administrativa na ficha do aluno. */
export async function progressoCursosPorUsuario(supabase: SupabaseClient, userId: string): Promise<ProgressoCurso[]> {
  const [{ data: cursos }, { data: aulas }, { data: progresso }] = await Promise.all([
    supabase.from('cursos').select('id, titulo, slug, categoria').eq('publicado', true).order('ordem'),
    supabase.from('aulas').select('id, curso_id').eq('publicado', true),
    supabase.from('progresso_aulas').select('aula_id').eq('user_id', userId).eq('concluida', true),
  ])

  const aulasPorCurso = new Map<string, number>()
  for (const a of aulas ?? []) {
    aulasPorCurso.set(a.curso_id, (aulasPorCurso.get(a.curso_id) ?? 0) + 1)
  }

  const aulaIdParaCurso = new Map<string, string>()
  for (const a of aulas ?? []) aulaIdParaCurso.set(a.id, a.curso_id)

  const concluidasPorCurso = new Map<string, number>()
  for (const p of progresso ?? []) {
    const cursoId = aulaIdParaCurso.get(p.aula_id)
    if (!cursoId) continue
    concluidasPorCurso.set(cursoId, (concluidasPorCurso.get(cursoId) ?? 0) + 1)
  }

  return (cursos ?? []).map(c => {
    const totalAulas = aulasPorCurso.get(c.id) ?? 0
    const aulasConcluidas = concluidasPorCurso.get(c.id) ?? 0
    return {
      id: c.id,
      titulo: c.titulo,
      slug: c.slug,
      categoria: c.categoria,
      totalAulas,
      aulasConcluidas,
      percentual: totalAulas > 0 ? Math.round((aulasConcluidas / totalAulas) * 100) : 0,
    }
  })
}
