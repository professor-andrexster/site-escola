/**
 * Uniformiza a grafia do responsável pelos cursos e certificados.
 *
 * O mesmo professor estava gravado de dois jeitos — "André Gomes" e "Professor
 * André Gomes" — e o certificado imprime esse campo embaixo da linha de
 * assinatura. Na prática, 36 certificados diziam uma coisa e 9 diziam outra,
 * para a mesma pessoa e a mesma escola.
 *
 * Isso não era só estética. O certificado procura a assinatura digitalizada em
 * `assinaturas/<nome-em-slug>.png`, então as duas grafias pediam DOIS arquivos
 * de assinatura (`andre-gomes.png` e `professor-andre-gomes.png`). Uniformizar
 * faz um arquivo só passar a valer para tudo — e é o mesmo motivo pelo qual a
 * marca do professor, que segue a mesma convenção, também passa a resolver num
 * nome só.
 *
 * Fica "Professor André Gomes", que é uma das duas grafias que já existiam e a
 * que cabe num documento formal.
 *
 * Só toca nestas duas colunas. `noticias.autor_nome` tem e-mails e apelidos de
 * várias pessoas — é outro problema, de outra tela, e não entra de carona.
 *
 *   node scripts/padronizar-autor.mjs           # simula
 *   node scripts/padronizar-autor.mjs --aplicar # grava
 */
import fs from "node:fs"
import mariadb from "mariadb/promise.js"

const APLICAR = process.argv.includes("--aplicar")

const CERTO = "Professor André Gomes"
const VARIANTES = ["André Gomes", "Andre Gomes", "Prof. André Gomes", "Professor Andre Gomes"]
const ALVOS = [
  { tabela: "certificados", coluna: "autor_nome" },
  { tabela: "cursos", coluna: "autor_nome" },
]

const url = new URL(fs.readFileSync("/srv/escola/src/.env", "utf8").match(/DATABASE_URL="([^"]+)"/)[1])
const pool = mariadb.createPool({
  host: url.hostname, port: +(url.port || 3306),
  user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
  database: url.pathname.slice(1), connectionLimit: 2, bigIntAsNumber: true,
})
const c = await pool.getConnection()

console.log(APLICAR ? "== APLICANDO ==\n" : "== SIMULACAO (use --aplicar para gravar) ==\n")

let total = 0
for (const { tabela, coluna } of ALVOS) {
  const antes = await c.query(
    `SELECT \`${coluna}\` v, COUNT(*) n FROM \`${tabela}\` WHERE \`${coluna}\` IS NOT NULL GROUP BY 1 ORDER BY n DESC`)
  console.log(`  ${tabela}.${coluna}`)
  antes.forEach(x => console.log(`      ${String(x.n).padStart(3)}x  "${x.v}"${x.v === CERTO ? "  (já certo)" : ""}`))

  // `BINARY` no segundo teste, e não só o `IN`: a collation do MariaDB ignora
  // acento, então "Professor Andre Gomes" casa com "Professor André Gomes" e a
  // contagem incluía linhas que já estavam certas — 45 onde só 36 mudavam de
  // valor. O UPDATE daria no mesmo, mas o número relatado seria falso, e num
  // script que reescreve documento emitido o número é o que se confere.
  const marcas = VARIANTES.map(() => "?").join(",")
  const condicao = `\`${coluna}\` IN (${marcas}) AND BINARY \`${coluna}\` <> BINARY ?`
  const parametros = [...VARIANTES, CERTO]

  const [{ n }] = await c.query(`SELECT COUNT(*) n FROM \`${tabela}\` WHERE ${condicao}`, parametros)

  if (n === 0) { console.log(`      -- nada a mudar\n`); continue }
  console.log(`      -> ${n} linha(s) mudam de valor para "${CERTO}"\n`)
  total += n

  if (APLICAR) {
    await c.query(`UPDATE \`${tabela}\` SET \`${coluna}\` = ? WHERE ${condicao}`, [CERTO, ...parametros])
  }
}

console.log(`  ${total} linha(s) ${APLICAR ? "atualizada(s)" : "a atualizar"}`)

console.log("\n== conferência ==")
for (const { tabela, coluna } of ALVOS) {
  const r = await c.query(
    `SELECT \`${coluna}\` v, COUNT(*) n FROM \`${tabela}\` WHERE \`${coluna}\` IS NOT NULL GROUP BY 1`)
  const sobrando = r.filter(x => x.v !== CERTO)
  console.log(`  ${sobrando.length === 0 ? "ok  " : "!!  "}${tabela}.${coluna}: ${r.length} grafia(s) distinta(s)`)
  r.forEach(x => console.log(`      ${String(x.n).padStart(3)}x  "${x.v}"`))
}

// O nome vira o caminho do arquivo de assinatura e da marca: vale dizer qual é,
// para não sobrar dúvida sobre onde colocar o PNG.
const slug = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase()
console.log(`\n  arquivos que o certificado passa a procurar:`)
console.log(`    assinaturas/${slug(CERTO)}.png`)
console.log(`    marcas/${slug(CERTO)}.png`)

c.release()
await pool.end()
