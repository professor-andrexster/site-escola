/**
 * Endereco publico do site, para montar links que vao por e-mail.
 *
 * Nao use `new URL(request.url).origin` atras do nginx: ali isso e o endereco
 * INTERNO de escuta do processo. O primeiro e-mail de redefinicao de verdade
 * saiu com `https://0.0.0.0:3004` no link, que nao abre em lugar nenhum.
 *
 * Ordem, da mais confiavel para a menos:
 *   1. APP_URL — o que a producao configurou, nao depende de requisicao
 *   2. o Host repassado pelo nginx, que e o dominio de verdade
 *   3. o Origin, que falta em chamada sem navegador e alguns proxies removem
 */
export function enderecoPublico(request: Request): string {
  const configurado = process.env.APP_URL?.replace(/\/$/, '')
  if (configurado) return configurado

  const host = request.headers.get('host')
  if (host) {
    const protocolo = request.headers.get('x-forwarded-proto') ?? 'https'
    return `${protocolo}://${host}`
  }

  return request.headers.get('origin') ?? new URL(request.url).origin
}
