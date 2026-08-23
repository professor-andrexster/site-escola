/**
 * Recalcula a carga horária dos cursos, dos módulos e dos certificados.
 *
 *   node scripts/recalcular-cargas.mjs            simula
 *   node scripts/recalcular-cargas.mjs --aplicar  grava
 *
 * O problema: os cursos declaravam 247 horas somadas, e o conteúdo real dá
 * cerca de 100 por qualquer critério honesto. Carga horária não é enfeite —
 * ela vai impressa no certificado, e um número inflado ali é o tipo de coisa
 * que desmonta a credibilidade do documento inteiro se alguém for conferir.
 *
 * O critério escolhido é o CONSERVADOR:
 *
 *   leitura do conteúdo, contada em dobro   (reler, voltar atrás, testar código)
 * + 20 min por exercício de aula
 * + 60 min pelo projeto final do curso
 *
 * A leitura sai do próprio texto: caracteres ÷ 6 dá as palavras (média do
 * português), e ÷ 180 dá os minutos numa leitura de estudo, não de jornal. O
 * fator 2 é o que reconhece que ninguém aprende lendo uma vez.
 *
 * Nenhum curso fica abaixo de 1 hora: o piso existe porque carga zero num
 * certificado não faz sentido.
 */
import { writeFileSync, existsSync } from 'node:fs'
import { readFileSync } from 'node:fs'
import mariadb from '../node_modules/mariadb/promise.js'

const APLICAR = process.argv.includes('--aplicar')

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, '')] })
)

const PALAVRAS_POR_MIN = 180
const CARACTERES_POR_PALAVRA = 6
const FATOR_LEITURA = 2
const MIN_POR_EXERCICIO = 20
const MIN_PROJETO_DE_CURSO = 60
/** O projeto de módulo é maior que o de curso: reúne o que vários cursos deram. */
const MIN_PROJETO_DE_MODULO = 120

function horasDoCurso({ chars, exercicios, projetos }) {
  const palavras = chars / CARACTERES_POR_PALAVRA
  const leitura = (palavras / PALAVRAS_POR_MIN) * FATOR_LEITURA
  const minutos = leitura + exercicios * MIN_POR_EXERCICIO + projetos * MIN_PROJETO_DE_CURSO
  return Math.max(1, Math.round(minutos / 60))
}

const url = new URL(env.DATABASE_URL)
const pool = mariadb.createPool({
  host: url.hostname, port: Number(url.port || 3306),
  user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
  database: url.pathname.slice(1), connectionLimit: 2, bigIntAsNumber: true,
})
const c = await pool.getConnection()

try {
  // Entram TODOS os cursos, inclusive os despublicados: há certificado emitido
  // para curso que saiu do ar na fusão, e ele precisa de uma carga honesta
  // tanto quanto os outros.
  const cursos = await c.query(`
    SELECT c.id, c.slug, c.titulo, c.publicado, c.carga_horaria AS atual, c.modulo_id,
           COALESCE(SUM(CHAR_LENGTH(COALESCE(a.conteudo, ''))), 0) AS chars,
           (SELECT COUNT(*) FROM curso_desafios d
             WHERE d.curso_id = c.id AND d.aula_id IS NOT NULL) AS exercicios,
           (SELECT COUNT(*) FROM curso_desafios d
             WHERE d.curso_id = c.id AND d.vale_certificado = 1) AS projetos
      FROM cursos c
      LEFT JOIN aulas a ON a.curso_id = c.id AND a.publicado = 1
     GROUP BY c.id
     ORDER BY c.publicado DESC, c.titulo`)

  const backup = { cursos: [], modulos: [], certificados: [], aulas: [] }
  const novaCarga = new Map()

  console.log('CURSOS\n')
  console.log('  ' + 'curso'.padEnd(38) + 'hoje   novo   variação')
  console.log('  ' + '-'.repeat(66))

  let antes = 0, depois = 0
  for (const curso of cursos) {
    const nova = horasDoCurso({
      chars: Number(curso.chars),
      exercicios: Number(curso.exercicios),
      projetos: Number(curso.projetos),
    })
    novaCarga.set(curso.id, nova)
    if (curso.publicado) { antes += curso.atual ?? 0; depois += nova }

    const mudou = nova !== curso.atual
    if (mudou) {
      backup.cursos.push({ id: curso.id, slug: curso.slug, carga_horaria: curso.atual })
      if (APLICAR) await c.query('UPDATE cursos SET carga_horaria = ? WHERE id = ?', [nova, curso.id])
    }
    console.log(
      '  ' + (curso.publicado ? '' : '· ') + curso.titulo.slice(0, curso.publicado ? 38 : 36).padEnd(curso.publicado ? 38 : 36) +
      String((curso.atual ?? 0) + 'h').padStart(5) +
      String(nova + 'h').padStart(7) +
      (mudou ? String((nova - (curso.atual ?? 0)) + 'h').padStart(10) : '         =')
    )
  }
  console.log('  ' + '-'.repeat(66))
  console.log('  ' + 'total dos publicados'.padEnd(38) + String(antes + 'h').padStart(5) + String(depois + 'h').padStart(7))
  console.log('  (· = curso despublicado; entra porque tem certificado emitido)')

  // Módulo = soma dos cursos publicados dele, mais o projeto do módulo.
  console.log('\nMÓDULOS\n')
  const modulos = await c.query(`
    SELECT m.id, m.nome, m.carga_horaria AS atual,
           (SELECT COUNT(*) FROM curso_desafios d WHERE d.modulo_id = m.id) AS projetos
      FROM modulos m ORDER BY m.ordem`)

  for (const m of modulos) {
    const doModulo = cursos.filter(x => x.modulo_id === m.id && x.publicado)
    const soma = doModulo.reduce((s, x) => s + (novaCarga.get(x.id) ?? 0), 0)
    const nova = Math.max(1, soma + Math.round((Number(m.projetos) * MIN_PROJETO_DE_MODULO) / 60))
    const mudou = nova !== m.atual
    if (mudou) {
      backup.modulos.push({ id: m.id, nome: m.nome, carga_horaria: m.atual })
      if (APLICAR) await c.query('UPDATE modulos SET carga_horaria = ? WHERE id = ?', [nova, m.id])
    }
    console.log(
      '  ' + m.nome.slice(0, 34).padEnd(36) +
      String((m.atual ?? 0) + 'h').padStart(5) + String(nova + 'h').padStart(7) +
      `   (${doModulo.length} curso${doModulo.length === 1 ? '' : 's'} = ${soma}h + projeto)`
    )
  }

  // O certificado guarda a carga congelada na emissão. Aqui ela é reescrita de
  // propósito: o pedido foi corrigir também o que já saiu, para não ficarem
  // dois números diferentes para o mesmo curso.
  console.log('\nCERTIFICADOS JÁ EMITIDOS\n')
  const certificados = await c.query(
    'SELECT id, codigo, aluno_nome, curso_titulo, curso_id, modulo_id, carga_horaria FROM certificados'
  )

  for (const cert of certificados) {
    let nova = null
    if (cert.curso_id) nova = novaCarga.get(cert.curso_id) ?? null
    else if (cert.modulo_id) {
      const [m] = await c.query('SELECT carga_horaria FROM modulos WHERE id = ?', [cert.modulo_id])
      nova = m?.carga_horaria ?? null
    }

    if (nova === null) {
      console.log(`  ${cert.codigo}  ${cert.curso_titulo.slice(0, 30).padEnd(32)} SEM ORIGEM — mantido em ${cert.carga_horaria}h`)
      continue
    }
    const mudou = nova !== cert.carga_horaria
    if (mudou) {
      backup.certificados.push({ id: cert.id, codigo: cert.codigo, carga_horaria: cert.carga_horaria })
      if (APLICAR) await c.query('UPDATE certificados SET carga_horaria = ? WHERE id = ?', [nova, cert.id])
    }
    console.log(
      `  ${cert.codigo}  ${cert.curso_titulo.slice(0, 30).padEnd(32)}` +
      String(cert.carga_horaria + 'h').padStart(5) + String(nova + 'h').padStart(7) +
      `   ${cert.aluno_nome.split(' ')[0]}`
    )
  }

  // A duração de cada AULA acompanha, distribuída pelo tamanho do conteúdo.
  //
  // Sem este passo a carga do curso passaria a contradizer a soma das aulas na
  // tela — um aluno somando os minutos não chegaria ao número do certificado, e
  // o número que não fecha é justamente o que faz alguém desconfiar do resto.
  console.log('\nDURAÇÃO DAS AULAS\n')
  for (const curso of cursos) {
    const aulas = await c.query(
      `SELECT id, titulo, duracao_estimada_min AS atual,
              CHAR_LENGTH(COALESCE(conteudo, '')) AS chars
         FROM aulas WHERE curso_id = ? AND publicado = 1 ORDER BY ordem`,
      [curso.id]
    )
    if (!aulas.length) continue

    // O projeto final não é aula: sai do bolo antes de dividir.
    const minutosDeAula = novaCarga.get(curso.id) * 60 - Number(curso.projetos) * MIN_PROJETO_DE_CURSO
    const totalChars = aulas.reduce((s, a) => s + Number(a.chars), 0) || 1

    let ajustadas = 0
    for (const aula of aulas) {
      const fatia = (Number(aula.chars) / totalChars) * minutosDeAula
      // Múltiplos de 5 e piso de 10: minuto quebrado numa estimativa passa uma
      // precisão que ela não tem.
      const nova = Math.max(10, Math.round(fatia / 5) * 5)
      if (nova === aula.atual) continue
      backup.aulas.push({ id: aula.id, titulo: aula.titulo, duracao_estimada_min: aula.atual })
      ajustadas++
      if (APLICAR) await c.query('UPDATE aulas SET duracao_estimada_min = ? WHERE id = ?', [nova, aula.id])
    }
    const soma = aulas.reduce((s, a) => {
      const fatia = (Number(a.chars) / totalChars) * minutosDeAula
      return s + Math.max(10, Math.round(fatia / 5) * 5)
    }, 0)
    console.log(
      '  ' + curso.titulo.slice(0, 36).padEnd(38) +
      `${ajustadas}/${aulas.length} aula(s) ajustada(s) · somam ${Math.round(soma / 60 * 10) / 10}h de ${novaCarga.get(curso.id)}h`
    )
  }

  let arquivo = new URL('../backup-cargas.json', import.meta.url)
  for (let i = 2; existsSync(arquivo); i++) arquivo = new URL(`../backup-cargas-${i}.json`, import.meta.url)
  writeFileSync(arquivo, JSON.stringify(backup, null, 1))

  console.log(`\nmudanças: ${backup.cursos.length} curso(s), ${backup.modulos.length} módulo(s), ${backup.certificados.length} certificado(s), ${backup.aulas.length} aula(s)`)
  console.log(`backup dos valores antigos: ${arquivo.pathname}`)
  if (!APLICAR) console.log('\n(simulação — passe --aplicar para gravar)')
} finally {
  c.release()
  await pool.end()
}
