import type { Profile } from '@/types/database'

export const ROLE_LABELS: Record<Profile['role'], string> = {
  direcao: 'Direção',
  professor: 'Professor',
  monitor: 'Monitor',
  aluno: 'Aluno',
}

export const ROLE_COLORS: Record<Profile['role'], string> = {
  direcao: 'bg-escola-vermelho text-white',
  professor: 'bg-blue-600 text-white',
  monitor: 'bg-purple-600 text-white',
  aluno: 'bg-green-600 text-white',
}
