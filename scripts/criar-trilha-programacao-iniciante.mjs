/**
 * Cria a trilha "Programação Iniciante" e move o curso de Fluxogramas para ela.
 *
 *   node scripts/criar-trilha-programacao-iniciante.mjs             simula
 *   node scripts/criar-trilha-programacao-iniciante.mjs --aplicar   grava
 *
 * Por que trilha própria: em /admin/cursos cada card é uma trilha. Com o
 * Fluxogramas dentro da trilha Programação, quem nunca programou só o
 * encontrava abrindo um card de 15 cursos e rolando até a posição 8. Card
 * próprio é o pedido do André: quem chega sem saber nada vê onde começar.
 *
 * A trilha entra na ordem 5, logo antes de Programação, que desce para 6.
 * O curso sai da trilha Programação (onde era o 8) e vira o 1 da nova; os
 * cursos que vinham depois dele fecham o buraco.
 *
 * Idempotente: rodar duas vezes não duplica nem embaralha a ordem.
 *
 * ATENÇÃO ao charset: `icone` guarda emoji de 4 bytes. Este script usa o
 * driver mariadb, que já fala utf8mb4. Pelo cliente `mysql` da linha de
 * comando é preciso passar `--default-character-set=utf8mb4`, senão o INSERT
 * morre com "Incorrect string value: '\xF0\x9F...'".
 */
import { readFileSync } from 'node:fs'
import mariadb from '../node_modules/mariadb/promise.js'

const APLICAR = process.argv.includes('--aplicar')

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, '')] })
)

const TRILHA = {
  slug: 'programacao-iniciante',
  nome: 'Programação Iniciante',
  icone: '🧭',
  cor: 'cyan-600',
  ordem: 5,
  descricao:
    'O passo antes do código: desenhar o caminho de um problema até a solução. Comece aqui se nunca programou.',
}

const CURSO_SLUG = 'fluxogramas'
const TRILHA_ANTIGA = 'programacao'

const url = new URL(env.DATABASE_URL)
const pool = mariadb.createPool({
  host: url.hostname, port: Number(url.port || 3306),
  user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
  database: url.pathname.slice(1), connectionLimit: 2, bigIntAsNumber: true,
})
const c = await pool.getConnection()
const acao = m => console.log(`${APLICAR ? '  ok  ' : ' sim  '} ${m}`)

try {
  const [existente] = await c.query('SELECT id FROM trilhas WHERE slug = ?', [TRILHA.slug])
  let trilhaId = existente?.id

  if (!trilhaId) {
    acao(`abrir espaço: trilhas de ordem >= ${TRILHA.ordem} descem uma casa`)
    if (APLICAR) await c.query('UPDATE trilhas SET ordem = ordem + 1 WHERE ordem >= ?', [TRILHA.ordem])
    acao(`criar trilha "${TRILHA.nome}" na ordem ${TRILHA.ordem}`)
    if (APLICAR) {
      await c.query(
        `INSERT INTO trilhas (id, nome, slug, descricao, icone, cor_tailwind, ordem, publicada)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, 1)`,
        [TRILHA.nome, TRILHA.slug, TRILHA.descricao, TRILHA.icone, TRILHA.cor, TRILHA.ordem]
      )
      trilhaId = (await c.query('SELECT id FROM trilhas WHERE slug = ?', [TRILHA.slug]))[0].id
    }
  } else {
    acao('trilha já existe, atualizando nome, descrição, ícone e cor')
    if (APLICAR) {
      await c.query('UPDATE trilhas SET nome=?, descricao=?, icone=?, cor_tailwind=?, publicada=1 WHERE id=?',
        [TRILHA.nome, TRILHA.descricao, TRILHA.icone, TRILHA.cor, trilhaId])
    }
  }

  const [curso] = await c.query('SELECT id, trilha_id, ordem_na_trilha FROM cursos WHERE slug = ?', [CURSO_SLUG])
  if (!curso) throw new Error(`curso ${CURSO_SLUG} não existe: rode criar-modulo-programacao-iniciante.mjs antes`)

  if (APLICAR && curso.trilha_id === trilhaId) {
    acao(`curso "${CURSO_SLUG}" já está na trilha nova`)
  } else {
    const [antiga] = await c.query('SELECT id FROM trilhas WHERE slug = ?', [TRILHA_ANTIGA])
    acao(`mover "${CURSO_SLUG}" para a trilha nova, posição 1`)
    if (APLICAR) {
      await c.query('UPDATE cursos SET trilha_id=?, ordem_na_trilha=1 WHERE id=?', [trilhaId, curso.id])
      // Fecha o buraco que o curso deixou na trilha antiga.
      if (antiga && curso.trilha_id === antiga.id && curso.ordem_na_trilha != null) {
        acao(`fechar o buraco em "${TRILHA_ANTIGA}": quem vinha depois da posição ${curso.ordem_na_trilha} sobe uma casa`)
        await c.query('UPDATE cursos SET ordem_na_trilha = ordem_na_trilha - 1 WHERE trilha_id = ? AND ordem_na_trilha > ?',
          [antiga.id, curso.ordem_na_trilha])
      }
    }
  }

  if (!APLICAR) console.log('\n(simulação: passe --aplicar para gravar)')
  else console.log('\ntrilha no lugar, com o curso de Fluxogramas dentro')
} finally {
  c.release()
  await pool.end()
}
