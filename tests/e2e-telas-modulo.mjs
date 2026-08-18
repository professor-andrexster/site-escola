/** Verifica as telas novas de módulo, entregas e certificados no perfil. */
import fs from 'node:fs'
import crypto from 'node:crypto'
import mariadb from '/srv/escola/src/node_modules/mariadb/promise.js'
import bcrypt from '/srv/escola/src/node_modules/bcryptjs/index.js'

const BASE = 'https://escolaestadualdrjoaoberaldo.com'
const SENHA = 'TesteQA-' + crypto.randomBytes(6).toString('hex')
const MARCA = 'ZZTELA'

const url = new URL(fs.readFileSync('/srv/escola/src/.env', 'utf8').match(/DATABASE_URL="([^"]+)"/)[1])
const pool = mariadb.createPool({
  host: url.hostname, port: Number(url.port || 3306),
  user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
  database: url.pathname.slice(1), connectionLimit: 3, bigIntAsNumber: true,
})
const c = await pool.getConnection()

let falhas = 0
const ok = (r, cond, x = '') => {
  console.log(`${cond ? 'ok   ' : 'FALHA'} ${r}${x ? '  — ' + x : ''}`)
  if (!cond) falhas++
}

const aluno = crypto.randomUUID()
const prof = crypto.randomUUID()

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

async function entrar(email) {
  const r = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identificador: email, senha: SENHA }),
  })
  return { ok: r.ok, cookie: (r.headers.getSetCookie?.() ?? []).map(s => s.split(';')[0]).join('; ') }
}
const pega = (u, cookie) => fetch(`${BASE}${u}`, { headers: { cookie } }).then(async r => ({ status: r.status, html: await r.text() }))

try {
  await limpar()
  const hash = bcrypt.hashSync(SENHA, 10)
  const eAluno = `${MARCA.toLowerCase()}.aluno@exemplo.local`
  const eProf = `${MARCA.toLowerCase()}.prof@exemplo.local`

  for (const [id, email, nome, role] of [
    [aluno, eAluno, `${MARCA} Aluno`, 'aluno'],
    [prof, eProf, `${MARCA} Professor`, 'professor'],
  ]) {
    await c.query('INSERT INTO usuarios (id,email,encrypted_password) VALUES (?,?,?)', [id, email, hash])
    await c.query('INSERT INTO profiles (id,nome_completo,role,turma,aprovado,email) VALUES (?,?,?,?,1,?)',
      [id, nome, role, role === 'aluno' ? '1° Ano' : null, email])
  }

  const sA = await entrar(eAluno)
  ok('aluno entra', sA.ok)

  // ------------------------------------------------------- vitrine de módulos
  const vit = await pega('/admin/modulos', sA.cookie)
  ok('vitrine de módulos abre', vit.status === 200, `HTTP ${vit.status}`)
  for (const n of ['Fácil', 'Médio', 'Difícil']) {
    ok(`  mostra o nível ${n}`, vit.html.includes(n))
  }
  const modulos = await c.query('SELECT nome, slug, carga_horaria FROM modulos ORDER BY ordem')
  for (const m of modulos) ok(`  lista "${m.nome}"`, vit.html.includes(m.nome))

  // --------------------------------------------------- página de um módulo
  const alvo = modulos.find(m => m.slug === 'a-primeira-pagina')
  const pag = await pega(`/admin/modulos/${alvo.slug}`, sA.cookie)
  ok('página do módulo abre', pag.status === 200, `HTTP ${pag.status}`)
  // O React serializa cada trecho de texto separado, então "20h" não existe
  // como string contígua no payload: procura o número como token próprio.
  ok('  mostra a carga do módulo', pag.html.includes(`"${alvo.carga_horaria}"`))
  ok('  lista os cursos dele', pag.html.includes('HTML') && pag.html.includes('CSS'))
  // Enquanto os 8 desafios de módulo não estiverem escritos, a tela mostra
  // "sendo preparado" em vez do cadeado — é o ramo correto para desafio ausente.
  ok('  avisa que o projeto ainda está sendo preparado', /sendo preparado/i.test(pag.html))

  // ------------------------------------------ conclui tudo e destrava
  const aulas = await c.query(
    `SELECT a.id, a.curso_id FROM aulas a JOIN cursos cu ON cu.id=a.curso_id
      JOIN modulos m ON m.id=cu.modulo_id WHERE m.slug=? AND a.publicado=1`, [alvo.slug]
  )
  for (const a of aulas) {
    await c.query(
      'INSERT INTO progresso_aulas (id,user_id,aula_id,curso_id,concluida,concluida_em) VALUES (UUID(),?,?,?,1,NOW())',
      [aluno, a.id, a.curso_id]
    )
  }
  const pag2 = await pega(`/admin/modulos/${alvo.slug}`, sA.cookie)
  ok(`concluídas as ${aulas.length} aulas do módulo, mostra 100%`, pag2.html.includes('100%'))
  ok('  e segue avisando que o projeto está sendo preparado',
    /sendo preparado/i.test(pag2.html))

  // ------------------------------------------------- certificados no perfil
  const perf = await pega('/admin/meu-perfil', sA.cookie)
  ok('perfil do aluno abre', perf.status === 200, `HTTP ${perf.status}`)
  ok('  tem a seção "Meus Certificados"', perf.html.includes('Meus Certificados'))
  ok('  diz que ainda não há nenhum', /ainda não tem certificados/i.test(perf.html))

  // Emite um certificado na mão para conferir a listagem
  await c.query(
    `INSERT INTO certificados (id,codigo,user_id,curso_id,aluno_nome,curso_titulo,carga_horaria,nota)
     SELECT UUID(),'JB-ZZTELA01',?,id,?,titulo,carga_horaria,100 FROM cursos WHERE slug='html-estrutura-da-web'`,
    [aluno, `${MARCA} Aluno`]
  )
  const perf2 = await pega('/admin/meu-perfil', sA.cookie)
  ok('o certificado aparece no perfil', perf2.html.includes('JB-ZZTELA01'))
  ok('  com o botão de imprimir', /Ver e imprimir/i.test(perf2.html))
  ok('  etiquetado como Curso', perf2.html.includes('Curso'))

  // ------------------------------------------------- tela de entregas
  const sP = await entrar(eProf)
  ok('professor entra', sP.ok)
  const ent = await pega('/admin/cursos/gerenciar/entregas', sP.cookie)
  ok('tela de Entregas e Certificados abre', ent.status === 200, `HTTP ${ent.status}`)
  ok('  tem os três contadores', /Esperando correção/.test(ent.html) && /Aprovadas/.test(ent.html))

  // O envio real da Ana Clara tem que aparecer para quem avalia o curso
  await c.query(
    `INSERT INTO curso_avaliadores (id,curso_id,user_id,convidado_por)
     SELECT UUID(),id,?,? FROM cursos WHERE slug='html-estrutura-da-web'`, [prof, prof]
  )
  const ent2 = await pega('/admin/cursos/gerenciar/entregas', sP.cookie)
  ok('a entrega real aparece para o avaliador convidado',
    ent2.html.includes('Ana Clara'), 'esperado: Ana Clara Martins Lisboa')
  ok('  com botão de baixar o arquivo', /Baixar arquivo/i.test(ent2.html))
  ok('  e com o botão de aprovar e emitir', /Aprovar e emitir certificado/i.test(ent2.html))
} catch (e) {
  console.error('FALHA inesperada:', e.message)
  falhas++
} finally {
  await limpar()
  const [s] = await c.query(
    "SELECT (SELECT COUNT(*) FROM certificados WHERE codigo LIKE 'JB-ZZTELA%') c, (SELECT COUNT(*) FROM profiles WHERE nome_completo LIKE '%ZZTELA%') p"
  )
  console.log(`\nlimpeza — certificados de teste: ${s.c}, perfis de teste: ${s.p}`)
  c.release()
  await pool.end()
}

console.log(falhas ? `\n${falhas} verificação(ões) falharam` : '\ntodas as verificações passaram')
process.exit(falhas ? 1 : 0)
