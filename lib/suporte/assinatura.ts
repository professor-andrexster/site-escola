import { createHmac } from 'node:crypto'

/**
 * Assinatura do widget de Chamados (Bussola).
 *
 * Contrato do script (`chamado.js`, servido por andredev.nexialabs.com.br):
 * a assinatura enviada em `data-assinatura` é
 * `HMAC-SHA256(segredo, "{usuarioId}:{dia}").digest('base64url')`, calculada
 * aqui no servidor — o segredo (`CHAMADOS_SEGREDO`) nunca vai para o cliente.
 *
 * `dia` usa o fuso de São Paulo porque é o dia civil que o script do Bussola
 * espera, não o dia UTC (que vira o dia seguinte às 21h em SP).
 */

export function diaSaoPaulo(agora: Date = new Date()): string {
  return agora.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
}

export function assinarChamados(
  segredo: string,
  usuarioId: string,
  dia: string = diaSaoPaulo()
): string {
  return createHmac('sha256', segredo).update(`${usuarioId}:${dia}`).digest('base64url')
}
