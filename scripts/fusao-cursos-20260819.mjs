/**
 * Fusão dos cursos que se sobrepunham.
 *
 *   node fusao-cursos.mjs [--aplicar]
 *
 * DUAS operações independentes:
 *
 * A) "HTML e CSS" (20h, 13 alunos) sai de cena, mas nada se perde:
 *    - as duas aulas exclusivas (GitHub Pages e Projeto integrador) passam
 *      para o curso de CSS;
 *    - o progresso dos 13 alunos é remapeado por equivalência de assunto;
 *    - o curso é despublicado.
 *
 * B) "Programação Web com JavaScript" (15h, 0 alunos) é o material melhor e
 *    toma o lugar de "JavaScript — Interatividade Web" no módulo:
 *    - entra no módulo Lógica e Programação;
 *    - o progresso dos 10 alunos do curto é remapeado para ele;
 *    - o curto é despublicado.
 *
 * Certificado já emitido NÃO é tocado: ele guarda o título congelado e continua
 * valendo. A Ana Clara tem um de "JavaScript — Interatividade Web", e ele
 * precisa continuar aparecendo no perfil dela depois disto.
 */
import fs from 'node:fs'
import mariadb from '/srv/escola/src/node_modules/mariadb/promise.js'

const APLICAR = process.argv.includes('--aplicar')

/**
 * Equivalência de assunto entre a aula do curso que sai e a do que fica.
 * Uma aula de origem pode creditar VÁRIAS de destino quando de fato cobre as
 * duas — a aula 6 do longo é "seletores, cores e box model", que no curso de
 * CSS são três aulas.
 */
const MAPA_HTML_CSS = {
  1: [['html-estrutura-da-web', 1]],
  2: [['html-estrutura-da-web', 2], ['html-estrutura-da-web', 6]],
  3: [['html-estrutura-da-web', 3]],
  4: [['html-estrutura-da-web', 4]],
  5: [['html-estrutura-da-web', 5]],
  6: [['css-estilo-e-layout', 1], ['css-estilo-e-layout', 2], ['css-estilo-e-layout', 3]],
  7: [['css-estilo-e-layout', 4]],
  8: [['css-estilo-e-layout', 6]],
  // 9 e 10 não são mapeadas: as próprias aulas mudam de curso, levando o
  // progresso junto, sem precisar copiar nada.
}

/** Do curso curto de JS para o longo, que passa a ser o oficial. */
const MAPA_JS = {
  1: [1, 3],  // Fundamentos -> "a página ganha vida" + "variáveis e tipos"
  2: [5],     // Manipulação do DOM -> DOM
  3: [4],     // Eventos -> Funções e eventos
  4: [4],     // Funções e Escopo -> Funções e eventos
  5: [7],     // Arrays e Objetos -> Arrays
  // 6 (Promises e Async/Await) não tem equivalente: o curso longo não cobre.
}

const url = new URL(fs.readFileSync('/srv/escola/src/.env', 'utf8').match(/DATABASE_URL="([^"]+)"/)[1])
const pool = mariadb.createPool({
  host: url.hostname, port: Number(url.port || 3306),
  user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
  database: url.pathname.slice(1), connectionLimit: 2, bigIntAsNumber: true,
})
const c = await pool.getConnection()

const log = (...a) => console.log(...a)
const acao = (m) => log(`${APLICAR ? '  ok  ' : '  sim '} ${m}`)

async function curso(slug) {
  const [r] = await c.query('SELECT id, titulo, carga_horaria FROM cursos WHERE slug = ?', [slug])
  if (!r) throw new Error('curso não encontrado: ' + slug)
  return r
}
async function aulasDe(cursoId) {
  return c.query('SELECT id, ordem, titulo FROM aulas WHERE curso_id = ? ORDER BY ordem', [cursoId])
}

/** Copia a conclusão de uma aula de origem para as aulas de destino. */
async function migrarProgresso(aulasOrigem, resolveDestino, rotulo) {
  const progresso = await c.query(
    `SELECT user_id, aula_id, concluida, concluida_em FROM progresso_aulas
      WHERE aula_id IN (${aulasOrigem.map(() => '?').join(',')})`,
    aulasOrigem.map(a => a.id)
  )
  let criados = 0, jaTinha = 0, semDestino = 0
  for (const p of progresso) {
    const origem = aulasOrigem.find(a => a.id === p.aula_id)
    const destinos = resolveDestino(origem.ordem)
    if (!destinos.length) { semDestino++; continue }
    for (const d of destinos) {
      const [existe] = await c.query(
        'SELECT id, concluida FROM progresso_aulas WHERE user_id = ? AND aula_id = ?',
        [p.user_id, d.id]
      )
      if (existe) {
        // Nunca rebaixa: quem já concluiu no destino continua concluído.
        if (!existe.concluida && p.concluida) {
          if (APLICAR) await c.query(
            'UPDATE progresso_aulas SET concluida = 1, concluida_em = ? WHERE id = ?',
            [p.concluida_em ?? new Date(), existe.id]
          )
          criados++
        } else jaTinha++
        continue
      }
      if (APLICAR) await c.query(
        `INSERT INTO progresso_aulas (id, user_id, aula_id, curso_id, concluida, concluida_em)
         VALUES (UUID(), ?, ?, ?, ?, ?)`,
        [p.user_id, d.id, d.curso_id, p.concluida ? 1 : 0, p.concluida_em ?? null]
      )
      criados++
    }
  }
  acao(`${rotulo}: ${criados} registro(s) de progresso migrado(s), ${jaTinha} já existia(m), ${semDestino} sem equivalente`)
}

try {
  // ==================================================== A) HTML e CSS
  log('\nA) HTML e CSS → HTML + CSS\n')
  const longo = await curso('html-css')
  const cursoHtml = await curso('html-estrutura-da-web')
  const cursoCss = await curso('css-estilo-e-layout')

  const aulasLongo = await aulasDe(longo.id)
  const aulasHtml = await aulasDe(cursoHtml.id)
  const aulasCss = await aulasDe(cursoCss.id)

  const acha = (slug, ordem) => {
    const lista = slug === 'html-estrutura-da-web' ? aulasHtml : aulasCss
    const id = slug === 'html-estrutura-da-web' ? cursoHtml.id : cursoCss.id
    const a = lista.find(x => x.ordem === ordem)
    return a ? { ...a, curso_id: id } : null
  }

  // 1. as duas aulas exclusivas passam para o CSS
  const exclusivas = aulasLongo.filter(a => a.ordem === 9 || a.ordem === 10)
  let proximaOrdem = Math.max(...aulasCss.map(a => a.ordem)) + 1
  for (const a of exclusivas) {
    acao(`aula "${a.titulo}" → curso de CSS, na posição ${proximaOrdem}`)
    if (APLICAR) {
      await c.query('UPDATE aulas SET curso_id = ?, ordem = ? WHERE id = ?', [cursoCss.id, proximaOrdem, a.id])
      // O desafio da aula acompanha: ele aponta para o curso, não só para a aula.
      await c.query('UPDATE curso_desafios SET curso_id = ? WHERE aula_id = ?', [cursoCss.id, a.id])
      await c.query('UPDATE progresso_aulas SET curso_id = ? WHERE aula_id = ?', [cursoCss.id, a.id])
    }
    proximaOrdem++
  }

  // 2. progresso das aulas 1 a 8, por equivalência
  const aulasMapeadas = aulasLongo.filter(a => a.ordem <= 8)
  await migrarProgresso(
    aulasMapeadas,
    ordem => (MAPA_HTML_CSS[ordem] ?? []).map(([slug, o]) => acha(slug, o)).filter(Boolean),
    'HTML e CSS'
  )

  // 3. despublica o longo
  acao(`despublicar "${longo.titulo}" e suas aulas`)
  if (APLICAR) {
    await c.query('UPDATE cursos SET publicado = 0, modulo_id = NULL WHERE id = ?', [longo.id])
    await c.query('UPDATE aulas SET publicado = 0 WHERE curso_id = ?', [longo.id])
  }

  // 4. o CSS ganhou duas aulas: a carga acompanha
  const [{ min }] = await c.query(
    'SELECT COALESCE(SUM(duracao_estimada_min),0) min FROM aulas WHERE curso_id = ?', [cursoCss.id]
  )
  const novaCarga = 12
  acao(`carga do CSS: ${cursoCss.carga_horaria}h → ${novaCarga}h (agora com ${Number(min)} min de aula)`)
  if (APLICAR) await c.query('UPDATE cursos SET carga_horaria = ? WHERE id = ?', [novaCarga, cursoCss.id])

  // ============================================ B) JavaScript
  log('\nB) Programação Web com JavaScript toma o lugar do curto\n')
  const jsLongo = await curso('programacao-web-javascript')
  const jsCurto = await curso('javascript-interatividade-web')
  const aulasJsLongo = await aulasDe(jsLongo.id)
  const aulasJsCurto = await aulasDe(jsCurto.id)

  const [mod] = await c.query("SELECT id, nome, carga_horaria FROM modulos WHERE slug = 'logica-e-programacao'")

  acao(`"${jsLongo.titulo}" entra no módulo ${mod.nome}`)
  if (APLICAR) {
    await c.query(
      "UPDATE cursos SET modulo_id = ?, ordem_no_modulo = 2, nivel = 'Médio' WHERE id = ?",
      [mod.id, jsLongo.id]
    )
  }

  await migrarProgresso(
    aulasJsCurto,
    ordem => (MAPA_JS[ordem] ?? [])
      .map(o => { const a = aulasJsLongo.find(x => x.ordem === o); return a ? { ...a, curso_id: jsLongo.id } : null })
      .filter(Boolean),
    'JavaScript'
  )

  acao(`despublicar "${jsCurto.titulo}" e suas aulas`)
  if (APLICAR) {
    await c.query('UPDATE cursos SET publicado = 0, modulo_id = NULL WHERE id = ?', [jsCurto.id])
    await c.query('UPDATE aulas SET publicado = 0 WHERE curso_id = ?', [jsCurto.id])
  }

  // carga do módulo Lógica e Programação: Lógica(15) + JS longo(15)
  acao(`carga do módulo ${mod.nome}: ${mod.carga_horaria}h → 30h`)
  if (APLICAR) await c.query('UPDATE modulos SET carga_horaria = 30 WHERE id = ?', [mod.id])

  // carga do módulo A Primeira Página: HTML(10) + CSS(12)
  const [modPagina] = await c.query("SELECT id, nome, carga_horaria FROM modulos WHERE slug = 'a-primeira-pagina'")
  acao(`carga do módulo ${modPagina.nome}: ${modPagina.carga_horaria}h → 22h`)
  if (APLICAR) await c.query('UPDATE modulos SET carga_horaria = 22 WHERE id = ?', [modPagina.id])

  if (!APLICAR) log('\n(simulação — passe --aplicar para gravar)')
} finally {
  c.release()
  await pool.end()
}
