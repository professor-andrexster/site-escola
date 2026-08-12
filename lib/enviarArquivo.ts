/**
 * Envia um arquivo e devolve a URL pública, ou a mensagem de erro.
 *
 * As dez telas que enviavam arquivo repetiam o mesmo bloco: montar o caminho,
 * chamar o bucket, pedir a URL pública. O caminho agora é decidido no servidor,
 * então do lado do navegador sobrou isto — uma função.
 */
export type Finalidade = 'avatar' | 'noticia' | 'curso' | 'projeto' | 'desafio' | 'obra'

export async function enviarArquivo(
  finalidade: Finalidade,
  arquivo: File,
  extras: Record<string, string> = {}
): Promise<{ url: string } | { erro: string }> {
  const form = new FormData()
  form.append('finalidade', finalidade)
  form.append('arquivo', arquivo)
  for (const [chave, valor] of Object.entries(extras)) form.append(chave, valor)

  const res = await fetch('/api/arquivos', { method: 'POST', body: form })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) return { erro: json.error ?? 'Erro ao enviar o arquivo.' }
  return { url: json.url as string }
}
