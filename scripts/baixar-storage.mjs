/**
 * Baixa os cinco buckets do Supabase Storage para o disco e reescreve as URLs
 * gravadas no banco.
 *
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... UPLOAD_ROOT=/var/www/escola/data/uploads \
 *   DATABASE_URL=mysql://... node scripts/baixar-storage.mjs [--so-listar]
 *
 * Os arquivos caem em `<UPLOAD_ROOT>/legado/<bucket>/<caminho original>`, com a
 * estrutura de pastas do bucket preservada. É de propósito: a reescrita das
 * URLs vira uma troca de prefixo, sem precisar casar arquivo por arquivo, e não
 * há risco de colidir com nome de arquivo novo (que segue outro esquema).
 *
 * `--so-listar` conta e mede tudo sem baixar nada nem tocar no banco. Rode
 * primeiro: é o que diz se o disco aguenta.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const BUCKETS = ['imagens', 'cursos-slides', 'projetos', 'desafios', 'biblioteca']
const SO_LISTAR = process.argv.includes('--so-listar')

const URL_BASE = process.env.SUPABASE_URL
const CHAVE = process.env.SUPABASE_SERVICE_ROLE_KEY
const RAIZ = process.env.UPLOAD_ROOT

if (!URL_BASE || !CHAVE) {
  console.error('Faltam SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(2)
}
if (!SO_LISTAR && !RAIZ) {
  console.error('Falta UPLOAD_ROOT (onde os arquivos vão cair).')
  process.exit(2)
}

const cabecalhos = { apikey: CHAVE, Authorization: `Bearer ${CHAVE}` }

/** A API de listagem é paginada e não desce sozinha nas subpastas. */
async function listar(bucket, prefixo = '') {
  const achados = []
  let deslocamento = 0

  for (;;) {
    const res = await fetch(`${URL_BASE}/storage/v1/object/list/${bucket}`, {
      method: 'POST',
      headers: { ...cabecalhos, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix: prefixo, limit: 100, offset: deslocamento }),
    })
    if (!res.ok) throw new Error(`listar ${bucket}/${prefixo}: ${res.status} ${await res.text()}`)

    const pagina = await res.json()
    if (!pagina.length) break

    for (const item of pagina) {
      const caminho = prefixo ? `${prefixo}/${item.name}` : item.name
      // Pasta vem sem metadata; arquivo vem com tamanho.
      if (item.id === null || !item.metadata) achados.push(...(await listar(bucket, caminho)))
      else achados.push({ caminho, tamanho: item.metadata.size ?? 0 })
    }

    if (pagina.length < 100) break
    deslocamento += pagina.length
  }
  return achados
}

async function baixar(bucket, caminho) {
  const res = await fetch(
    `${URL_BASE}/storage/v1/object/${bucket}/${caminho.split('/').map(encodeURIComponent).join('/')}`,
    { headers: cabecalhos }
  )
  if (!res.ok) throw new Error(`baixar ${bucket}/${caminho}: ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

const mb = n => (n / 1024 / 1024).toFixed(1)

let total = 0
let bytes = 0
let falhas = 0

for (const bucket of BUCKETS) {
  let arquivos
  try {
    arquivos = await listar(bucket)
  } catch (erro) {
    console.error(`  ${bucket}: FALHOU — ${erro.message}`)
    falhas++
    continue
  }

  const soma = arquivos.reduce((s, a) => s + a.tamanho, 0)
  console.log(`  ${bucket}: ${arquivos.length} arquivo(s), ${mb(soma)} MB`)
  total += arquivos.length
  bytes += soma

  if (SO_LISTAR) continue

  for (const arquivo of arquivos) {
    const destino = path.join(RAIZ, 'legado', bucket, arquivo.caminho)
    try {
      await mkdir(path.dirname(destino), { recursive: true })
      await writeFile(destino, await baixar(bucket, arquivo.caminho))
    } catch (erro) {
      console.error(`    falhou: ${arquivo.caminho} — ${erro.message}`)
      falhas++
    }
  }
}

console.log(`\ntotal: ${total} arquivo(s), ${mb(bytes)} MB${falhas ? ` — ${falhas} falha(s)` : ''}`)

if (SO_LISTAR) {
  console.log('\n(--so-listar: nada foi baixado e o banco não foi tocado)')
  process.exit(falhas ? 1 : 0)
}

// ------------------------------------------------------------- URLs no banco
//
// As oito colunas que guardam URL de arquivo. `slides_urls` é JSON com uma
// lista, então a troca é dentro do texto — REPLACE resolve os dois casos.

const PREFIXO_ANTIGO = `${URL_BASE}/storage/v1/object/public/`
const PREFIXO_NOVO = '/arquivos/legado/'

const COLUNAS = [
  ['profiles', 'avatar_url'],
  ['alunos', 'foto_url'],
  ['noticias', 'imagem_url'],
  ['cursos', 'capa_url'],
  ['aulas', 'slides_urls'],
  ['projetos', 'imagem_url'],
  ['entregas', 'arquivo_url'],
  ['biblioteca_obras', 'capa_url'],
]

console.log('\nSQL de reescrita das URLs (confira e rode depois de importar os dados):\n')
for (const [tabela, coluna] of COLUNAS) {
  console.log(
    `UPDATE \`${tabela}\` SET \`${coluna}\` = REPLACE(\`${coluna}\`, ` +
    `'${PREFIXO_ANTIGO}', '${PREFIXO_NOVO}') WHERE \`${coluna}\` LIKE '${PREFIXO_ANTIGO}%';`
  )
}

process.exit(falhas ? 1 : 0)
