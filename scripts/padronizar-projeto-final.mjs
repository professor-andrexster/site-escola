/**
 * Padroniza os quatro cursos cujo projeto final estava pendurado numa AULA.
 *
 * O padrao da plataforma e: projeto final = desafio de CURSO (`aula_id NULL`),
 * exercicio = desafio de aula. Quatro cursos fugiam disso — Parte 3 e Parte 4
 * de HTML/CSS, Excel e PHP — porque o projeto veio junto na migracao do curso
 * antigo e ficou preso a aula em que estava.
 *
 * A migracao NAO move envio de aluno de um desafio para outro. Olhando o
 * conteudo, os quatro desafios que ja tinham a flag SAO o projeto final certo:
 * sao os maiores (1.2k a 1.6k caracteres), fecham o curso e, em Excel e PHP,
 * estao justamente na ultima aula. Entao o que muda e o ENDERECO do desafio,
 * nao a identidade dele: `aula_id` vai a NULL e a linha continua a mesma.
 *
 * Isso importa porque relabelar seria mentir. Cinco alunos entregaram "sua
 * pagina pessoal" na Parte 3, dois ja aprovados. Apontar esses envios para
 * outro enunciado faria o sistema dizer que eles entregaram um trabalho que
 * nunca fizeram. Como o id do desafio nao muda, os envios viajam junto sozinhos
 * — inclusive as correcoes, as devolutivas e os certificados ja emitidos.
 *
 * Sobra um caso: na Parte 3 e na Parte 4 existe TAMBEM um projeto de curso
 * menor, que eu tinha escrito como fechamento da Parte e que agora seria um
 * segundo desafio de curso sem flag. Esses descem para a aula do assunto deles
 * e viram exercicio, que e o lugar certo para um enunciado desse tamanho.
 *
 * Idempotente.
 *
 *   node scripts/padronizar-projeto-final.mjs           # simula
 *   node scripts/padronizar-projeto-final.mjs --aplicar # grava
 */
import fs from "node:fs"
import mariadb from "mariadb/promise.js"

const APLICAR = process.argv.includes("--aplicar")

/** Curso -> o desafio de curso que sobra e a aula que o recebe como exercicio. */
const REBAIXAR = {
  "html-css-3-estrutura-que-sustenta": {
    desafio: "Cabeçalho e menu que funcionam",
    paraAula: "Cabeçalho e navegação",
  },
  "html-css-4-layout-completo": {
    desafio: "A página no celular",
    paraAula: "Responsividade",
  },
}

const CURSOS = [
  "html-css-3-estrutura-que-sustenta",
  "html-css-4-layout-completo",
  "excel-do-zero",
  "php-backend-web",
]

const url = new URL(fs.readFileSync("/srv/escola/src/.env", "utf8").match(/DATABASE_URL="([^"]+)"/)[1])
const pool = mariadb.createPool({
  host: url.hostname, port: +(url.port || 3306),
  user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
  database: url.pathname.slice(1), connectionLimit: 2, bigIntAsNumber: true,
})
const c = await pool.getConnection()

console.log(APLICAR ? "== APLICANDO ==\n" : "== SIMULACAO (use --aplicar para gravar) ==\n")

let soltos = 0, rebaixados = 0, pulados = 0

for (const slug of CURSOS) {
  const [cu] = await c.query("SELECT id, titulo FROM cursos WHERE slug = ?", [slug])
  if (!cu) { console.log(`  !! curso nao encontrado: ${slug}`); continue }

  const [final] = await c.query(
    `SELECT d.id, d.titulo, d.aula_id, a.titulo aula,
            (SELECT COUNT(*) FROM curso_desafio_envios v WHERE v.desafio_id = d.id) envios
     FROM curso_desafios d LEFT JOIN aulas a ON a.id = d.aula_id
     WHERE d.curso_id = ? AND d.vale_certificado = 1`, [cu.id])

  if (!final) { console.log(`  !! ${cu.titulo}: sem projeto final`); continue }

  console.log(`  ${cu.titulo}`)
  if (final.aula_id === null) {
    pulados++
    console.log(`      -- "${final.titulo}" ja e de curso (${final.envios} envio(s))`)
  } else {
    console.log(`      -> "${final.titulo}"`)
    console.log(`         sai da aula "${final.aula}" e passa a ser de curso`)
    console.log(`         ${final.envios} envio(s) viajam junto: o id do desafio nao muda`)
    if (APLICAR) {
      await c.query("UPDATE curso_desafios SET aula_id = NULL WHERE id = ?", [final.id])
    }
    soltos++
  }

  const reb = REBAIXAR[slug]
  if (!reb) continue

  const [dup] = await c.query(
    "SELECT id, titulo, aula_id FROM curso_desafios WHERE curso_id = ? AND titulo = ?",
    [cu.id, reb.desafio])
  if (!dup) { console.log(`      !! nao achei "${reb.desafio}" para rebaixar`); continue }
  if (dup.aula_id !== null) { pulados++; console.log(`      -- "${dup.titulo}" ja e exercicio de aula`); continue }

  const [aula] = await c.query(
    "SELECT id, titulo FROM aulas WHERE curso_id = ? AND titulo = ?", [cu.id, reb.paraAula])
  if (!aula) { console.log(`      !! aula "${reb.paraAula}" nao encontrada`); continue }

  console.log(`      -> "${dup.titulo}" vira exercicio da aula "${aula.titulo}"`)
  if (APLICAR) {
    await c.query("UPDATE curso_desafios SET aula_id = ? WHERE id = ?", [aula.id, dup.id])
  }
  rebaixados++
}

console.log(`\n  ${soltos} projeto(s) solto(s) da aula · ${rebaixados} rebaixado(s) a exercicio · ${pulados} ja certo(s)`)

console.log("\n== conferencia ==")
const q = async (rotulo, sql) => {
  const linhas = await c.query(sql)
  console.log(`  ${linhas.length === 0 ? "ok  " : "!!  "}${rotulo}: ${linhas.length}`)
  linhas.forEach(l => console.log(`      ${Object.values(l).join(" · ")}`))
}
await q("cursos publicados sem projeto final", `
  SELECT cu.titulo FROM cursos cu WHERE cu.publicado = 1
    AND NOT EXISTS (SELECT 1 FROM curso_desafios d WHERE d.curso_id = cu.id AND d.vale_certificado = 1)`)
await q("cursos com mais de um projeto final", `
  SELECT cu.titulo, COUNT(*) n FROM curso_desafios d JOIN cursos cu ON cu.id = d.curso_id
  WHERE d.vale_certificado = 1 GROUP BY cu.id HAVING n > 1`)
await q("projeto final ainda preso a uma aula", `
  SELECT cu.titulo curso, d.titulo desafio FROM curso_desafios d JOIN cursos cu ON cu.id = d.curso_id
  WHERE d.vale_certificado = 1 AND d.aula_id IS NOT NULL AND cu.publicado = 1`)
await q("desafio de curso que nao e o final", `
  SELECT cu.titulo curso, d.titulo desafio FROM curso_desafios d JOIN cursos cu ON cu.id = d.curso_id
  WHERE d.aula_id IS NULL AND d.vale_certificado = 0 AND cu.publicado = 1`)
await q("envio orfao (desafio sumiu)", `
  SELECT v.id FROM curso_desafio_envios v
  WHERE NOT EXISTS (SELECT 1 FROM curso_desafios d WHERE d.id = v.desafio_id)`)

const [tot] = await c.query("SELECT COUNT(*) n FROM curso_desafio_envios")
console.log(`  envios no banco: ${tot.n}`)

const cert = await c.query(`
  SELECT ce.codigo, ce.aluno_nome, ce.curso_titulo FROM certificados ce
  WHERE ce.curso_id IN (SELECT id FROM cursos WHERE slug IN (${CURSOS.map(() => "?").join(",")}))`, CURSOS)
console.log(`  certificados emitidos nesses 4 cursos: ${cert.length}`)
cert.forEach(x => console.log(`      ${x.codigo} ${x.aluno_nome} — ${x.curso_titulo}`))

c.release()
await pool.end()
