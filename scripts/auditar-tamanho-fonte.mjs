/**
 * Mede o tamanho REAL do texto nas telas de curso, no navegador.
 *
 * Ler as classes do código não serve: `text-sm` num pai e `text-[15px]` num
 * filho, mais a escala do `md:`, dão um valor final que só o navegador sabe.
 * Aqui o número vem de `getComputedStyle`, já resolvido.
 *
 * O que conta como pequeno depende do papel do texto. Um rótulo de canto em
 * 11px é aceitável; o CORPO de uma aula em 15px não é — é o que o aluno lê por
 * quinze minutos seguidos, muitas vezes no celular. Por isso o relatório separa
 * texto de leitura (parágrafo, item de lista, célula de tabela, enunciado) do
 * resto, e é sobre o primeiro grupo que vale agir.
 *
 *   node scripts/auditar-tamanho-fonte.mjs
 *   BASE_URL=http://127.0.0.1:3004 node scripts/auditar-tamanho-fonte.mjs
 */
import fs from "node:fs"
import crypto from "node:crypto"
import mariadb from "mariadb/promise.js"
import { chromium } from "playwright"

const BASE = process.env.BASE_URL ?? "https://escolaestadualdrjoaoberaldo.com"
const BIN = "/root/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell"

// Piso do texto de leitura. 16px é o tamanho padrão do navegador e o que a
// literatura de legibilidade usa como base para texto corrido.
const PISO_LEITURA = 16

const url = new URL(fs.readFileSync("/srv/escola/src/.env", "utf8").match(/DATABASE_URL="([^"]+)"/)[1])
const pool = mariadb.createPool({
  host: url.hostname, port: +(url.port || 3306),
  user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
  database: url.pathname.slice(1), connectionLimit: 2, bigIntAsNumber: true,
})
const c = await pool.getConnection()

const [u] = await c.query("SELECT id FROM profiles WHERE role='admin' AND aprovado=1 LIMIT 1")
const t = crypto.randomBytes(32).toString("hex")
const h = crypto.createHash("sha256").update(t).digest("hex")
await c.query("INSERT INTO sessoes (id,usuario_id,token_hash,expira_em,criado_em) VALUES (UUID(),?,?,?,NOW())",
  [u.id, h, new Date(Date.now() + 36e5)])

// Uma aula de cada curso publicado, mais as telas de catálogo e de desafio:
// o texto pequeno costuma estar no mesmo componente, mas o conteúdo de aula
// varia (tabela, código, citação) e é onde aparecem os casos extremos.
const aulas = await c.query(`
  SELECT cu.slug cs, a.slug as_, cu.titulo curso FROM aulas a
  JOIN cursos cu ON cu.id = a.curso_id
  WHERE cu.publicado = 1 AND a.publicado = 1
  GROUP BY cu.id ORDER BY cu.ordem_na_trilha`)

const [desafio] = await c.query(`
  SELECT d.id FROM curso_desafios d JOIN cursos cu ON cu.id = d.curso_id
  WHERE d.vale_certificado = 1 AND cu.publicado = 1 LIMIT 1`)

const rotas = [
  "/admin/cursos",
  ...aulas.map(a => `/admin/cursos/${a.cs}/${a.as_}`),
  ...(desafio ? [`/admin/cursos/desafios/${desafio.id}`] : []),
]

const b = await chromium.launch({ executablePath: BIN })
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } })
await ctx.addCookies([{ name: "jb_sessao", value: t, domain: "escolaestadualdrjoaoberaldo.com", path: "/" }])
const pg = await ctx.newPage()

const leitura = new Map()   // px -> { n, exemplos:Set }
const resto = new Map()

for (const rota of rotas) {
  try {
    await pg.goto(BASE + rota, { waitUntil: "networkidle", timeout: 45000 })
  } catch { console.log(`  !! ${rota}: timeout`); continue }

  const achados = await pg.evaluate(() => {
    // Tags cujo texto o aluno LÊ, em oposição a rótulo, crédito e migalha.
    const DE_LEITURA = new Set(["P", "LI", "TD", "TH", "BLOCKQUOTE", "DD", "DT"])
    const saida = []
    const anda = no => {
      for (const filho of no.childNodes) {
        if (filho.nodeType === 3) {
          const txt = filho.textContent.trim()
          // Texto curto costuma ser rótulo ou número, não leitura.
          if (txt.length < 25 || !/[\p{L}]/u.test(txt)) continue
          const cs = getComputedStyle(no)
          if (cs.visibility === "hidden" || cs.display === "none" || +cs.opacity === 0) continue
          const faixa = document.createRange()
          faixa.selectNodeContents(filho)
          const r = faixa.getBoundingClientRect()
          if (r.width < 1 || r.height < 1) continue
          saida.push({
            px: Math.round(parseFloat(cs.fontSize) * 10) / 10,
            tag: no.tagName,
            leitura: DE_LEITURA.has(no.tagName),
            texto: txt.slice(0, 60),
          })
        } else if (filho.nodeType === 1) anda(filho)
      }
    }
    anda(document.body)
    return saida
  })

  for (const a of achados) {
    const mapa = a.leitura ? leitura : resto
    if (!mapa.has(a.px)) mapa.set(a.px, { n: 0, exemplos: new Set() })
    const e = mapa.get(a.px)
    e.n++
    // A rota entra no exemplo: sem ela o relatório diz que existe texto de
    // 10px mas não onde, e a busca vira tentativa e erro pelo código.
    if (e.exemplos.size < 3) e.exemplos.add(`${rota}\n           <${a.tag}> ${a.texto}`)
  }
}

const mostra = (titulo, mapa, piso) => {
  console.log(`\n== ${titulo} ==`)
  const ordenado = [...mapa.entries()].sort((a, b) => a[0] - b[0])
  let abaixo = 0
  for (const [px, e] of ordenado) {
    const ruim = piso && px < piso
    if (ruim) abaixo += e.n
    console.log(`  ${ruim ? "!!" : "ok"} ${String(px).padStart(5)}px  ${String(e.n).padStart(4)} trecho(s)`)
    if (ruim) [...e.exemplos].forEach(x => console.log(`         ${x}`))
  }
  if (piso) console.log(`  -- ${abaixo} trecho(s) de leitura abaixo de ${piso}px`)
  return abaixo
}

const abaixo = mostra(`TEXTO DE LEITURA (piso ${PISO_LEITURA}px)`, leitura, PISO_LEITURA)
mostra("DEMAIS TEXTOS (rótulo, crédito, navegação)", resto, null)

console.log(`\n  ${rotas.length} rota(s) medida(s)`)
await b.close()
await c.query("DELETE FROM sessoes WHERE token_hash=?", [h])
c.release()
await pool.end()
if (abaixo) process.exit(1)
