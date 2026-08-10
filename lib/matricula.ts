/**
 * A base guarda matrículas em maiúsculas (ALU20260001), mas quem digita usa
 * caixa livre. Toda gravação e toda busca passa por aqui, senão a comparação
 * exata do banco recusa aluno real (visto no log: "alu20260015" negado com
 * ALU20260015 presente na base).
 */
export function normalizarMatricula(valor: string): string {
  return valor.trim().toUpperCase()
}
