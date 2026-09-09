/**
 * Confere se TUDO no certificado continua legível depois do relevo.
 *
 * Por que um script só para isto: `auditar-telas.mjs` não serve aqui. Ele
 * descobre o fundo de um texto subindo pelos ANCESTRAIS até achar uma cor. A
 * marca d'água em relevo não é ancestral de texto nenhum — é um irmão
 * posicionado por baixo. O auditor leria "papel #fcfaf6" e aprovaria, mesmo se
 * a marca estivesse preta atrás do nome do aluno.
 *
 * Então aqui o fundo não é deduzido, é MEDIDO: a página é fotografada duas
 * vezes, uma normal e outra com todo o texto invisível. A segunda é o fundo
 * de verdade, com relevo e tudo. Para cada texto, olha-se o pixel mais escuro
 * dentro da caixa dele e calcula-se o contraste contra a cor da fonte —
 * ou seja, o pior caso real, não a média.
 *
 * Confere também o que só aparece em caso extremo: nome e curso mais longos do
 * banco, e em três larguras de tela. No celular a proporção A4 deitada é
 * abandonada e o relevo fica proporcionalmente MAIOR sobre o texto — medir só
 * no desktop deixaria justamente o pior caso de fora.
 *
 *   node scripts/verificar-certificado.mjs
 *
 * Sai 1 se algo ficar ilegível ou vazar da folha.
 */
import fs from "node:fs"
import mariadb from "mariadb/promise.js"
import sharp from "sharp"
import { chromium } from "playwright"

const BASE = process.env.BASE_URL ?? "https://escolaestadualdrjoaoberaldo.com"
const BIN = "/root/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell"
const TMP = "/tmp/verificar-certificado"

// WCAG 2.1 AA. Texto grande (>=24px, ou >=18.66px em negrito) pode 3:1.
const MIN_NORMAL = 4.5
const MIN_GRANDE = 3

const canal = v => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 }
const lum = ({ r, g, b }) => 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b)
const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }
const rgb = s => { const m = s.match(/\d+(\.\d+)?/g); return m ? { r: +m[0], g: +m[1], b: +m[2] } : null }

fs.mkdirSync(TMP, { recursive: true })

const url = new URL(fs.readFileSync("/srv/escola/src/.env", "utf8").match(/DATABASE_URL="([^"]+)"/)[1])
const pool = mariadb.createPool({
  host: url.hostname, port: +(url.port || 3306),
  user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
  database: url.pathname.slice(1), connectionLimit: 2, bigIntAsNumber: true,
})
const c = await pool.getConnection()

// Os casos que espremem o desenho: o nome mais longo e o título mais longo que
// existem de verdade. Um certificado bonito com o nome médio e quebrado com o
// nome comprido continua sendo um certificado quebrado.
const codigos = await c.query(`
  (SELECT codigo FROM certificados ORDER BY CHAR_LENGTH(aluno_nome) DESC LIMIT 1)
  UNION
  (SELECT codigo FROM certificados ORDER BY CHAR_LENGTH(COALESCE(curso_titulo, modulo_titulo)) DESC LIMIT 1)
  UNION
  (SELECT codigo FROM certificados ORDER BY emitido_em DESC LIMIT 1)`)

const TELAS = [
  { nome: "celular", largura: 390, altura: 844 },
  { nome: "tablet", largura: 768, altura: 1024 },
  { nome: "desktop", largura: 1400, altura: 1000 },
]

const b = await chromium.launch({ executablePath: BIN })
let falhas = 0

for (const { codigo } of codigos) {
  const [meta] = await c.query(
    "SELECT aluno_nome, COALESCE(curso_titulo, modulo_titulo) alvo FROM certificados WHERE codigo=?", [codigo])
  console.log(`\n== ${codigo} — ${meta.aluno_nome} · ${meta.alvo} ==`)

  for (const tela of TELAS) {
  const ctx = await b.newContext({ viewport: { width: tela.largura, height: tela.altura }, deviceScaleFactor: 2 })
  const pg = await ctx.newPage()
  await pg.goto(`${BASE}/certificado/${codigo}`, { waitUntil: "networkidle", timeout: 45000 })
  await pg.waitForTimeout(900)

  const folha = pg.locator(".folha-certificado")
  const caixaFolha = await folha.boundingBox()

  // Onde está cada texto, com a cor e o tamanho da fonte.
  const textos = await pg.evaluate(() => {
    const saida = []
    const anda = no => {
      for (const filho of no.childNodes) {
        if (filho.nodeType === 3) {
          const t = filho.textContent.trim()
          if (!t || !/[\p{L}\p{N}]/u.test(t)) continue
          const faixa = document.createRange()
          faixa.selectNodeContents(filho)
          const r = faixa.getBoundingClientRect()
          if (r.width < 1 || r.height < 1) continue
          const cs = getComputedStyle(no)
          if (cs.visibility === "hidden" || cs.display === "none" || +cs.opacity === 0) continue
          saida.push({
            texto: t.slice(0, 46), cor: cs.color,
            px: parseFloat(cs.fontSize), peso: cs.fontWeight,
            x: r.x, y: r.y, w: r.width, h: r.height,
          })
        } else if (filho.nodeType === 1) anda(filho)
      }
    }
    anda(document.querySelector(".conteudo-certificado"))
    return saida
  })

  // Segunda foto: mesmo layout, texto invisível. É o fundo real — relevo,
  // molduras e filetes — sem nada por cima para atrapalhar a medição.
  await folha.screenshot({ path: `${TMP}/${codigo}-${tela.nome}-completo.png` })
  await pg.addStyleTag({ content: ".conteudo-certificado, .conteudo-certificado * { color: transparent !important; }" })
  await pg.waitForTimeout(250)
  await folha.screenshot({ path: `${TMP}/${codigo}-${tela.nome}-fundo.png` })

  const img = sharp(`${TMP}/${codigo}-${tela.nome}-fundo.png`)
  const { width: iw, height: ih } = await img.metadata()
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })
  const escala = iw / caixaFolha.width

  let piores = []
  for (const t of textos) {
    const cor = rgb(t.cor)
    if (!cor) continue
    // Caixa do texto em pixels da imagem do fundo.
    const x0 = Math.max(0, Math.round((t.x - caixaFolha.x) * escala))
    const y0 = Math.max(0, Math.round((t.y - caixaFolha.y) * escala))
    const x1 = Math.min(iw, Math.round((t.x - caixaFolha.x + t.w) * escala))
    const y1 = Math.min(ih, Math.round((t.y - caixaFolha.y + t.h) * escala))
    if (x1 <= x0 || y1 <= y0) continue

    // O pixel de fundo que dá o PIOR contraste com esta cor de fonte.
    let pior = Infinity, piorCor = null
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const i = (y * info.width + x) * info.channels
        const f = { r: data[i], g: data[i + 1], b: data[i + 2] }
        const ct = contraste(cor, f)
        if (ct < pior) { pior = ct; piorCor = f }
      }
    }

    const grande = t.px >= 24 || (t.px >= 18.66 && +t.peso >= 700)
    const minimo = grande ? MIN_GRANDE : MIN_NORMAL
    if (pior < minimo) {
      falhas++
      piores.push(`    !! ${pior.toFixed(2)}:1 (mínimo ${minimo}) ${t.px}px "${t.texto}"\n       fonte ${t.cor} sobre rgb(${piorCor.r},${piorCor.g},${piorCor.b})`)
    }
  }

  console.log(`  -- ${tela.nome} ${tela.largura}px: ${textos.length} trecho(s) medido(s) contra o fundo real`)
  if (piores.length) piores.forEach(p => console.log(p))
  else console.log("     ok  nenhum abaixo do mínimo da WCAG AA")

  // Transbordo: com nome e curso longos, nada pode escapar da folha.
  const fora = await pg.evaluate(() => {
    const f = document.querySelector(".folha-certificado").getBoundingClientRect()
    const r = []
    for (const el of document.querySelectorAll(".conteudo-certificado *")) {
      const c = el.getBoundingClientRect()
      if (c.width === 0 || c.height === 0) continue
      if (c.right > f.right + 1 || c.bottom > f.bottom + 1 || c.left < f.left - 1 || c.top < f.top - 1)
        r.push(`${el.tagName} ${Math.round(c.width)}x${Math.round(c.height)}`)
    }
    return r
  })
  if (fora.length) { falhas++; console.log(`  !! ${fora.length} elemento(s) fora da folha: ${fora.join(", ")}`) }
  else console.log("     ok  nada transborda a folha")

  // O relevo existe e tem as três camadas.
  const camadas = await pg.evaluate(() =>
    [...document.querySelectorAll(".marca-relevo i")].map(i => getComputedStyle(i).backgroundColor))
  if (camadas.length !== 3) { falhas++; console.log(`  !! relevo com ${camadas.length} camada(s), esperado 3`) }
  else console.log(`     ok  relevo com 3 camadas`)

  await ctx.close()
  }
}

await b.close()
c.release()
await pool.end()

console.log(`\n== ${falhas} problema(s) ==`)
console.log(`  imagens em ${TMP}`)
if (falhas) process.exit(1)
