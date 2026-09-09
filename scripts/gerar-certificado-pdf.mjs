/**
 * Gera o PDF de um certificado, do jeito que ele sai da impressora.
 *
 * Serve a duas coisas:
 *
 * 1. MODELO PARA ASSINATURA (`--modelo`). O certificado tem um espaço de
 *    assinatura reservado que hoje sai em branco, porque não existe o PNG em
 *    `assinaturas/`. Para preenchê-lo é preciso assinar alguma coisa primeiro —
 *    e é este PDF que se assina. Os dados do aluno saem trocados por marcadores:
 *    o documento que vai circular para ser assinado não precisa levar o nome de
 *    ninguém junto.
 *
 * 2. O PDF de um certificado REAL, pelo código, para quem precisar do arquivo
 *    em vez do link.
 *
 * Por que Playwright e não uma rota do site: gerar PDF sob demanda subiria um
 * Chromium por requisição, e este servidor já vive no limite de memória — o
 * `npm ci` do deploy foi morto pelo OOM killer duas vezes. Aqui é comando
 * manual, roda quando alguém pede.
 *
 * O PDF sai da MESMA página que o navegador imprime, em `media: print`. Não é
 * uma segunda arte parecida com o certificado: é o certificado.
 *
 *   node scripts/gerar-certificado-pdf.mjs --modelo
 *   node scripts/gerar-certificado-pdf.mjs JB-SS4DRGRH
 *   node scripts/gerar-certificado-pdf.mjs --todos
 */
import fs from "node:fs"
import path from "node:path"
import mariadb from "mariadb/promise.js"
import { chromium } from "playwright"

const BASE = process.env.BASE_URL ?? "https://escolaestadualdrjoaoberaldo.com"
const BIN = "/root/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell"

const env = fs.readFileSync("/srv/escola/src/.env", "utf8")
const RAIZ = (env.match(/^UPLOAD_ROOT=(.*)$/m)?.[1] ?? "").trim()
const DESTINO = path.join(RAIZ, "certificados-pdf")

const args = process.argv.slice(2)
const MODELO = args.includes("--modelo")
const TODOS = args.includes("--todos")
const CODIGO = args.find(a => /^JB-/i.test(a))?.toUpperCase()

if (!MODELO && !TODOS && !CODIGO) {
  console.error("Informe --modelo, --todos ou um código JB-XXXXXXXX.")
  process.exit(1)
}

const url = new URL(env.match(/DATABASE_URL="([^"]+)"/)[1])
const pool = mariadb.createPool({
  host: url.hostname, port: +(url.port || 3306),
  user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
  database: url.pathname.slice(1), connectionLimit: 2, bigIntAsNumber: true,
})
const c = await pool.getConnection()

// Um certificado qualquer serve de suporte para o modelo: a página é a mesma,
// e o texto é trocado depois de carregada.
const alvos = MODELO
  ? await c.query("SELECT codigo FROM certificados ORDER BY emitido_em DESC LIMIT 1")
  : TODOS
    ? await c.query("SELECT codigo FROM certificados ORDER BY emitido_em DESC")
    : [{ codigo: CODIGO }]

if (!alvos.length) {
  console.error("Nenhum certificado encontrado.")
  process.exit(1)
}

fs.mkdirSync(DESTINO, { recursive: true })

const b = await chromium.launch({ executablePath: BIN })
const gerados = []

for (const { codigo } of alvos) {
  const ctx = await b.newContext({ viewport: { width: 1400, height: 1000 } })
  const pg = await ctx.newPage()
  const r = await pg.goto(`${BASE}/certificado/${codigo}`, { waitUntil: "networkidle", timeout: 45000 })

  if (r.status() !== 200) {
    console.log(`  !! ${codigo}: página respondeu ${r.status()}`)
    await ctx.close()
    continue
  }

  if (MODELO) {
    // Troca só os DADOS, não o desenho: quem assinar vê exatamente o documento
    // que os alunos vão receber, sem o nome de um aluno de verdade dentro.
    //
    // A troca é pelo TEXTO que veio do banco, não por seletor de posição. Uma
    // primeira versão usava `.text-escola-azul.font-playfair` e acertou o
    // título "Certificado", que tem as mesmas classes do nome do curso — o
    // modelo saiu com "NOME DO CURSO" no lugar do título e com o curso real do
    // aluno ainda no meio da frase. Casar o texto exato não tem como errar de
    // alvo, e se o desenho mudar amanhã continua funcionando.
    const [dados] = await c.query(
      "SELECT aluno_nome, COALESCE(curso_titulo, modulo_titulo) curso FROM certificados WHERE codigo=?",
      [codigo])

    const trocados = await pg.evaluate(({ de, para }) => {
      let n = 0
      const anda = no => {
        for (const filho of no.childNodes) {
          if (filho.nodeType === 3) {
            for (const [antes, depois] of Object.entries(para)) {
              if (filho.textContent.trim() === antes) { filho.textContent = depois; n++ }
            }
          } else if (filho.nodeType === 1) anda(filho)
        }
      }
      anda(document.querySelector(".conteudo-certificado"))
      return n
    }, {
      de: null,
      para: {
        [dados.aluno_nome]: "NOME DO ALUNO",
        [dados.curso]: "NOME DO CURSO",
        // O código sai junto: ele é público, mas apontaria o modelo para o
        // certificado de um aluno de verdade.
        [codigo]: "JB-XXXXXXXX",
      },
    })

    if (trocados < 3) {
      console.log(`  !! só ${trocados} de 3 campos trocados — o modelo levaria dado real. Abortado.`)
      await ctx.close()
      continue
    }
  }

  // `printBackground` é obrigatório: o alto-relevo é feito inteiro de fundo, e
  // sem ele o PDF sairia com a folha limpa.
  const nome = MODELO ? "certificado-modelo-para-assinatura.pdf" : `certificado-${codigo}.pdf`
  const arquivo = path.join(DESTINO, nome)
  await pg.emulateMedia({ media: "print" })
  await pg.waitForTimeout(600)
  await pg.pdf({
    path: arquivo,
    format: "A4",
    landscape: true,
    printBackground: true,
    margin: { top: "8mm", right: "8mm", bottom: "8mm", left: "8mm" },
  })

  const tam = fs.statSync(arquivo).size
  gerados.push({ nome, tam })
  console.log(`  ok  ${nome}  ${(tam / 1024).toFixed(0)} KB`)
  await ctx.close()
  if (MODELO) break
}

await b.close()

// O dono é herdado da própria raiz de uploads, nunca chutado: quem serve os
// arquivos é o usuário do serviço, e um PDF criado como root aqui ficaria fora
// do alcance dele na próxima escrita.
const { uid, gid } = fs.statSync(RAIZ)
fs.chownSync(DESTINO, uid, gid)
for (const g of gerados) fs.chownSync(path.join(DESTINO, g.nome), uid, gid)

console.log(`\n  ${gerados.length} arquivo(s) em ${DESTINO}`)
gerados.forEach(g => console.log(`    ${BASE}/arquivos/certificados-pdf/${g.nome}`))

c.release()
await pool.end()
