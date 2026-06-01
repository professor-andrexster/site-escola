export const TURMAS = [
  '1° Ano A', '1° Ano B', '1° Ano C',
  '2° Ano A', '2° Ano B', '2° Ano C',
  '3° Ano A', '3° Ano B', '3° Ano C',
] as const

export type Turma = typeof TURMAS[number]

export const TURMAS_ALVO = [
  'Todos',
  '1° Ano', '2° Ano', '3° Ano',
  ...TURMAS,
] as const

export function quizMatchesTurma(turmaAlvo: string, studentTurma: string | null): boolean {
  if (!studentTurma) return false
  if (turmaAlvo === 'Todos') return true
  if (turmaAlvo === studentTurma) return true
  if (studentTurma.startsWith(turmaAlvo + ' ')) return true
  return false
}
