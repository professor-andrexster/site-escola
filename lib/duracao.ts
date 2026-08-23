/**
 * Como a plataforma escreve duração.
 *
 * Os cursos passaram a ser medidos em MINUTOS, não em horas. O motivo é
 * concreto: com a estimativa calibrada em sala, o maior curso tem pouco mais de
 * uma hora e o menor tem vinte minutos. Arredondando para hora, os dois viravam
 * "1 h" — o número perdia a única função que tinha, que é dizer no que a pessoa
 * está se metendo.
 *
 * A regra de escrita segue o que se fala: abaixo de uma hora, minutos; acima,
 * horas com os minutos quando existirem.
 */
export function formatarDuracao(minutos: number | null | undefined): string {
  if (minutos == null || minutos <= 0) return '—'
  if (minutos < 60) return `${minutos} min`

  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  if (resto === 0) return `${horas} h`
  return `${horas} h ${resto} min`
}

/** Versão por extenso, para o certificado, onde a abreviação fica pobre. */
export function duracaoPorExtenso(minutos: number | null | undefined): string {
  if (minutos == null || minutos <= 0) return '—'
  if (minutos < 60) return `${minutos} minuto${minutos === 1 ? '' : 's'}`

  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  const parteHora = `${horas} hora${horas === 1 ? '' : 's'}`
  if (resto === 0) return parteHora
  return `${parteHora} e ${resto} minuto${resto === 1 ? '' : 's'}`
}
