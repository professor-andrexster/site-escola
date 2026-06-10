export const TURMAS = [
  '1° Ano', '2° Ano', '3° Ano',
] as const

export type Turma = typeof TURMAS[number]

export const TURMAS_ALVO = [
  'Todos',
  ...TURMAS,
] as const

export function quizMatchesTurma(turmaAlvo: string, studentTurma: string | null): boolean {
  if (!studentTurma) return false
  if (turmaAlvo === 'Todos') return true
  if (turmaAlvo === studentTurma) return true
  // Compatibilidade com turmas antigas no formato "1° Ano A"
  if (studentTurma.startsWith(turmaAlvo + ' ')) return true
  return false
}
