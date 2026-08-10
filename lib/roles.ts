import type { Profile } from '@/types/database'

export const ROLE_LABELS: Record<Profile['role'], string> = {
  diretora: 'Diretora',
  vice_diretora: 'Vice Diretora',
  admin: 'Administrador do Sistema',
  professor: 'Professor',
  monitor: 'Monitor',
  bibliotecario: 'Bibliotecário',
  aluno: 'Aluno',
  aluno_fundamental: 'Aluno Fundamental',
}

export const ROLE_COLORS: Record<Profile['role'], string> = {
  diretora: 'bg-escola-vermelho text-white',
  vice_diretora: 'bg-rose-600 text-white',
  admin: 'bg-slate-800 text-white',
  professor: 'bg-blue-600 text-white',
  monitor: 'bg-purple-600 text-white',
  bibliotecario: 'bg-amber-600 text-white',
  aluno: 'bg-green-600 text-white',
  aluno_fundamental: 'bg-teal-600 text-white',
}

/** Papeis com poder de gestao: acesso total ao sistema, aprovacao de qualquer
 * usuario, convite de bibliotecaria e alteracao de parametros globais. */
export const GESTAO_ROLES: Profile['role'][] = ['diretora', 'vice_diretora', 'admin']

export function isGestao(role: Profile['role']): boolean {
  return (GESTAO_ROLES as string[]).includes(role)
}

/** Em qual tela do painel cada papel e listado. Usado para avisar a gestao
 * quando uma conta criada ou promovida vai aparecer em OUTRA tela — sem o
 * aviso, o usuario "some" e parece que a operacao falhou. */
export const TELA_POR_ROLE: Record<Profile['role'], { tela: string; href: string }> = {
  diretora: { tela: 'Administradores', href: '/admin/usuarios' },
  vice_diretora: { tela: 'Administradores', href: '/admin/usuarios' },
  admin: { tela: 'Administradores', href: '/admin/usuarios' },
  professor: { tela: 'Funcionários', href: '/admin/funcionarios' },
  monitor: { tela: 'Funcionários', href: '/admin/funcionarios' },
  bibliotecario: { tela: 'Funcionários', href: '/admin/funcionarios' },
  aluno_fundamental: { tela: 'Funcionários', href: '/admin/funcionarios' },
  aluno: { tela: 'Alunos (ficha do aluno)', href: '/admin/alunos' },
}
