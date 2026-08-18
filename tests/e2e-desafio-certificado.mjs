/**
 * Teste de ponta a ponta do desafio final -> certificado, no site no ar.
 *
 * Cria um aluno e um avaliador de teste, conclui as aulas do HTML, entrega o
 * desafio pela API real (com sessao de verdade), aprova pela fila do professor
 * e confere o certificado. Apaga tudo no fim, inclusive se falhar no meio.
 *
 *   node teste-desafio-e2e.mjs
 */
import fs from 'node:fs'
import crypto from 'node:crypto'
import mariadb from '/srv/escola/src/node_modules/mariadb/promise.js'
import bcrypt from '/srv/escola/src/node_modules/bcryptjs/index.js'

const BASE = 'https://escolaestadualdrjoaoberaldo.com'
const SLUG = 'html-estrutura-da-web'
const SENHA = 'TesteQA-' + crypto.randomBytes(6).toString('hex')
const MARCA = 'ZZQA'

const url = new URL(
  fs.readFileSync('/srv/escola/src/.env', 'utf8').match(/DATABASE_URL="([^"]+)"/)[1]
)
const pool = mariadb.createPool({
  host: url.hostname, port: Number(url.port || 3306),
  user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
  database: url.pathname.slice(1), connectionLimit: 3, bigIntAsNumber: true,
})
const c = await pool.getConnection()

let falhas = 0
const ok = (r, cond, extra = '') => {
  console.log(`${cond ? 'ok   ' : 'FALHA'} ${r}${extra ? '  — ' + extra : ''}`)
  if (!cond) falhas++
}

const aluno = crypto.randomUUID()
const prof = crypto.randomUUID()
let cursoId, desafioId, codigoCert

async function limpar() {
  await c.query('DELETE FROM certificados WHERE user_id IN (?,?)', [aluno, prof])
  await c.query('DELETE FROM curso_desafio_envios WHERE user_id IN (?,?)', [aluno, prof])
  await c.query('DELETE FROM curso_avaliadores WHERE user_id IN (?,?)', [aluno, prof])
  await c.query('DELETE FROM progresso_aulas WHERE user_id IN (?,?)', [aluno, prof])
  await c.query('DELETE FROM sessoes WHERE usuario_id IN (?,?)', [aluno, prof])
  await c.query('DELETE FROM identidades WHERE user_id IN (?,?)', [aluno, prof])
  await c.query('DELETE FROM alunos WHERE user_id IN (?,?)', [aluno, prof])
  await c.query('DELETE FROM profiles WHERE id IN (?,?)', [aluno, prof])
  await c.query('DELETE FROM usuarios WHERE id IN (?,?)', [aluno, prof])
}

/** Login pela API real; devolve o cookie de sessao. */
async function entrar(email) {
  const r = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identificador: email, senha: SENHA }),
  })
  const cookie = (r.headers.getSetCookie?.() ?? []).map(s => s.split(';')[0]).join('; ')
  return { ok: r.ok, cookie, corpo: await r.json().catch(() => null) }
}

try {
  await limpar()
  const hash = bcrypt.hashSync(SENHA, 10)

  // ---------------------------------------------------------------- preparo
  const [curso] = await c.query('SELECT id, titulo, carga_horaria FROM cursos WHERE slug = ?', [SLUG])
  cursoId = curso.id
  const [des] = await c.query(
    'SELECT id, titulo FROM curso_desafios WHERE curso_id = ? AND vale_certificado = 1', [cursoId]
  )
  desafioId = des.id
  console.log(`curso: ${curso.titulo} (${curso.carga_horaria}h) | desafio: ${des.titulo}\n`)

  const emailAluno = `${MARCA.toLowerCase()}.aluno@exemplo.local`
  const emailProf = `${MARCA.toLowerCase()}.prof@exemplo.local`

  for (const [id, email, nome, role] of [
    [aluno, emailAluno, `${MARCA} Aluno de Teste`, 'aluno'],
    [prof, emailProf, `${MARCA} Professor de Teste`, 'professor'],
  ]) {
    await c.query('INSERT INTO usuarios (id, email, encrypted_password) VALUES (?,?,?)', [id, email, hash])
    await c.query(
      'INSERT INTO profiles (id, nome_completo, role, turma, aprovado, email) VALUES (?,?,?,?,1,?)',
      [id, nome, role, role === 'aluno' ? '1° Ano' : null, email]
    )
  }
  // O professor de teste avalia este curso — mecanismo de avaliador convidado.
  await c.query(
    'INSERT INTO curso_avaliadores (id, curso_id, user_id, convidado_por) VALUES (UUID(),?,?,?)',
    [cursoId, prof, prof]
  )

  // ------------------------------------------------- 1. o aluno faz as aulas
  const aulas = await c.query('SELECT id FROM aulas WHERE curso_id = ? AND publicado = 1', [cursoId])
  for (const a of aulas) {
    await c.query(
      'INSERT INTO progresso_aulas (id, user_id, aula_id, curso_id, concluida, concluida_em) VALUES (UUID(),?,?,?,1,NOW())',
      [aluno, a.id, cursoId]
    )
  }
  ok(`aluno concluiu as ${aulas.length} aulas`, aulas.length === 6, `${aulas.length} aulas`)

  // ------------------------------------------------------- 2. login do aluno
  const sAluno = await entrar(emailAluno)
  ok('aluno consegue entrar', sAluno.ok && !!sAluno.cookie)

  // ------------------------ 3. a pagina do curso mostra o formulario de envio
  const pag = await fetch(`${BASE}/admin/cursos/${SLUG}`, { headers: { cookie: sAluno.cookie } })
  const html = await pag.text()
  ok('página do curso abre para o aluno', pag.status === 200, `HTTP ${pag.status}`)
  ok('o desafio final aparece na tela', html.includes(des.titulo))
  ok('e o formulário de entrega está lá', /Enviar|entrega|Escolher arquivo|link/i.test(html))

  // ------------------------------------------------------- 4. o aluno entrega
  const envio = await fetch(`${BASE}/api/cursos/desafio-final`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: sAluno.cookie },
    body: JSON.stringify({
      desafioId,
      linkUrl: 'https://exemplo.local/pagina-do-zzqa',
      comentario: 'Envio automático de verificação. Pode rejeitar.',
    }),
  })
  ok('entrega aceita pela API', envio.ok, `HTTP ${envio.status}`)

  const [gravado] = await c.query(
    'SELECT status, link_url FROM curso_desafio_envios WHERE desafio_id = ? AND user_id = ?',
    [desafioId, aluno]
  )
  ok('envio gravado com status "entregue"', gravado?.status === 'entregue', gravado?.status)

  // --------------------------------------- 5. o envio aparece para o professor
  const sProf = await entrar(emailProf)
  ok('professor avaliador consegue entrar', sProf.ok && !!sProf.cookie)

  const fila = await fetch(`${BASE}/api/cursos/desafio-final/envios?curso=${SLUG}`, {
    headers: { cookie: sProf.cookie },
  })
  const listaFila = await fila.json()
  const naFila = JSON.stringify(listaFila).includes(`${MARCA} Aluno de Teste`)
  ok('o envio aparece na fila de correção do professor', fila.ok && naFila, `HTTP ${fila.status}`)

  // ------------------------------- 6. rejeitar sem feedback tem que ser negado
  const [envioRow] = await c.query(
    'SELECT id FROM curso_desafio_envios WHERE desafio_id = ? AND user_id = ?', [desafioId, aluno]
  )
  const semFeedback = await fetch(`${BASE}/api/cursos/desafio-final/envios/${envioRow.id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: sProf.cookie },
    body: JSON.stringify({ aprovado: false }),
  })
  ok('rejeitar sem feedback é recusado', semFeedback.status === 400, `HTTP ${semFeedback.status}`)

  // ------------------------------------------------------- 7. professor aprova
  const aprovacao = await fetch(`${BASE}/api/cursos/desafio-final/envios/${envioRow.id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: sProf.cookie },
    body: JSON.stringify({ aprovado: true, feedback: 'Aprovado na verificação automática.' }),
  })
  const respAprov = await aprovacao.json().catch(() => null)
  ok('aprovação aceita', aprovacao.ok, `HTTP ${aprovacao.status} ${JSON.stringify(respAprov)}`)

  // -------------------------------------------- 8. o certificado foi emitido?
  const [cert] = await c.query('SELECT * FROM certificados WHERE user_id = ? AND curso_id = ?', [aluno, cursoId])
  ok('certificado gravado na tabela certificados', !!cert)
  if (cert) {
    codigoCert = cert.codigo
    ok('carga horária do curso no certificado', cert.carga_horaria === curso.carga_horaria,
      `${cert.carga_horaria}h`)
    ok('nome do aluno gravado no certificado', cert.aluno_nome === `${MARCA} Aluno de Teste`, cert.aluno_nome)
    ok('nome do curso gravado no certificado', cert.curso_titulo === curso.titulo, cert.curso_titulo)
    ok('código gerado', /^[A-Z0-9-]{6,16}$/.test(cert.codigo), cert.codigo)

    // ---------------------------------- 9. a página pública do certificado
    const pub = await fetch(`${BASE}/certificado/${cert.codigo}`)
    const pubHtml = await pub.text()
    ok('página pública do certificado abre sem login', pub.status === 200, `HTTP ${pub.status}`)
    ok('mostra o nome do aluno', pubHtml.includes(`${MARCA} Aluno de Teste`))
    ok('mostra a carga horária', pubHtml.includes(String(cert.carga_horaria)))
    ok('mostra o nome do curso', pubHtml.includes(curso.titulo.slice(0, 12)))
  }

  // ------------------------- 10. o aluno vê o certificado na página do curso
  const pag2 = await fetch(`${BASE}/admin/cursos/${SLUG}`, { headers: { cookie: sAluno.cookie } })
  const html2 = await pag2.text()
  ok('o aluno passa a ver "Ver Certificado" na página do curso',
    html2.includes('Ver Certificado') || html2.includes(codigoCert ?? 'xxx'))

  // ------------------------------------------- 11. nao da para reenviar depois
  const reenvio = await fetch(`${BASE}/api/cursos/desafio-final`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: sAluno.cookie },
    body: JSON.stringify({ desafioId, linkUrl: 'https://exemplo.local/outro' }),
  })
  ok('reenvio depois de aprovado é bloqueado', reenvio.status === 409, `HTTP ${reenvio.status}`)

  console.log(`\ncódigo do certificado de teste: ${codigoCert}`)
  console.log(`URL pública: ${BASE}/certificado/${codigoCert}`)
} catch (erro) {
  console.error('\nFALHA inesperada:', erro.message)
  falhas++
} finally {
  await limpar()
  const sobra = await c.query(
    "SELECT (SELECT COUNT(*) FROM certificados) c, (SELECT COUNT(*) FROM curso_desafio_envios) e, (SELECT COUNT(*) FROM profiles WHERE nome_completo LIKE '%ZZQA%') p"
  )
  console.log(`\nlimpeza — certificados: ${sobra[0].c}, envios: ${sobra[0].e}, perfis de teste: ${sobra[0].p}`)
  c.release()
  await pool.end()
}

console.log(falhas ? `\n${falhas} verificação(ões) falharam` : '\ntodas as verificações passaram')
process.exit(falhas ? 1 : 0)
