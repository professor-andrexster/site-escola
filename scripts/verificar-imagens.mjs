/**
 * Procura imagem que o servidor entrega com 200 e o navegador nao consegue abrir.
 *
 * Por que isto existe: a logo da escola sumiu do site e NENHUMA auditoria pegou.
 * A pagina respondia 200, a auditoria de contraste passava, o arquivo original
 * estava intacto no disco e servia normalmente. O que quebrou foi uma variante
 * do otimizador do Next: `/_next/image?url=/logo.jpg&w=48` devolvia 200, com
 * `content-type: image/jpeg` e 500 bytes — um JPEG TRUNCADO. Para o servidor,
 * sucesso; para o navegador, `naturalWidth = 0` e um quadrado vazio na tela.
 *
 * Duas camadas guardam essa variante, e as duas precisam ser limpas: o disco,
 * em `.next/cache/images`, e a memoria do processo. Apagar so o arquivo nao
 * resolve — o servidor continua servindo a copia em memoria, com o mesmo etag.
 * O restart do servico e que fecha.
 *
 * Conferir tamanho ou status HTTP nao serve: os dois estavam certos. A unica
 * verificacao que vale e DECODIFICAR a imagem, que e o que este script faz.
 *
 *   node scripts/verificar-imagens.mjs
 *   BASE_URL=http://127.0.0.1:3004 node scripts/verificar-imagens.mjs
 *
 * Sai com codigo 1 se achar alguma quebrada, para poder entrar num deploy.
 */
import fs from "node:fs"
import path from "node:path"
import sharp from "sharp"

const BASE = process.env.BASE_URL ?? "https://escolaestadualdrjoaoberaldo.com"
const CACHE = "/srv/escola/app/.next/cache/images"
const PUBLIC = "/srv/escola/src/public"

// As larguras que o Next gera para `sizes`/`fill`. A quebrada era a 48 — uma
// so, no meio de oito, e justamente a que o cabecalho do site pedia.
const LARGURAS = [16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1920]

const problemas = []

// ------------------------------------------------- 1. o cache do otimizador
console.log("== cache do otimizador ==")
if (!fs.existsSync(CACHE)) {
  console.log("  cache ainda nao existe (normal logo depois de um deploy)")
} else {
  let n = 0, ruins = 0
  for (const dir of fs.readdirSync(CACHE)) {
    const p = path.join(CACHE, dir)
    if (!fs.statSync(p).isDirectory()) continue
    for (const f of fs.readdirSync(p)) {
      const fp = path.join(p, f)
      n++
      try {
        await sharp(fp).metadata()
      } catch (e) {
        ruins++
        problemas.push(`cache: ${fp}`)
        console.log(`  !! ${fs.statSync(fp).size}b ${e.message.split("\n")[0]}\n     ${fp}`)
      }
    }
  }
  console.log(`  ${n} arquivo(s) · ${ruins} corrompido(s)`)
}

// ------------------------------------------------------ 2. as fontes em public
console.log("\n== imagens em public/ ==")
let fontes = 0
for (const f of fs.readdirSync(PUBLIC)) {
  if (!/\.(png|jpe?g|webp|avif|gif)$/i.test(f)) continue
  fontes++
  try {
    await sharp(path.join(PUBLIC, f)).metadata()
  } catch (e) {
    problemas.push(`public/${f}`)
    console.log(`  !! ${f}: ${e.message.split("\n")[0]}`)
  }
}
console.log(`  ${fontes} arquivo(s) conferido(s)`)

// --------------------------------- 3. cada variante que o site realmente pede
console.log("\n== variantes servidas pelo otimizador ==")
const alvos = ["/logo.jpg", "/logo-transparente.png", "/fachada.jpg"]
for (const alvo of alvos) {
  const quebradas = []
  for (const w of LARGURAS) {
    const u = `${BASE}/_next/image?url=${encodeURIComponent(alvo)}&w=${w}&q=75`
    let r
    try {
      r = await fetch(u, { headers: { Accept: "image/webp,image/avif,image/*" } })
    } catch {
      quebradas.push(`${w} (sem resposta)`)
      continue
    }
    // Largura fora da lista configurada responde 400: isso e esperado, nao e
    // defeito — o site so pede as que existem no srcset.
    if (r.status === 400) continue
    if (!r.ok) { quebradas.push(`${w} (HTTP ${r.status})`); continue }
    const buf = Buffer.from(await r.arrayBuffer())
    try {
      await sharp(buf).metadata()
    } catch {
      quebradas.push(`${w} (${buf.length}b ilegível)`)
    }
  }
  console.log(`  ${quebradas.length ? "!! " : "ok "} ${alvo}${quebradas.length ? " — quebradas: " + quebradas.join(", ") : ""}`)
  quebradas.forEach(q => problemas.push(`${alvo} w=${q}`))
}

// ------------------------------------------------------------------ resultado
console.log(`\n== ${problemas.length} problema(s) ==`)
if (problemas.length) {
  console.log("\n  Para corrigir, os dois passos, nesta ordem:")
  console.log("    rm -rf /srv/escola/app/.next/cache/images/<pasta-da-entrada>")
  console.log("    systemctl restart escola     # sem isto a copia em memoria continua servindo")
  process.exit(1)
}
console.log("  nenhuma imagem quebrada")
