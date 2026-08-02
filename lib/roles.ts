import type { Profile } from '@/types/database'

export const ROLE_LABELS: Record<Profile['role'], string> = {
  diretora: 'Diretora',
  vice_diretora: 'Vice Diretora',
  admin: 'Administrador do Sistema',
  professor: 'Professor',
  monitor: 'Monitor',
  bibliotecario: 'Bibliotecário',
  aluno: 'Aluno',
}

export const ROLE_COLORS: Record<Profile['role'], string> = {
  diretora: 'bg-escola-vermelho text-white',
  vice_diretora: 'bg-rose-600 text-white',
  admin: 'bg-slate-800 text-white',
  professor: 'bg-blue-600 text-white',
  monitor: 'bg-purple-600 text-white',
  bibliotecario: 'bg-amber-600 text-white',
  aluno: 'bg-green-600 text-white',
}

/** Papeis com poder de gestao: acesso total ao sistema, aprovacao de qualquer
 * usuario, convite de bibliotecaria e alteracao de parametros globais. */
export const GESTAO_ROLES: Profile['role'][] = ['diretora', 'vice_diretora', 'admin']

export function isGestao(role: Profile['role']): boolean {
  return (GESTAO_ROLES as string[]).includes(role)
}
