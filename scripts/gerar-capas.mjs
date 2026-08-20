/**
 * Gera as capas dos cursos e dos módulos.
 *
 *   node scripts/gerar-capas.mjs            todos
 *   node scripts/gerar-capas.mjs html-estrutura-da-web
 *
 * Substitui o scripts/gerar-capas.ts, que gravava no Supabase — de onde o
 * sistema saiu. Agora escreve no UPLOAD_ROOT e atualiza o banco direto.
 *
 * A mudança de desenho: a SIGLA em corpo grande, e o título completo menor
 * embaixo. Na miniatura da vitrine o título comprido ficava ilegível, e é pela
 * miniatura que o aluno procura o curso — "HTML" se acha de relance, "HTML —
 * Estrutura da Web" em corpo 20 não.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import sharp from 'sharp'
import mariadb from '../node_modules/mariadb/promise.js'

const RAIZ = process.cwd()
const env = Object.fromEntries(
  readFileSync(resolve(RAIZ, '.env'), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, '')] })
)
const UPLOADS = env.UPLOAD_ROOT
const PASTA = resolve(UPLOADS, 'capas')
const PUBLICO = '/arquivos/capas'

/**
 * A sigla de cada curso. Curta o bastante para ser lida de relance na
 * miniatura — é isso que faz a capa servir para localizar.
 */
const SIGLAS = {
  'html-estrutura-da-web': 'HTML',
  'css-estilo-e-layout': 'CSS',
  'javascript-interatividade-web': 'JS',
  'programacao-web-javascript': 'JS',
  'html-css': 'HTML+CSS',
  'banco-de-dados': 'SQL',
  'excel-do-zero': 'EXCEL',
  'pacote-office': 'OFFICE',
  'logica-de-programacao': 'LÓGICA',
  'poo-java': 'JAVA',
  'php-backend-web': 'PHP',
  'redes-de-computadores': 'REDES',
  'sistemas-operacionais': 'SO',
  'gerenciador-de-conteudo': 'CMS',
  'cultura-digital': 'DIGITAL',
  'gestao-do-tempo': 'TEMPO',
  'arquitetura-e-manutencao': 'HARDWARE',
  'montagem-e-manutencao': 'MONTAGEM',
  'formatacao-de-computadores': 'FORMATAR',
  'do-codigo-ao-ar': 'GIT',
  'python-do-zero': 'PYTHON',
}

/** Cor por categoria, mantida do gerador antigo para não trocar a identidade. */
const CORES = {
  'Fundamentos': { a: '#2dd4bf', b: '#0d9488' },
  'Programação': { a: '#60a5fa', b: '#2563eb' },
  'Web Development': { a: '#a78bfa', b: '#7c3aed' },
  'Web': { a: '#a78bfa', b: '#7c3aed' },
  'Sistemas': { a: '#fb923c', b: '#ea580c' },
  'Hardware': { a: '#f87171', b: '#dc2626' },
  'Network': { a: '#38bdf8', b: '#0284c7' },
  'Produtividade': { a: '#4ade80', b: '#16a34a' },
  'Tecnologia': { a: '#4ade80', b: '#16a34a' },
  'Banco de Dados': { a: '#fbbf24', b: '#d97706' },
}
/** Cor por nível, para as capas de módulo. */
const CORES_NIVEL = {
  'Fácil': { a: '#4ade80', b: '#16a34a' },
  'Médio': { a: '#fbbf24', b: '#d97706' },
  'Difícil': { a: '#f87171', b: '#dc2626' },
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function quebrar(texto, max, limite) {
  const linhas = []
  let atual = ''
  for (const p of String(texto).split(' ')) {
    if ((atual + ' ' + p).trim().length > max && atual) { linhas.push(atual.trim()); atual = p }
    else atual = (atual + ' ' + p).trim()
  }
  if (atual) linhas.push(atual)
  return linhas.slice(0, limite)
}

function svg({ sigla, titulo, etiqueta, cor, simbolo, lockup }) {
  // A sigla ocupa a capa. O tamanho recua conforme ela cresce, para nunca
  // escapar da margem — "HARDWARE" não pode sair do mesmo corpo de "SQL".
  const corpo = sigla.length <= 3 ? 300 : sigla.length <= 5 ? 230 : sigla.length <= 7 ? 165 : 125
  const linhasTitulo = quebrar(titulo, 34, 2)
  const tspans = linhasTitulo
    .map((l, i) => `<tspan x="80" dy="${i === 0 ? 0 : 46}">${esc(l)}</tspan>`).join('')

  return `<svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b1526"/>
      <stop offset="70%" stop-color="#0d1f35"/>
      <stop offset="100%" stop-color="${cor.b}"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <circle cx="1180" cy="120" r="320" fill="${cor.a}" opacity="0.08"/>
  <circle cx="1180" cy="120" r="200" fill="${cor.a}" opacity="0.08"/>
  <!-- O brasão da escola em círculo claro: sobre o fundo escuro ele
       desaparece sem esse fundo, e é ele que identifica a instituição. -->
  <circle cx="1060" cy="300" r="150" fill="#ffffff" opacity="0.95"/>
  <image href="data:image/png;base64,${simbolo}" x="945" y="185" width="230" height="230"/>

  <rect x="80" y="120" width="72" height="10" rx="5" fill="${cor.a}"/>
  <text x="80" y="180" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700"
        letter-spacing="8" fill="${cor.a}">${esc(etiqueta.toUpperCase())}</text>

  <!-- A linha de base recua conforme o corpo cresce, e o título fica abaixo da
       descida do Q e do J: sem essa folga, "SQL" encostava no subtítulo. -->
  <text x="80" y="${sigla.length <= 3 ? 400 : 410}" font-family="Arial Black, Arial, sans-serif"
        font-size="${corpo}" font-weight="900" fill="#ffffff" letter-spacing="-4">${esc(sigla)}</text>

  <text x="80" y="${sigla.length <= 3 ? 510 : 500}" font-family="Arial, Helvetica, sans-serif" font-size="38"
        font-weight="600" fill="#ffffff" opacity="0.75">${tspans}</text>

  <rect x="0" y="620" width="1280" height="100" fill="#000000" opacity="0.35"/>
  <image href="data:image/png;base64,${lockup}" x="80" y="638" height="64" preserveAspectRatio="xMinYMid meet"/>
  <text x="1200" y="682" text-anchor="end" font-family="Arial, sans-serif" font-size="26"
        font-weight="700" letter-spacing="3" fill="#ffffff" opacity="0.7">E.E. DR. JOÃO BERALDO</text>
</svg>`
}

const url = new URL(env.DATABASE_URL)
const pool = mariadb.createPool({
  host: url.hostname, port: Number(url.port || 3306),
  user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
  database: url.pathname.slice(1), connectionLimit: 2, bigIntAsNumber: true,
})
const c = await pool.getConnection()

try {
  if (!existsSync(PASTA)) mkdirSync(PASTA, { recursive: true })
  // O brasão da escola, não o símbolo do professor: a capa identifica a
  // instituição, e a autoria fica no rodapé.
  const simbolo = readFileSync(resolve(RAIZ, 'public/logo-transparente.png')).toString('base64')
  const lockup = readFileSync(resolve(RAIZ, 'public/cursos/lockup-horizontal.png')).toString('base64')
  const filtro = process.argv[2]
  const carimbo = Number(process.env.CARIMBO || '1')

  const cursos = await c.query(
    filtro ? 'SELECT id, slug, titulo, categoria FROM cursos WHERE slug = ?' : 'SELECT id, slug, titulo, categoria FROM cursos',
    filtro ? [filtro] : []
  )
  for (const curso of cursos) {
    const sigla = SIGLAS[curso.slug] ?? curso.titulo.split(/[\s—-]+/)[0].toUpperCase().slice(0, 8)
    const cor = CORES[curso.categoria] ?? CORES['Programação']
    const png = await sharp(Buffer.from(svg({
      sigla, titulo: curso.titulo, etiqueta: curso.categoria ?? 'Curso', cor, simbolo, lockup,
    }))).png().toBuffer()

    writeFileSync(resolve(PASTA, `${curso.slug}.png`), png)
    // O carimbo na URL evita o next/image servir a capa antiga do cache.
    await c.query('UPDATE cursos SET capa_url = ? WHERE id = ?',
      [`${PUBLICO}/${curso.slug}.png?v=${carimbo}`, curso.id])
    console.log(`curso   ${sigla.padEnd(9)} ${curso.slug}`)
  }

  if (!filtro) {
    const modulos = await c.query('SELECT id, slug, nome, nivel FROM modulos')
    for (const m of modulos) {
      const sigla = m.nivel.toUpperCase()
      const cor = CORES_NIVEL[m.nivel] ?? CORES['Programação']
      const png = await sharp(Buffer.from(svg({
        sigla, titulo: m.nome, etiqueta: 'Módulo', cor, simbolo, lockup,
      }))).png().toBuffer()
      writeFileSync(resolve(PASTA, `modulo-${m.slug}.png`), png)
      await c.query('UPDATE modulos SET capa_url = ? WHERE id = ?',
        [`${PUBLICO}/modulo-${m.slug}.png?v=${carimbo}`, m.id])
      console.log(`módulo  ${sigla.padEnd(9)} ${m.slug}`)
    }
  }
  console.log(`\ncapas em ${PASTA}`)
} finally {
  c.release()
  await pool.end()
}
