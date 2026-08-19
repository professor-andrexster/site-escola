/** Ciclo completo do MÓDULO: concluir cursos, entregar o projeto, certificado. */
import fs from 'node:fs'
import crypto from 'node:crypto'
import mariadb from '/srv/escola/src/node_modules/mariadb/promise.js'
import bcrypt from '/srv/escola/src/node_modules/bcryptjs/index.js'

const BASE='https://escolaestadualdrjoaoberaldo.com', MOD='a-primeira-pagina'
const SENHA='TesteQA-'+crypto.randomBytes(6).toString('hex')
const url=new URL(fs.readFileSync('/srv/escola/src/.env','utf8').match(/DATABASE_URL="([^"]+)"/)[1])
const pool=mariadb.createPool({host:url.hostname,port:Number(url.port||3306),
  user:decodeURIComponent(url.username),password:decodeURIComponent(url.password),
  database:url.pathname.slice(1),connectionLimit:3})
const c=await pool.getConnection()
let falhas=0
const ok=(r,cond,x='')=>{console.log(`${cond?'ok   ':'FALHA'} ${r}${x?'  — '+x:''}`);if(!cond)falhas++}
const aluno=crypto.randomUUID(), prof=crypto.randomUUID()

async function limpar(){
  await c.query('DELETE FROM certificados WHERE user_id IN (?,?)',[aluno,prof])
  await c.query('DELETE FROM curso_desafio_envios WHERE user_id IN (?,?)',[aluno,prof])
  await c.query('DELETE FROM curso_avaliadores WHERE user_id IN (?,?)',[aluno,prof])
  await c.query('DELETE FROM progresso_aulas WHERE user_id IN (?,?)',[aluno,prof])
  await c.query('DELETE FROM sessoes WHERE usuario_id IN (?,?)',[aluno,prof])
  await c.query('DELETE FROM profiles WHERE id IN (?,?)',[aluno,prof])
  await c.query('DELETE FROM usuarios WHERE id IN (?,?)',[aluno,prof])
}
const entrar=async e=>{const r=await fetch(`${BASE}/api/auth/login`,{method:'POST',
  headers:{'Content-Type':'application/json'},body:JSON.stringify({identificador:e,senha:SENHA})});
  return {ok:r.ok,cookie:(r.headers.getSetCookie?.()??[]).map(s=>s.split(';')[0]).join('; ')}}

try{
  await limpar()
  const h=bcrypt.hashSync(SENHA,10)
  const eA='zzmod.aluno@exemplo.local', eP='zzmod.prof@exemplo.local'
  for(const [id,em,nome,role] of [[aluno,eA,'ZZMOD Aluno','aluno'],[prof,eP,'ZZMOD Professor','admin']]){
    await c.query('INSERT INTO usuarios (id,email,encrypted_password) VALUES (?,?,?)',[id,em,h])
    await c.query('INSERT INTO profiles (id,nome_completo,role,turma,aprovado,email) VALUES (?,?,?,?,1,?)',
      [id,nome,role,role==='aluno'?'1° Ano':null,em])
  }
  const [m]=await c.query('SELECT id,nome,carga_horaria FROM modulos WHERE slug=?',[MOD])
  const [d]=await c.query('SELECT id,titulo FROM curso_desafios WHERE modulo_id=? AND vale_certificado=1',[m.id])
  ok('o módulo tem projeto final',!!d,d?.titulo)

  const sA=await entrar(eA); ok('aluno entra',sA.ok)
  const p1=await (await fetch(`${BASE}/admin/modulos/${MOD}`,{headers:{cookie:sA.cookie}})).text()
  ok('a página mostra o projeto',p1.includes(d.titulo))
  ok('  mas trancado sem as aulas',/Conclua as aulas/i.test(p1))

  // conclui todas as aulas dos cursos do módulo
  const aulas=await c.query(`SELECT a.id,a.curso_id FROM aulas a JOIN cursos cu ON cu.id=a.curso_id
    WHERE cu.modulo_id=? AND a.publicado=1`,[m.id])
  for(const a of aulas) await c.query(
    'INSERT INTO progresso_aulas (id,user_id,aula_id,curso_id,concluida,concluida_em) VALUES (UUID(),?,?,?,1,NOW())',
    [aluno,a.id,a.curso_id])
  const p2=await (await fetch(`${BASE}/admin/modulos/${MOD}`,{headers:{cookie:sA.cookie}})).text()
  ok(`concluídas as ${aulas.length} aulas do módulo, o projeto libera`,!/Conclua as aulas/i.test(p2))
  ok('  com o formulário de entrega',/Enviar|entrega|link/i.test(p2))

  // entrega
  const env=await fetch(`${BASE}/api/cursos/desafio-final`,{method:'POST',
    headers:{'Content-Type':'application/json',cookie:sA.cookie},
    body:JSON.stringify({desafioId:d.id,linkUrl:'https://exemplo.local/site-zzmod',comentario:'Entrega de verificação.'})})
  ok('entrega aceita',env.ok,`HTTP ${env.status}`)

  // professor vê e aprova
  const sP=await entrar(eP); ok('professor entra',sP.ok)
  const fila=await fetch(`${BASE}/api/cursos/desafio-final/envios?modulo=${MOD}`,{headers:{cookie:sP.cookie}})
  const jf=await fila.json()
  ok('o envio aparece na fila do módulo',fila.ok&&JSON.stringify(jf).includes('ZZMOD Aluno'),`HTTP ${fila.status}`)
  const painel=await (await fetch(`${BASE}/admin/cursos/gerenciar/entregas`,{headers:{cookie:sP.cookie}})).text()
  ok('e na tela de Entregas e Certificados',painel.includes('ZZMOD Aluno'))
  ok('  etiquetado como Módulo',/Módulo/.test(painel))

  const [row]=await c.query('SELECT id FROM curso_desafio_envios WHERE desafio_id=? AND user_id=?',[d.id,aluno])
  const apr=await fetch(`${BASE}/api/cursos/desafio-final/envios/${row.id}`,{method:'POST',
    headers:{'Content-Type':'application/json',cookie:sP.cookie},
    body:JSON.stringify({aprovado:true,feedback:'Aprovado na verificação.'})})
  const ja=await apr.json().catch(()=>({}))
  ok('aprovação emite o certificado do módulo',apr.ok&&!!ja.certificado,JSON.stringify(ja).slice(0,90))

  const [cert]=await c.query('SELECT * FROM certificados WHERE user_id=? AND modulo_id=?',[aluno,m.id])
  ok('certificado gravado com modulo_id',!!cert)
  ok('  carga do módulo',cert&&cert.carga_horaria===m.carga_horaria,`${cert?.carga_horaria}h de ${m.carga_horaria}h`)
  ok('  título do módulo no documento',cert&&cert.curso_titulo===m.nome,cert?.curso_titulo)
  const pub=await fetch(`${BASE}/certificado/${cert.codigo}`)
  ok('  página pública abre',pub.ok,`HTTP ${pub.status} · ${cert.codigo}`)
  const perfil=await (await fetch(`${BASE}/admin/meu-perfil`,{headers:{cookie:sA.cookie}})).text()
  ok('  aparece em Meus Certificados',perfil.includes(cert.codigo))
}catch(e){console.error('FALHA inesperada:',e.message);falhas++}
finally{
  await limpar()
  const [s]=await c.query("SELECT COUNT(*) n FROM profiles WHERE nome_completo LIKE '%ZZMOD%'")
  console.log(`\nlimpeza — perfis restantes: ${s.n}`)
  c.release();await pool.end()
}
console.log(falhas?`\n${falhas} falha(s)`:'\ntodas as verificações passaram')
process.exit(falhas?1:0)
