/**
 * Gera capas PNG brandadas (marca Professor André) para todos os cursos e
 * atualiza cursos.capa_url. Reutilizável: rode de novo quando criar cursos.
 *
 * Uso: npx tsx scripts/gerar-capas.ts [slug]   (sem slug = todos os cursos)
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import sharp from 'sharp'

const envPath = resolve(process.cwd(), '.env.local')
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  }
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Cor de destaque por categoria (tema escuro do player de cursos)
const CORES: Record<string, { accent: string; accent2: string }> = {
  'Fundamentos': { accent: '#2dd4bf', accent2: '#0d9488' },
  'Programação': { accent: '#60a5fa', accent2: '#2563eb' },
  'Web': { accent: '#a78bfa', accent2: '#7c3aed' },
  'Sistemas': { accent: '#fb923c', accent2: '#ea580c' },
  'Produtividade': { accent: '#4ade80', accent2: '#16a34a' },
  'Excel': { accent: '#4ade80', accent2: '#16a34a' },
}

function escapeXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// Quebra o título em até 3 linhas de ~16 caracteres
function quebrarTitulo(titulo: string): string[] {
  const palavras = titulo.split(' ')
  const linhas: string[] = []
  let atual = ''
  for (const p of palavras) {
    if ((atual + ' ' + p).trim().length > 16 && atual) {
      linhas.push(atual.trim())
      atual = p
    } else {
      atual = (atual + ' ' + p).trim()
    }
  }
  if (atual) linhas.push(atual)
  return linhas.slice(0, 3)
}

function montarSvg(titulo: string, categoria: string | null, simboloB64: string, lockupB64: string): string {
  const { accent, accent2 } = CORES[categoria ?? ''] ?? CORES['Programação']
  const linhas = quebrarTitulo(titulo)
  const fontSize = linhas.some(l => l.length > 13) ? 84 : 96
  const tituloY = 340 - (linhas.length - 1) * (fontSize * 0.6)
  const tspans = linhas
    .map((l, i) => `<tspan x="80" dy="${i === 0 ? 0 : fontSize * 1.12}">${escapeXml(l)}</tspan>`)
    .join('')

  return `<svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b1526"/>
      <stop offset="70%" stop-color="#0d1f35"/>
      <stop offset="100%" stop-color="${accent2}"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <circle cx="1180" cy="120" r="320" fill="${accent}" opacity="0.08"/>
  <circle cx="1180" cy="120" r="200" fill="${accent}" opacity="0.08"/>
  <image href="data:image/png;base64,${simboloB64}" x="880" y="180" width="360" height="360" opacity="0.35"/>
  <rect x="80" y="150" width="72" height="10" rx="5" fill="${accent}"/>
  ${categoria ? `<text x="80" y="215" font-family="Arial, sans-serif" font-size="30" font-weight="700" letter-spacing="8" fill="${accent}">${escapeXml(categoria.toUpperCase())}</text>` : ''}
  <text x="80" y="${tituloY}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="900" fill="#ffffff">${tspans}</text>
  <rect x="0" y="620" width="1280" height="100" fill="#000000" opacity="0.35"/>
  <image href="data:image/png;base64,${lockupB64}" x="80" y="638" height="64" preserveAspectRatio="xMinYMid meet"/>
  <text x="1200" y="682" text-anchor="end" font-family="Arial, sans-serif" font-size="26" font-weight="700" letter-spacing="3" fill="#ffffff" opacity="0.7">E.E. DR. JOÃO BERALDO</text>
</svg>`
}

async function main() {
  const filtroSlug = process.argv[2]
  const simboloB64 = readFileSync(resolve('public/cursos/simbolo-transparente.png')).toString('base64')
  const lockupB64 = readFileSync(resolve('public/cursos/lockup-horizontal.png')).toString('base64')

  let query = supabase.from('cursos').select('id, slug, titulo, categoria')
  if (filtroSlug) query = query.eq('slug', filtroSlug)
  const { data: cursos, error } = await query
  if (error || !cursos) throw new Error(error?.message)

  for (const curso of cursos) {
    const svg = montarSvg(curso.titulo, curso.categoria, simboloB64, lockupB64)
    const png = await sharp(Buffer.from(svg)).png().toBuffer()

    const path = `capas/${curso.slug}.png`
    const { error: upError } = await supabase.storage
      .from('cursos-slides')
      .upload(path, png, { contentType: 'image/png', upsert: true })
    if (upError) throw new Error(`Upload ${curso.slug}: ` + upError.message)

    const { data: pub } = supabase.storage.from('cursos-slides').getPublicUrl(path)
    // cache-buster: a URL muda a cada regeneração para o next/image não servir capa velha
    const url = `${pub.publicUrl}?v=${Date.now()}`
    await supabase.from('cursos').update({ capa_url: url }).eq('id', curso.id)
    console.log(`OK capa: ${curso.slug}`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
