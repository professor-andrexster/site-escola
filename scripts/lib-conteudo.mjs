/**
 * A parte comum dos scripts que escrevem conteúdo de aula.
 *
 * Os três scripts de conteúdo do módulo HTML e CSS faziam a mesma coisa —
 * acrescentar um bloco a uma aula existente, criar aula nova, criar o desafio
 * dela. Ficava repetido em cada um, e repetido é onde um deles diverge sem
 * ninguém notar.
 *
 * Tudo aqui é idempotente: rodar duas vezes não duplica bloco nem aula.
 */
import { readFileSync } from 'node:fs'
import mariadb from '../node_modules/mariadb/promise.js'

const APLICAR = process.argv.includes('--aplicar')

function conexao() {
  const env = Object.fromEntries(
    readFileSync(new URL('../.env', import.meta.url), 'utf8')
      .split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
      .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, '')] })
  )
  const url = new URL(env.DATABASE_URL)
  return mariadb.createPool({
    host: url.hostname, port: Number(url.port || 3306),
    user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
    database: url.pathname.slice(1), connectionLimit: 2, bigIntAsNumber: true,
  })
}

/**
 * @param {object} plano
 * @param {Record<string,string>} plano.AMPLIACOES  slug da aula -> bloco a acrescentar
 * @param {Array} plano.NOVAS                        aulas novas, cada uma com o curso de destino
 */
export async function aplicar({ AMPLIACOES = {}, NOVAS = [] }) {
  const pool = conexao()
  const c = await pool.getConnection()

  try {
    for (const [slug, bloco] of Object.entries(AMPLIACOES)) {
      const [aula] = await c.query('SELECT id, titulo, conteudo FROM aulas WHERE slug = ?', [slug])
      if (!aula) { console.log(`  !   aula não encontrada: ${slug}`); continue }

      // A primeira linha do bloco serve de marca: se já está no conteúdo, o
      // bloco entrou numa execução anterior.
      const marca = bloco.trim().split('\n')[0]
      const ja = aula.conteudo.includes(marca)
      console.log(`  ${ja ? '=  ' : APLICAR ? 'ok ' : 'sim'}  ampliar "${aula.titulo}" (+${Math.round(bloco.length / 1000)}k)`)
      if (ja || !APLICAR) continue

      await c.query('UPDATE aulas SET conteudo = CONCAT(conteudo, ?), updated_at = NOW() WHERE id = ?',
        ['\n' + bloco.trim(), aula.id])
    }

    for (const nova of NOVAS) {
      const [curso] = await c.query('SELECT id FROM cursos WHERE slug = ?', [nova.curso])
      if (!curso) { console.log(`  !   curso não encontrado: ${nova.curso}`); continue }

      const [ja] = await c.query('SELECT id FROM aulas WHERE slug = ?', [nova.slug])
      console.log(`  ${APLICAR ? 'ok ' : 'sim'}  ${ja ? 'atualizar' : 'criar'} "${nova.titulo}"`)
      if (!APLICAR) continue

      if (ja) {
        await c.query(
          `UPDATE aulas SET titulo=?, descricao=?, conteudo=?, ordem=?, duracao_estimada_min=?,
                            curso_id=?, publicado=1, updated_at=NOW() WHERE id=?`,
          [nova.titulo, nova.descricao, nova.conteudo.trim(), nova.ordem, nova.min, curso.id, ja.id]
        )
      } else {
        await c.query(
          `INSERT INTO aulas (id, curso_id, titulo, slug, descricao, ordem, duracao_estimada_min,
                              publicado, conteudo, created_at, updated_at)
           VALUES (UUID(), ?, ?, ?, ?, ?, ?, 1, ?, NOW(), NOW())`,
          [curso.id, nova.titulo, nova.slug, nova.descricao, nova.ordem, nova.min, nova.conteudo.trim()]
        )
      }

      if (!nova.desafio) continue
      const [aulaId] = await c.query('SELECT id FROM aulas WHERE slug = ?', [nova.slug])
      const [desafioJa] = await c.query('SELECT id FROM curso_desafios WHERE aula_id = ?', [aulaId.id])
      if (desafioJa) {
        await c.query('UPDATE curso_desafios SET titulo=?, enunciado=?, curso_id=? WHERE id=?',
          [nova.desafio.titulo, nova.desafio.enunciado.trim(), curso.id, desafioJa.id])
      } else {
        await c.query(
          `INSERT INTO curso_desafios (id, curso_id, aula_id, titulo, enunciado, tipo, ordem, vale_certificado, created_at)
           VALUES (UUID(), ?, ?, ?, ?, 'pratico', ?, 0, NOW())`,
          [curso.id, aulaId.id, nova.desafio.titulo, nova.desafio.enunciado.trim(), nova.ordem]
        )
      }
    }

    if (!APLICAR) console.log('\n(simulação — passe --aplicar para gravar)')
  } finally {
    c.release()
    await pool.end()
  }
}
