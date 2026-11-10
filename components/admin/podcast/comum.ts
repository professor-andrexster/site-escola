export const CAMPO =
  'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-escola-azul/30'
export const BOTAO =
  'inline-flex items-center justify-center gap-2 bg-escola-azul text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-escola-azul-medio transition-colors disabled:opacity-50 foco-painel'
export const BOTAO_LEVE =
  'inline-flex items-center justify-center gap-2 border border-gray-200 bg-white px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:border-escola-azul transition-colors disabled:opacity-50 foco-painel'

/** fetch que nunca lança: devolve { ok, dados, erro } com mensagem pronta para a tela. */
export async function chamar(url: string, init: RequestInit): Promise<{ ok: true; dados: any } | { ok: false; erro: string }> {
  try {
    const res = await fetch(url, init)
    const dados = await res.json().catch(() => ({}))
    if (!res.ok || dados?.ok === false) return { ok: false, erro: dados?.error ?? 'Não deu certo. Tente de novo.' }
    return { ok: true, dados }
  } catch {
    return { ok: false, erro: 'Sem conexão com o servidor. Nada foi perdido: tente de novo quando a internet voltar.' }
  }
}

export const json = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})
