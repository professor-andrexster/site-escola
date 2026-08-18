export const TURMAS = [
  '1° Ano', '2° Ano', '3° Ano',
] as const

export type Turma = typeof TURMAS[number]

export const TURMAS_ALVO = [
  'Todos',
  ...TURMAS,
] as const

/**
 * A turma escolhida numa lista ("2° Ano") cobre a turma da ficha, inclusive
 * quando a ficha guarda o formato antigo com a letra ("2° Ano B"). A base de
 * producao tem os dois formatos convivendo: 29 fichas no formato novo e 3 no
 * antigo. Comparar por igualdade exata deixaria essas 3 de fora.
 */
export function turmaCompativel(turmaEscolhida: string, turmaDaFicha: string | null): boolean {
  if (!turmaDaFicha) return false
  if (turmaEscolhida === turmaDaFicha) return true
  return turmaDaFicha.startsWith(turmaEscolhida + ' ')
}

export function quizMatchesTurma(turmaAlvo: string, studentTurma: string | null): boolean {
  if (turmaAlvo === 'Todos') return !!studentTurma
  return turmaCompativel(turmaAlvo, studentTurma)
}
