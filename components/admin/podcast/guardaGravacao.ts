/**
 * Guarda a gravação no próprio aparelho (IndexedDB) até o servidor confirmar.
 *
 * Cobre o que o aviso de saída não cobre: botão Voltar do navegador, aba que
 * trava, bateria que acaba, celular que fecha o navegador para liberar memória.
 * Ao voltar para o episódio, a gravação reaparece para salvar.
 *
 * Tudo aqui falha em silêncio (navegação anônima, armazenamento cheio): a
 * gravação continua na tela como antes, só sem a rede de segurança extra.
 */

const BANCO = 'podcast-jb'
const LOJA = 'gravacoes'

function abrir(): Promise<IDBDatabase> {
  return new Promise((ok, falha) => {
    if (typeof indexedDB === 'undefined') return falha(new Error('sem indexedDB'))
    const req = indexedDB.open(BANCO, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(LOJA)
    req.onsuccess = () => ok(req.result)
    req.onerror = () => falha(req.error)
  })
}

async function op<T>(modo: IDBTransactionMode, fn: (l: IDBObjectStore) => IDBRequest<T>): Promise<T | undefined> {
  try {
    const db = await abrir()
    return await new Promise<T | undefined>((ok) => {
      const tx = db.transaction(LOJA, modo)
      const req = fn(tx.objectStore(LOJA))
      req.onsuccess = () => ok(req.result)
      req.onerror = () => ok(undefined)
      tx.oncomplete = () => db.close()
    })
  } catch {
    return undefined
  }
}

type Guardada = { nome: string; tipo: string; blob: Blob; em: number }

export async function guardarGravacao(chave: string, f: File) {
  await op('readwrite', l => l.put({ nome: f.name, tipo: f.type, blob: f, em: Date.now() } satisfies Guardada, chave))
}

export async function lerGravacao(chave: string): Promise<File | null> {
  const g = (await op<Guardada>('readonly', l => l.get(chave))) as Guardada | undefined
  if (!g?.blob) return null
  return new File([g.blob], g.nome, { type: g.tipo })
}

export async function apagarGravacao(chave: string) {
  await op('readwrite', l => l.delete(chave))
}
