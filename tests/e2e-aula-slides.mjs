/** O texto e os desafios da aula aparecem na aula com slides? */
import fs from 'node:fs'
import crypto from 'node:crypto'
import mariadb from '/srv/escola/src/node_modules/mariadb/promise.js'
import bcrypt from '/srv/escola/src/node_modules/bcryptjs/index.js'

const BASE='https://escolaestadualdrjoaoberaldo.com'
const SENHA='TesteQA-'+crypto.randomBytes(6).toString('hex')
const url=new URL(fs.readFileSync('/srv/escola/src/.env','utf8').match(/DATABASE_URL="([^"]+)"/)[1])
const pool=mariadb.createPool({host:url.hostname,port:Number(url.port||3306),
  user:decodeURIComponent(url.username),password:decodeURIComponent(url.password),
  database:url.pathname.slice(1),connectionLimit:3})
const c=await pool.getConnection()
let falhas=0
const ok=(r,cond,x='')=>{console.log(`${cond?'ok   ':'FALHA'} ${r}${x?'  — '+x:''}`);if(!cond)falhas++}
const uid=crypto.randomUUID(), email='zzslide@exemplo.local'

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
    [uid,'ZZSLIDE Aluno','aluno','1° Ano',email])
  const r=await fetch(`${BASE}/api/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({identificador:email,senha:SENHA})})
  const cookie=(r.headers.getSetCookie?.()??[]).map(s=>s.split(';')[0]).join('; ')
  ok('aluno entra',r.ok&&!!cookie)

  // Uma aula com slides de cada curso-chave
  const casos=[
    ['html-estrutura-da-web','HTML Fundamentos'],
    ['excel-do-zero','Excel do Zero'],
    ['css-estilo-e-layout','CSS Fundamentos'],
  ]
  for(const [curso,tituloAula] of casos){
    const [a]=await c.query(
      `SELECT a.slug,a.titulo,a.conteudo,a.slides_urls FROM aulas a JOIN cursos cu ON cu.id=a.curso_id
        WHERE cu.slug=? AND a.titulo=?`,[curso,tituloAula])
    const html=await (await fetch(`${BASE}/admin/cursos/${curso}/${a.slug}`,{headers:{cookie}})).text()
    const temSlides=/slide-0\d\.png/.test(html)
    // O conteúdo é injetado por dangerouslySetInnerHTML, então no payload ele
    // aparece com as tags. Procura o maior trecho SEM tag no meio, que é o que
    // sobrevive literalmente.
    const trecho=String(a.conteudo).split(/<[^>]+>/)
      .map(t=>t.trim()).filter(t=>t.length>40)
      .sort((x,y)=>y.length-x.length)[0].slice(0,60)
    console.log(`\n-- ${curso} / ${a.titulo}`)
    ok('  slides continuam aparecendo', temSlides)
    ok('  "Material da aula" aparece', html.includes('Material da aula'))
    ok('  o texto da aula aparece', html.includes(trecho), `procurado: "${trecho.slice(0,50)}..."`)
    const [d]=await c.query(
      `SELECT d.titulo FROM curso_desafios d JOIN aulas a ON a.id=d.aula_id
        JOIN cursos cu ON cu.id=a.curso_id
        WHERE cu.slug=? AND a.titulo=? AND d.vale_certificado=0 LIMIT 1`,[curso,tituloAula])
    if(d) ok('  o desafio da aula aparece', html.includes(d.titulo), d.titulo)
  }
}catch(e){console.error('FALHA inesperada:',e.message);falhas++}
finally{
  await limpar()
  const [s]=await c.query("SELECT COUNT(*) n FROM profiles WHERE nome_completo LIKE '%ZZSLIDE%'")
  console.log(`\nlimpeza — perfis restantes: ${s.n}`)
  c.release();await pool.end()
}
console.log(falhas?`\n${falhas} falha(s)`:'\ntodas as verificações passaram')
process.exit(falhas?1:0)
