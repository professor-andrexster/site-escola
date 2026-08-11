import { existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

const RAIZ = pathToFileURL(process.cwd() + '/').href

/**
 * `@/lib/db` vira o caminho absoluto, e como `lib/db` e um diretorio E um
 * arquivo (`lib/db.ts`), a extensao precisa ser resolvida na mao: o Node so
 * completa extensao em CommonJS.
 */
function comExtensao(url) {
  const caminho = fileURLToPath(url)
  if (existsSync(caminho) && !existsSync(caminho + '.ts')) return url
  for (const tentativa of [`${caminho}.ts`, `${caminho}.tsx`, `${caminho}/index.ts`]) {
    if (existsSync(tentativa)) return pathToFileURL(tentativa).href
  }
  return url
}

export async function resolve(especificador, contexto, proximo) {
  if (especificador.startsWith('@/')) {
    return proximo(comExtensao(new URL(especificador.slice(2), RAIZ).href), contexto)
  }
  return proximo(especificador, contexto)
}
