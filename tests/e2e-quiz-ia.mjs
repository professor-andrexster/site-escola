/** Geração de perguntas de quiz por IA, ponta a ponta, como um professor faz. */
import fs from 'node:fs'
import crypto from 'node:crypto'
import mariadb from '/srv/escola/src/node_modules/mariadb/promise.js'
import bcrypt from '/srv/escola/src/node_modules/bcryptjs/index.js'

const BASE='https://escolaestadualdrjoaoberaldo.com'
const SENHA='TesteQA-'+crypto.randomBytes(6).toString('hex')
const url=new URL(fs.readFileSync('/srv/escola/src/.env','utf8').match(/DATABASE_URL="([^"]+)"/)[1])
const pool=mariadb.createPool({host:url.hostname,port:Number(url.port||3306),
  user:decodeURIComponent(url.username),password:decodeURIComponent(url.password),
  database:url.pathname.slice(1),connectionLimit:3,bigIntAsNumber:true})
const c=await pool.getConnection()
let falhas=0
const ok=(r,cond,x='')=>{console.log(`${cond?'ok   ':'FALHA'} ${r}${x?'  — '+x:''}`);if(!cond)falhas++}
const uid=crypto.randomUUID(), email='zzquiz@exemplo.local'
let quizId

async function limpar(){
  if(quizId){
    await c.query('DELETE FROM quiz_perguntas WHERE quiz_id=?',[quizId])
    await c.query('DELETE FROM quizzes WHERE id=?',[quizId])
  }
  await c.query('DELETE FROM sessoes WHERE usuario_id=?',[uid])
  await c.query('DELETE FROM profiles WHERE id=?',[uid])
  await c.query('DELETE FROM usuarios WHERE id=?',[uid])
}
try{
  await limpar()
  await c.query('INSERT INTO usuarios (id,email,encrypted_password) VALUES (?,?,?)',[uid,email,bcrypt.hashSync(SENHA,10)])
  await c.query('INSERT INTO profiles (id,nome_completo,role,aprovado,email) VALUES (?,?,?,1,?)',
    [uid,'ZZQUIZ Professor','professor',email])
  const r=await fetch(`${BASE}/api/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({identificador:email,senha:SENHA})})
  const cookie=(r.headers.getSetCookie?.()??[]).map(s=>s.split(';')[0]).join('; ')
  ok('professor entra',r.ok)

  console.log('\n  gerando 5 perguntas sobre "Fotossíntese"... (a IA leva alguns segundos)')
  const t0=Date.now()
  const res=await fetch(`${BASE}/api/gerar-perguntas`,{method:'POST',
    headers:{'Content-Type':'application/json',cookie},
    body:JSON.stringify({materia:'Fotossíntese',quantidade:5})})
  const json=await res.json().catch(()=>({}))
  const seg=((Date.now()-t0)/1000).toFixed(1)
  ok('a IA respondeu',res.ok,`HTTP ${res.status} em ${seg}s`)
  if(!res.ok){ console.log('   erro:',json.error); throw new Error('geração falhou') }

  const ps=json.perguntas||[]
  ok('veio a quantidade pedida',ps.length===5,`${ps.length} perguntas`)
  const completa=ps.every(p=>p.enunciado&&p.alternativa_a&&p.alternativa_b&&p.alternativa_c&&p.alternativa_d)
  ok('todas com enunciado e 4 alternativas',completa)
  const respostaOk=ps.every(p=>['a','b','c','d'].includes(p.resposta_correta))
  ok('todas com resposta correta válida',respostaOk)
  const emPortugues=ps.every(p=>/[çãõáéíóúâêô]/i.test(p.enunciado+p.alternativa_a))
  ok('em português',emPortugues)

  console.log('\n  amostra:')
  const p0=ps[0]
  console.log('   '+p0.enunciado)
  for(const l of ['a','b','c','d']) console.log(`     ${l}) ${p0['alternativa_'+l]}`)
  console.log(`     correta: ${p0.resposta_correta}`)

  // grava num quiz de verdade, como a tela faz
  const cq=await fetch(`${BASE}/api/quiz`,{method:'POST',headers:{'Content-Type':'application/json',cookie},
    body:JSON.stringify({titulo:'ZZQUIZ Teste de geração',turma_alvo:'Todos'})})
  const jq=await cq.json().catch(()=>({}))
  quizId=jq?.quiz?.id||jq?.id
  ok('quiz criado',cq.ok&&!!quizId,`HTTP ${cq.status}`)
  if(quizId){
    const sv=await fetch(`${BASE}/api/quiz/${quizId}/perguntas`,{method:'POST',
      headers:{'Content-Type':'application/json',cookie},
      body:JSON.stringify({perguntas:ps.map(p=>({...p,pontos:100}))})})
    ok('as perguntas geradas foram salvas no quiz',sv.ok,`HTTP ${sv.status}`)
    const [n]=await c.query('SELECT COUNT(*) n FROM quiz_perguntas WHERE quiz_id=?',[quizId])
    ok('  gravadas no banco',n.n===5,`${n.n} perguntas`)
  }
}catch(e){console.error('FALHA:',e.message);falhas++}
finally{
  await limpar()
  const [s]=await c.query("SELECT COUNT(*) n FROM profiles WHERE nome_completo LIKE '%ZZQUIZ%'")
  console.log(`\nlimpeza — perfis restantes: ${s.n}`)
  c.release();await pool.end()
}
console.log(falhas?`\n${falhas} falha(s)`:'\ntodas as verificações passaram')
process.exit(falhas?1:0)
