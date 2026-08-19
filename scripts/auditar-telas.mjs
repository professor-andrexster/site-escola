/**
 * Auditoria de contraste NO NAVEGADOR.
 *
 *   node scripts/auditar-telas.mjs                 audita as telas de curso
 *   node scripts/auditar-telas.mjs --todas         inclui painel e site
 *   node scripts/auditar-telas.mjs /admin/perfil   uma rota só
 *
 * Por que este script existe, tendo o `auditar-ui.mjs`: aquele lê o CÓDIGO e
 * confere pares de classe conhecidos. Ele passa limpo mesmo quando a tela está
 * ilegível, porque o defeito que aparece de verdade não está numa classe
 * isolada — está na COMBINAÇÃO que só existe depois da cascata: um componente
 * de tema claro dentro do tema escuro do curso, um `text-white` herdado dentro
 * de um cartão `bg-white`, um `<mark>` com fundo próprio sobre fundo igual.
 *
 * Aqui o Chromium renderiza a página, e para cada nó com texto visível a gente
 * pergunta ao próprio navegador: qual é a cor computada da letra, e qual é o
 * fundo EFETIVO atrás dela — subindo a árvore até achar um fundo opaco e
 * compondo o alfa no caminho. Com os dois, o contraste WCAG é aritmética.
 *
 * É assim que "fundo com a cor da mesma cor da letra" vira um erro que falha o
 * comando, em vez de um defeito que alguém encontra usando o site.
 */
import { readFileSync, existsSync } from 'node:fs'
import { createHash, randomBytes } from 'node:crypto'
import { chromium } from 'playwright'
import mariadb from '../node_modules/mariadb/promise.js'

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:3004'
const CHROMIUM_DO_SERVIDOR =
  '/root/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell'

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, '')] })
)

/** WCAG 2.1: 4.5:1 para texto normal, 3:1 para texto grande (>=18px, ou >=14px negrito). */
const MIN_NORMAL = 4.5
const MIN_GRANDE = 3

const url = new URL(env.DATABASE_URL)
const pool = mariadb.createPool({
  host: url.hostname, port: Number(url.port || 3306),
  user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
  database: url.pathname.slice(1), connectionLimit: 2, bigIntAsNumber: true,
})

/**
 * Abre uma sessão de leitura direto no banco e devolve o token.
 *
 * Sem isso a auditoria só alcança as páginas públicas — e é justamente dentro
 * do curso, atrás do login, que ficam as telas que o aluno usa o dia inteiro.
 * A sessão é apagada no fim, sempre, mesmo se a auditoria falhar.
 */
async function abrirSessaoDe(c, email) {
  const [u] = await c.query('SELECT id, email FROM usuarios WHERE email = ?', [email])
  if (!u) throw new Error(`usuário não encontrado: ${email}`)
  const token = randomBytes(32).toString('hex')
  const hash = createHash('sha256').update(token).digest('hex')
  const expira = new Date(Date.now() + 60 * 60 * 1000)
  await c.query(
    'INSERT INTO sessoes (id, usuario_id, token_hash, expira_em, criado_em) VALUES (UUID(), ?, ?, ?, NOW())',
    [u.id, hash, expira]
  )
  return { token, hash, usuario: u }
}

/** Roda dentro da página. Devolve os nós de texto que falham o contraste. */
const MEDIR = () => {
  const luminancia = ([r, g, b]) => {
    const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
  }
  const razao = (a, b) => {
    const [x, y] = [luminancia(a), luminancia(b)].sort((p, q) => q - p)
    return (x + 0.05) / (y + 0.05)
  }
  const rgba = s => {
    const m = String(s).match(/[\d.]+/g)
    if (!m) return null
    return [+m[0], +m[1], +m[2], m[3] === undefined ? 1 : +m[3]]
  }
  const sobre = (frente, fundo) => {
    const a = frente[3]
    return [0, 1, 2].map(i => Math.round(frente[i] * a + fundo[i] * (1 - a)))
  }

  /**
   * O fundo efetivo atrás de um elemento: sobe a árvore acumulando as camadas
   * translúcidas até encontrar uma opaca. É o passo que o auditor de código não
   * consegue dar — `bg-white/5` seis vezes empilhado dá um cinza que nenhuma
   * classe sozinha descreve.
   */
  const fundoEfetivo = el => {
    const camadas = []
    for (let n = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n)
      const c = rgba(cs.backgroundColor)
      if (cs.backgroundImage !== 'none') return { cor: null, imagem: true }
      if (!c || c[3] === 0) continue
      camadas.push(c)
      if (c[3] === 1) break
    }
    if (!camadas.length) return { cor: [255, 255, 255], imagem: false }
    let base = camadas[camadas.length - 1].slice(0, 3)
    for (let i = camadas.length - 2; i >= 0; i--) base = sobre(camadas[i], base)
    return { cor: base, imagem: false }
  }

  const caminho = el => {
    const partes = []
    for (let n = el; n && n.tagName && partes.length < 4; n = n.parentElement) {
      const cls = (n.className && typeof n.className === 'string')
        ? '.' + n.className.trim().split(/\s+/).slice(0, 3).join('.')
        : ''
      partes.unshift(n.tagName.toLowerCase() + cls)
    }
    return partes.join(' > ')
  }

  const falhas = []
  for (const el of document.querySelectorAll('body *')) {
    // Só nós que de fato pintam texto próprio: com filho-elemento a cor
    // medida seria a do container, não a da letra que se vê.
    const texto = [...el.childNodes]
      .filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').trim()
    if (!texto) continue

    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue
    const r = el.getBoundingClientRect()
    if (r.width < 2 || r.height < 2) continue

    const frente = rgba(cs.color)
    if (!frente) continue
    const fundo = fundoEfetivo(el)
    // Sobre imagem ou gradiente não há uma cor de fundo única para comparar;
    // marcar isso como falha seria ruído, e como aprovação seria mentira.
    if (fundo.imagem) continue

    const cor = frente[3] < 1 ? sobre(frente, fundo.cor) : frente.slice(0, 3)
    const px = parseFloat(cs.fontSize)
    const peso = parseInt(cs.fontWeight, 10) || 400
    const grande = px >= 24 || (px >= 18.66 && peso >= 700)
    const minimo = grande ? 3 : 4.5
    const c = razao(cor, fundo.cor)

    if (c < minimo) {
      falhas.push({
        texto: texto.slice(0, 60),
        contraste: Math.round(c * 100) / 100,
        minimo,
        cor: `rgb(${cor.join(',')})`,
        fundo: `rgb(${fundo.cor.join(',')})`,
        px: Math.round(px * 10) / 10,
        peso,
        onde: caminho(el),
      })
    }
  }
  return falhas
}

async function rotasDeCurso(c) {
  const cursos = await c.query('SELECT slug FROM cursos WHERE publicado = 1 ORDER BY slug')
  const rotas = ['/admin/cursos', '/admin/modulos', '/admin/cursos/desafios', '/admin/meu-perfil']
  for (const cur of cursos) {
    rotas.push(`/admin/cursos/${cur.slug}`)
    const [a] = await c.query(
      'SELECT a.slug FROM aulas a JOIN cursos c ON c.id = a.curso_id WHERE c.slug = ? AND a.publicado = 1 ORDER BY a.ordem LIMIT 1',
      [cur.slug]
    )
    if (a) rotas.push(`/admin/cursos/${cur.slug}/${a.slug}`)
  }
  const [d] = await c.query('SELECT id FROM curso_desafios ORDER BY vale_certificado DESC LIMIT 1')
  if (d) rotas.push(`/admin/cursos/desafios/${d.id}`)
  return rotas
}

const c = await pool.getConnection()
let sessao = null
let navegador = null
let falhou = false

try {
  const argRota = process.argv.slice(2).find(a => a.startsWith('/'))
  const rotas = argRota
    ? [argRota]
    : process.argv.includes('--todas')
      ? [...(await rotasDeCurso(c)), '/', '/cursos', '/admin']
      : await rotasDeCurso(c)

  sessao = await abrirSessaoDe(c, process.env.AUDITOR_EMAIL ?? 'andre@escolaestadualdrjoaoberaldo.com')

  // O cache do servidor já tem um Chromium, de build mais novo que o desta
  // versão do Playwright. Reaproveitar evita baixar 170 MB de navegador só
  // para medir cor — e se um dia o cache mudar, o launch padrão assume.
  navegador = await chromium.launch(
    existsSync(CHROMIUM_DO_SERVIDOR) ? { executablePath: CHROMIUM_DO_SERVIDOR } : {}
  )
  const contexto = await navegador.newContext({ viewport: { width: 1440, height: 900 } })
  await contexto.addCookies([{
    name: 'jb_sessao', value: sessao.token,
    domain: '127.0.0.1', path: '/', httpOnly: true, sameSite: 'Lax',
  }])

  console.log(`AUDITORIA DE CONTRASTE NO NAVEGADOR\n${rotas.length} rotas · sessão de ${sessao.usuario.email}\n`)

  const porTexto = new Map()
  let totalFalhas = 0

  for (const rota of rotas) {
    const pagina = await contexto.newPage()
    let falhas = []
    try {
      const r = await pagina.goto(BASE + rota, { waitUntil: 'networkidle', timeout: 30000 })
      if (!r || r.status() >= 400) {
        console.log(`  ${String(r?.status() ?? '---').padStart(3)}  ${rota}`)
        await pagina.close()
        continue
      }
      falhas = await pagina.evaluate(MEDIR)
    } catch (e) {
      console.log(`  ERR  ${rota} — ${e.message.split('\n')[0]}`)
      await pagina.close()
      continue
    }
    await pagina.close()

    totalFalhas += falhas.length
    console.log(`  ${falhas.length ? 'FALHA' : '  ok '}  ${rota}${falhas.length ? `  (${falhas.length})` : ''}`)
    for (const f of falhas) {
      // Agrupa por assinatura: o mesmo defeito repetido em 19 cursos é UM
      // defeito de componente, e a lista precisa dizer isso.
      const chave = `${f.cor}|${f.fundo}|${f.onde.split(' > ').pop()}`
      const j = porTexto.get(chave) ?? { ...f, rotas: [], exemplos: [] }
      j.rotas.push(rota)
      if (j.exemplos.length < 3) j.exemplos.push(f.texto)
      porTexto.set(chave, j)
    }
  }

  console.log(`\n== ${porTexto.size} defeito(s) distinto(s), ${totalFalhas} ocorrência(s) ==\n`)
  const ordenado = [...porTexto.values()].sort((a, b) => a.contraste - b.contraste)
  for (const f of ordenado) {
    const igual = f.cor === f.fundo ? '  <-- LETRA DA MESMA COR DO FUNDO' : ''
    console.log(`  ${String(f.contraste).padStart(5)}:1  (mínimo ${f.minimo})${igual}`)
    console.log(`     letra ${f.cor} sobre fundo ${f.fundo} · ${f.px}px peso ${f.peso}`)
    console.log(`     ${f.onde}`)
    console.log(`     texto: ${f.exemplos.map(e => JSON.stringify(e)).join(', ')}`)
    console.log(`     em ${f.rotas.length} rota(s): ${f.rotas.slice(0, 3).join(', ')}${f.rotas.length > 3 ? ` +${f.rotas.length - 3}` : ''}\n`)
  }

  falhou = totalFalhas > 0
  console.log(falhou ? 'FALHOU' : 'sem falhas')
} finally {
  if (navegador) await navegador.close()
  if (sessao) await c.query('DELETE FROM sessoes WHERE token_hash = ?', [sessao.hash])
  c.release()
  await pool.end()
}

process.exit(falhou ? 1 : 0)
