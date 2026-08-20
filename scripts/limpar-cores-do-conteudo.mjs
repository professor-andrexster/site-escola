/**
 * Tira a cor fixa do conteúdo das aulas e dos desafios.
 *
 *   node scripts/limpar-cores-do-conteudo.mjs            simula
 *   node scripts/limpar-cores-do-conteudo.mjs --aplicar  grava
 *
 * O conteúdo foi escrito para um tema CLARO: 209 títulos com
 * `style="color: #0066cc"`, mais alguns `#333` e `#1e40af`. No tema escuro do
 * player isso vai de 2.95:1 a 1.30:1 — o de `#333` some por completo.
 *
 * A correção não é trocar por outro tom fixo, é TIRAR: o `proseAula` já define
 * a cor de cada elemento (`[&_h2]:text-white`, `[&_p]:text-white/70`), e um
 * conteúdo sem cor própria acompanha o tema em vez de brigar com ele. Se um dia
 * o player virar claro de novo, nada precisa ser reescrito.
 *
 * Saem `color`, `background` e `border` — as declarações que decidem aparência.
 * Ficam largura, alinhamento e `border-collapse`: são estrutura da tabela, valem
 * em qualquer tema, e tirá-las mudaria o layout sem motivo.
 */
import { writeFileSync } from 'node:fs'
import { readFileSync, existsSync } from 'node:fs'
import mariadb from '../node_modules/mariadb/promise.js'

const APLICAR = process.argv.includes('--aplicar')

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, '')] })
)

/**
 * Tira `color: X` do atributo style, e o style inteiro se ficar vazio.
 *
 * A limpeza acontece dentro de uma TAG de verdade (`<h2 style="…">`), nunca no
 * texto solto. Procurar `style="…"` no meio do parágrafo apagaria a menção em
 * prosa: a aula de especificidade escreve `Inline: 1000 pontos (ex: style="")`,
 * e o `style=""` ali é o assunto da frase, não um atributo.
 */
/**
 * As declarações que decidem APARÊNCIA e por isso pertencem ao tema, não ao
 * texto. Largura, alinhamento e `border-collapse` não entram: são estrutura da
 * tabela, valem em qualquer tema e tirá-las mudaria o layout sem motivo.
 */
const DO_TEMA = /^\s*(color|background|background-color|border(-(top|right|bottom|left))?)\s*:/i

function tirarCor(trecho) {
  return trecho.replace(/<([a-z][a-z0-9]*)\b([^>]*)>/gi, (tag, nome, atributos) => {
    const limpos = atributos.replace(/\sstyle="([^"]*)"/gi, (inteiro, corpo) => {
      const restante = corpo
        .split(';')
        .filter(d => d.trim() && !DO_TEMA.test(d))
        .join(';')
        .trim()
      return restante ? ` style="${restante}"` : ''
    })
    return limpos === atributos ? tag : `<${nome}${limpos}>`
  })
}

/**
 * Aplica a limpeza fora de `<pre>` e `<code>`.
 *
 * Dentro deles o `style="color: …"` não é estilo, é MATÉRIA: a aula "CSS
 * Inline (Evitar)" tem exatamente `&lt;h1 style="color: #0066ff"&gt;` como
 * exemplo do que não fazer. Limpar ali apagaria a lição e deixaria um exemplo
 * que não exemplifica nada.
 */
function semCor(html) {
  const partes = html.split(/(<pre[\s\S]*?<\/pre>|<code[\s\S]*?<\/code>)/gi)
  return partes
    .map((parte, i) => (i % 2 === 1 ? parte : tirarCor(parte)))
    .join('')
}

const url = new URL(env.DATABASE_URL)
const pool = mariadb.createPool({
  host: url.hostname, port: Number(url.port || 3306),
  user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
  database: url.pathname.slice(1), connectionLimit: 2, bigIntAsNumber: true,
})
const c = await pool.getConnection()

try {
  const aulas = await c.query(
    `SELECT a.id, a.titulo, c.titulo curso, a.conteudo
       FROM aulas a JOIN cursos c ON c.id = a.curso_id
      WHERE a.conteudo LIKE '%style=%'`
  )
  const desafios = await c.query(
    "SELECT id, titulo, enunciado FROM curso_desafios WHERE enunciado LIKE '%style=%'"
  )

  const backup = []
  const porCurso = new Map()
  let mudadas = 0

  for (const a of aulas) {
    const novo = semCor(a.conteudo)
    if (novo === a.conteudo) continue
    backup.push({ tabela: 'aulas', id: a.id, antes: a.conteudo })
    porCurso.set(a.curso, (porCurso.get(a.curso) ?? 0) + 1)
    mudadas++
    if (APLICAR) await c.query('UPDATE aulas SET conteudo = ? WHERE id = ?', [novo, a.id])
  }

  let desafiosMudados = 0
  for (const d of desafios) {
    const novo = semCor(d.enunciado)
    if (novo === d.enunciado) continue
    backup.push({ tabela: 'curso_desafios', id: d.id, antes: d.enunciado })
    desafiosMudados++
    if (APLICAR) await c.query('UPDATE curso_desafios SET enunciado = ? WHERE id = ?', [novo, d.id])
  }

  // O backup sai sempre, inclusive na simulação: é ele que torna a mudança
  // reversível, e escrevê-lo só no modo --aplicar seria confiar na primeira vez.
  // Nunca sobrescreve: numa segunda passada o arquivo existente guarda o estado
  // ANTERIOR, que é o que permite voltar mais de um passo.
  let arquivo = new URL('../backup-cores-conteudo.json', import.meta.url)
  for (let i = 2; existsSync(arquivo); i++) {
    arquivo = new URL(`../backup-cores-conteudo-${i}.json`, import.meta.url)
  }
  writeFileSync(arquivo, JSON.stringify(backup, null, 1))

  console.log(`aulas alteradas:    ${mudadas} de ${aulas.length} com atributo style`)
  console.log(`desafios alterados: ${desafiosMudados} de ${desafios.length}`)
  console.log('\npor curso:')
  for (const [k, v] of [...porCurso].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(v).padStart(3)} aula(s)  ${k}`)
  }
  console.log(`\nbackup do conteúdo original: ${arquivo.pathname}`)
  if (!APLICAR) console.log('\n(simulação — passe --aplicar para gravar)')
} finally {
  c.release()
  await pool.end()
}
