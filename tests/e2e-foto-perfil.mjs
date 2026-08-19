/** Ciclo da foto de perfil: envio, espelhamento no avatar e remoção. */
import fs from 'node:fs'
import crypto from 'node:crypto'
import mariadb from '/srv/escola/src/node_modules/mariadb/promise.js'
import bcrypt from '/srv/escola/src/node_modules/bcryptjs/index.js'

const BASE = 'https://escolaestadualdrjoaoberaldo.com'
const SENHA = 'TesteQA-' + crypto.randomBytes(6).toString('hex')
const url = new URL(fs.readFileSync('/srv/escola/src/.env','utf8').match(/DATABASE_URL="([^"]+)"/)[1])
const pool = mariadb.createPool({ host: url.hostname, port: Number(url.port||3306),
  user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
  database: url.pathname.slice(1), connectionLimit: 3, bigIntAsNumber: true })
const c = await pool.getConnection()

let falhas = 0
const ok = (r, cond, x='') => { console.log(`${cond?'ok   ':'FALHA'} ${r}${x?'  — '+x:''}`); if(!cond) falhas++ }

const uid = crypto.randomUUID()
const email = 'zzfoto.aluno@exemplo.local'
let enviados = []

async function limpar() {
  await c.query('DELETE FROM sessoes WHERE usuario_id=?', [uid])
  await c.query('DELETE FROM alunos WHERE user_id=?', [uid])
  await c.query('DELETE FROM profiles WHERE id=?', [uid])
  await c.query('DELETE FROM usuarios WHERE id=?', [uid])
  for (const f of enviados) { try { fs.unlinkSync(f) } catch {} }
}

try {
  await limpar()
  await c.query('INSERT INTO usuarios (id,email,encrypted_password) VALUES (?,?,?)',
    [uid, email, bcrypt.hashSync(SENHA,10)])
  await c.query('INSERT INTO profiles (id,nome_completo,role,turma,aprovado,email) VALUES (?,?,?,?,1,?)',
    [uid, 'ZZFOTO Aluno Teste', 'aluno', '1° Ano', email])
  await c.query(`INSERT INTO alunos (id,nome,matricula,turma,serie,turno,user_id)
    VALUES (UUID(),'ZZFOTO Aluno Teste','M-ZZFOTO','1° Ano','1° Ano','Integral',?)`, [uid])

  const login = await fetch(`${BASE}/api/auth/login`, { method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ identificador: email, senha: SENHA }) })
  const cookie = (login.headers.getSetCookie?.() ?? []).map(s=>s.split(';')[0]).join('; ')
  ok('aluno entra', login.ok && !!cookie)

  // um PNG 1x1 de verdade
  const png = Buffer.from('89504e470d0a1a0a0000000d494844520000000100000001080600000' +
    '01f15c4890000000d49444154789c6360000002000154a24f5f0000000049454e44ae426082','hex')
  const form = new FormData()
  form.append('finalidade','avatar')
  form.append('arquivo', new File([png], 'zzfoto.png', { type:'image/png' }))
  const up = await fetch(`${BASE}/api/arquivos`, { method:'POST', headers:{cookie}, body: form })
  const jUp = await up.json().catch(()=>({}))
  ok('upload aceito', up.ok, `HTTP ${up.status} ${JSON.stringify(jUp).slice(0,80)}`)
  const fotoUrl = jUp.url
  if (fotoUrl) enviados.push('/var/www/escola/data/uploads' + fotoUrl.replace('/arquivos',''))

  ok('arquivo existe em disco', !!fotoUrl && fs.existsSync(enviados[0]), enviados[0])
  const serve = await fetch(`${BASE}${fotoUrl}`)
  ok('arquivo é servido', serve.ok && (serve.headers.get('content-type')||'').startsWith('image/'),
    `HTTP ${serve.status} ${serve.headers.get('content-type')}`)

  // grava pela rota do perfil
  const put = await fetch(`${BASE}/api/alunos/meu-perfil`, { method:'PUT',
    headers:{'Content-Type':'application/json', cookie},
    body: JSON.stringify({ foto_url: fotoUrl }) })
  ok('perfil aceita a foto', put.ok, `HTTP ${put.status}`)

  const [ficha] = await c.query('SELECT foto_url FROM alunos WHERE user_id=?', [uid])
  const [perfil] = await c.query('SELECT avatar_url FROM profiles WHERE id=?', [uid])
  ok('gravou em alunos.foto_url (portfólio)', ficha.foto_url === fotoUrl, String(ficha.foto_url))
  ok('E espelhou em profiles.avatar_url (avatar do sistema)', perfil.avatar_url === fotoUrl,
    String(perfil.avatar_url))

  // a tela mostra
  const tela = await (await fetch(`${BASE}/admin/meu-perfil`, { headers:{cookie} })).text()
  ok('a foto aparece na tela do perfil', tela.includes(fotoUrl))
  ok('  e o botão diz "Trocar foto"', /Trocar foto/.test(tela))
  ok('  com a opção de remover', /Remover/.test(tela))

  // remover limpa os dois
  const del = await fetch(`${BASE}/api/alunos/meu-perfil`, { method:'PUT',
    headers:{'Content-Type':'application/json', cookie},
    body: JSON.stringify({ foto_url: null }) })
  ok('remoção aceita', del.ok, `HTTP ${del.status}`)
  const [f2] = await c.query('SELECT foto_url FROM alunos WHERE user_id=?', [uid])
  const [p2] = await c.query('SELECT avatar_url FROM profiles WHERE id=?', [uid])
  ok('limpou a ficha', f2.foto_url === null)
  ok('E limpou o avatar', p2.avatar_url === null)

  const tela2 = await (await fetch(`${BASE}/admin/meu-perfil`, { headers:{cookie} })).text()
  ok('a tela volta a oferecer "Enviar foto"', /Enviar foto/.test(tela2))
} catch (e) {
  console.error('FALHA inesperada:', e.message); falhas++
} finally {
  await limpar()
  const [s] = await c.query("SELECT COUNT(*) n FROM profiles WHERE nome_completo LIKE '%ZZFOTO%'")
  console.log(`\nlimpeza — perfis de teste restantes: ${s.n}`)
  c.release(); await pool.end()
}
console.log(falhas ? `\n${falhas} falha(s)` : '\ntodas as verificações passaram')
process.exit(falhas?1:0)
