/** Aulas que faltam na caixa trancada + conclusão automática no último slide. */
import fs from 'node:fs'
import crypto from 'node:crypto'
import mariadb from '/srv/escola/src/node_modules/mariadb/promise.js'
import bcrypt from '/srv/escola/src/node_modules/bcryptjs/index.js'

const BASE='https://escolaestadualdrjoaoberaldo.com', SLUG='html-estrutura-da-web'
const SENHA='TesteQA-'+crypto.randomBytes(6).toString('hex')
const url=new URL(fs.readFileSync('/srv/escola/src/.env','utf8').match(/DATABASE_URL="([^"]+)"/)[1])
const pool=mariadb.createPool({host:url.hostname,port:Number(url.port||3306),
  user:decodeURIComponent(url.username),password:decodeURIComponent(url.password),
  database:url.pathname.slice(1),connectionLimit:3})
const c=await pool.getConnection()
let falhas=0
const ok=(r,cond,x='')=>{console.log(`${cond?'ok   ':'FALHA'} ${r}${x?'  — '+x:''}`);if(!cond)falhas++}
const uid=crypto.randomUUID(), email='zzconc@exemplo.local'

async function limpar(){
  await c.query('DELETE FROM sessoes WHERE usuario_id=?',[uid])
  await c.query('DELETE FROM progresso_aulas WHERE user_id=?',[uid])
  await c.query('DELETE FROM profiles WHERE id=?',[uid])
  await c.query('DELETE FROM usuarios WHERE id=?',[uid])
}
try{
  await limpar()
  await c.query('INSERT INTO usuarios (id,email,encrypted_password) VALUES (?,?,?)',[uid,email,bcrypt.hashSync(SENHA,10)])
  await c.query('INSERT INTO profiles (id,nome_completo,role,turma,aprovado,email) VALUES (?,?,?,?,1,?)',
    [uid,'ZZCONC Aluno','aluno','1° Ano',email])
  const r=await fetch(`${BASE}/api/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({identificador:email,senha:SENHA})})
  const cookie=(r.headers.getSetCookie?.()??[]).map(s=>s.split(';')[0]).join('; ')
  ok('aluno entra',r.ok&&!!cookie)

  const aulas=await c.query(
    `SELECT a.id,a.slug,a.titulo,a.ordem,a.slides_urls FROM aulas a JOIN cursos cu ON cu.id=a.curso_id
      WHERE cu.slug=? AND a.publicado=1 ORDER BY a.ordem`,[SLUG])
  const cursoId=(await c.query('SELECT id FROM cursos WHERE slug=?',[SLUG]))[0].id

  // Reproduz o caso: conclui 4 e deixa as aulas 4 e 5 no meio dos slides
  const paradas=[aulas[3],aulas[4]]
  for(const a of aulas){
    const parada=paradas.some(x=>x.id===a.id)
    await c.query(
      'INSERT INTO progresso_aulas (id,user_id,aula_id,curso_id,concluida,slide_atual,concluida_em) VALUES (UUID(),?,?,?,?,?,?)',
      [uid,a.id,cursoId,parada?0:1,parada?1:4,parada?null:new Date()])
  }
  const pag=await (await fetch(`${BASE}/admin/cursos/${SLUG}`,{headers:{cookie}})).text()
  ok('a caixa diz quantas faltam', /Faltam/.test(pag))
  for(const a of paradas) ok(`  nomeia "${a.titulo}"`, pag.includes(a.titulo))
  ok('  com link direto para elas', paradas.every(a=>pag.includes(`/admin/cursos/${SLUG}/${a.slug}`)))
  ok('  e explica quando a aula é marcada', /último slide/.test(pag))
  ok('  o desafio final segue trancado', !/Enviar|Escolher arquivo/i.test(pag))

  // Conclusão automática: o player salva concluida ao chegar no último slide
  const alvo=paradas[0]
  const total=String(alvo.slides_urls).split(',').filter(Boolean).length
  const resp=await fetch(`${BASE}/api/cursos/progresso`,{method:'POST',
    headers:{'Content-Type':'application/json',cookie},
    body:JSON.stringify({aulaId:alvo.id,slideAtual:total-1,concluida:true})})
  ok(`chegar no último slide (${total}) marca a aula`,resp.ok,`HTTP ${resp.status}`)
  const [p1]=await c.query('SELECT concluida FROM progresso_aulas WHERE user_id=? AND aula_id=?',[uid,alvo.id])
  ok('  gravado no banco',p1.concluida===1||p1.concluida===true)

  // conclui a última que faltava e confere que libera
  const alvo2=paradas[1]
  const total2=String(alvo2.slides_urls).split(',').filter(Boolean).length
  await fetch(`${BASE}/api/cursos/progresso`,{method:'POST',
    headers:{'Content-Type':'application/json',cookie},
    body:JSON.stringify({aulaId:alvo2.id,slideAtual:total2-1,concluida:true})})
  const pag2=await (await fetch(`${BASE}/admin/cursos/${SLUG}`,{headers:{cookie}})).text()
  ok('com as 6 concluídas, some a caixa de aulas faltando', !/Faltam/.test(pag2))
  ok('  e o desafio final libera', /Enviar|Escolher arquivo|entrega/i.test(pag2))
  ok('  progresso em 100%', pag2.includes('100%'))
}catch(e){console.error('FALHA inesperada:',e.message);falhas++}
finally{
  await limpar()
  const [s]=await c.query("SELECT COUNT(*) n FROM profiles WHERE nome_completo LIKE '%ZZCONC%'")
  console.log(`\nlimpeza — perfis restantes: ${s.n}`)
  c.release();await pool.end()
}
console.log(falhas?`\n${falhas} falha(s)`:'\ntodas as verificações passaram')
process.exit(falhas?1:0)
