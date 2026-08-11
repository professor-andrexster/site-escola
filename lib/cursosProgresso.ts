import { progressoPorUsuario } from '@/lib/db/cursos'

export interface ProgressoCurso {
  id: string
  titulo: string
  slug: string
  categoria: string | null
  totalAulas: number
  aulasConcluidas: number
  percentual: number
}

/**
 * Progresso do aluno em cada curso publicado.
 *
 * A implementacao mudou para lib/db/cursos. Este arquivo continua existindo
 * porque tres telas importam por aqui — e porque o nome descreve o dominio
 * melhor que "cursos.progressoPorUsuario". Nao recebe mais o client do
 * Supabase por parametro.
 */
export async function progressoCursosPorUsuario(userId: string): Promise<ProgressoCurso[]> {
  return progressoPorUsuario(userId)
}
