/**
 * Auditoria de interface: contraste, tamanho de fonte e consistência.
 *
 *   node scripts/auditar-ui.mjs            confere tudo
 *   node scripts/auditar-ui.mjs --corrigir aplica as trocas seguras
 *
 * Existe porque revisar cor no olho não escala: o sistema tem mais de 200
 * arquivos de tela e dois temas com regras opostas. Isto recalcula o contraste
 * de cada par pela fórmula da WCAG e falha quando algo cai abaixo do exigido.
 *
 * Sai com código 1 quando encontra falha, para poder rodar antes de publicar.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const CORRIGIR = process.argv.includes('--corrigir')

// ------------------------------------------------------------ contraste
const lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }
const lum = h => {
  const n = parseInt(h.slice(1), 16)
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
}
export const razao = (a, b) => {
  const [x, y] = lum(a) > lum(b) ? [lum(a), lum(b)] : [lum(b), lum(a)]
  return (x + 0.05) / (y + 0.05)
}
const mistura = (frente, fundo, alfa) => {
  const F = parseInt(frente.slice(1), 16), B = parseInt(fundo.slice(1), 16)
  const m = s => Math.round((((F >> s) & 255) * alfa) + (((B >> s) & 255) * (1 - alfa)))
  return '#' + [16, 8, 0].map(s => m(s).toString(16).padStart(2, '0')).join('')
}

const FUNDO_PAINEL = '#ffffff'
const FUNDO_CURSO = '#0F1419'

/** Classes proibidas, com o substituto que passa. Medido, não escolhido. */
const PROIBIDAS = {
  'text-gray-400': { troca: 'text-gray-500', razao: 2.54, sobre: 'branco' },
  'text-white/30': { troca: 'text-white/50', razao: 2.70, sobre: 'curso-tinta' },
  'text-white/40': { troca: 'text-white/55', razao: 3.83, sobre: 'curso-tinta' },
}

/** Pares canônicos, reconferidos a cada execução. */
const PARES = [
  ['painel · texto', '#111827', FUNDO_PAINEL, 16],
  ['painel · apoio', '#6b7280', FUNDO_PAINEL, 12],
  ['painel · marca', '#1a3a5c', FUNDO_PAINEL, 14],
  ['curso · título', '#ffffff', FUNDO_CURSO, 20],
  ['curso · corpo', mistura('#ffffff', FUNDO_CURSO, 0.70), FUNDO_CURSO, 15],
  ['curso · apoio', mistura('#ffffff', FUNDO_CURSO, 0.50), FUNDO_CURSO, 13],
  ['curso · apoio fraco', mistura('#ffffff', FUNDO_CURSO, 0.55), FUNDO_CURSO, 12],
  ['curso · código', '#0BC5C5', FUNDO_CURSO, 13],
  ['curso · botão', '#ffffff', '#2D5BFF', 14],
]

const arquivos = execSync(
  "grep -rl 'className' app components --include=*.tsx || true"
).toString().trim().split('\n').filter(Boolean)

let falhas = 0
const aviso = (m) => { console.log('  ✗ ' + m); falhas++ }

console.log('AUDITORIA DE INTERFACE\n')

// ------------------------------------------------------- 1. pares canônicos
console.log('1. Contraste dos pares do design system')
for (const [nome, f, b, px] of PARES) {
  const exigido = px >= 18 ? 3.0 : 4.5
  const r = razao(f, b)
  if (r < exigido) aviso(`${nome}: ${r.toFixed(2)} — exigido ${exigido} em ${px}px`)
}
if (!falhas) console.log('  todos passam')

// --------------------------------------------------- 2. classes proibidas
console.log('\n2. Classes de contraste insuficiente')
let ocorrencias = 0
for (const arq of arquivos) {
  let texto = readFileSync(arq, 'utf8')
  let mudou = false
  for (const [ruim, { troca, razao: r, sobre }] of Object.entries(PROIBIDAS)) {
    const achados = texto.split(ruim).length - 1
    if (!achados) continue
    ocorrencias += achados
    if (CORRIGIR) {
      texto = texto.split(ruim).join(troca)
      mudou = true
    } else {
      aviso(`${arq}: ${achados}× ${ruim} (${r} sobre ${sobre}) → use ${troca}`)
    }
  }
  if (mudou) writeFileSync(arq, texto)
}
if (CORRIGIR && ocorrencias) console.log(`  ${ocorrencias} ocorrência(s) corrigida(s)`)
else if (!ocorrencias) console.log('  nenhuma')

// ------------------------------------------------------ 3. tamanho de fonte
console.log('\n3. Texto abaixo de 12px')
const MENORES = /text-\[(\d+)px\]/g
for (const arq of arquivos) {
  const texto = readFileSync(arq, 'utf8')
  for (const m of texto.matchAll(MENORES)) {
    const px = Number(m[1])
    if (px >= 12) continue
    // O piso vale para TEXTO CORRIDO. Não são texto corrido, e ficam de fora:
    //  - etiqueta (uppercase/tracking): uma ou duas palavras, lidas de relance;
    //  - metadado em mono: data, código, contador;
    //  - token de tamanho dentro de objeto (ex.: iniciais de avatar).
    const volta = texto.slice(Math.max(0, m.index - 160), m.index + 160)
    const ehEtiqueta = /uppercase|tracking-/.test(volta)
    const ehMono = /font-mono|font-jetbrains/.test(volta)
    const ehToken = /^\s*[a-zA-Z]+:\s*'$/.test(texto.slice(Math.max(0, m.index - 20), m.index))
    if (ehEtiqueta || ehMono || ehToken) continue
    aviso(`${arq}: text-[${px}px] em texto corrido — mínimo 12px`)
  }
}

// -------------------------------------------------- 4. clicável sem foco
console.log('\n4. Elemento clicável sem estado de foco visível')
let semFoco = 0
for (const arq of arquivos) {
  const texto = readFileSync(arq, 'utf8')
  const botoes = texto.match(/<button[^>]*className="[^"]*"/g) ?? []
  for (const b of botoes) {
    if (!/focus:|focus-visible:/.test(b) && /hover:/.test(b)) semFoco++
  }
}
if (semFoco) console.log(`  ${semFoco} botão(ões) com hover e sem foco — navegação por teclado fica sem retorno`)
else console.log('  nenhum')

// -------------------------------------------------------------- resultado
console.log(`\n${falhas ? falhas + ' falha(s)' : 'sem falhas'}`)
process.exit(falhas ? 1 : 0)
