/** A trilha de desafios: sequência, estados e a entrega abrindo pelo desafio. */
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
const uid=crypto.randomUUID(), email='zztrilha@exemplo.local'

async function limpar(){
  await c.query('DELETE FROM curso_desafio_envios WHERE user_id=?',[uid])
  await c.query('DELETE FROM progresso_aulas WHERE user_id=?',[uid])
  await c.query('DELETE FROM sessoes WHERE usuario_id=?',[uid])
  await c.query('DELETE FROM profiles WHERE id=?',[uid])
  await c.query('DELETE FROM usuarios WHERE id=?',[uid])
}
try{
  await limpar()
  await c.query('INSERT INTO usuarios (id,email,encrypted_password) VALUES (?,?,?)',[uid,email,bcrypt.hashSync(SENHA,10)])
  await c.query('INSERT INTO profiles (id,nome_completo,role,turma,aprovado,email) VALUES (?,?,?,?,1,?)',
    [uid,'ZZTRILHA Aluno','aluno','1° Ano',email])
  const r=await fetch(`${BASE}/api/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({identificador:email,senha:SENHA})})
  const cookie=(r.headers.getSetCookie?.()??[]).map(s=>s.split(';')[0]).join('; ')
  ok('aluno entra',r.ok)
  const pega=async u=>{const x=await fetch(BASE+u,{headers:{cookie}});return {s:x.status,h:await x.text()}}

  const t=await pega('/admin/cursos/desafios')
  ok('a trilha abre',t.s===200,`HTTP ${t.s}`)
  for(const n of ['Fácil','Médio','Difícil']) ok(`  tem a seção ${n}`,t.h.includes(n))
  ok('  mostra o contador de concluídos',/concluídos/.test(t.h))
  ok('  distingue exercício de projeto',t.h.includes('Exercício')&&t.h.includes('Projeto do'))
  ok('  marca o que vale certificado',t.h.includes('Certificado'))

  // quantos desafios a trilha lista, contra o banco
  const [n]=await c.query(`SELECT COUNT(*) n FROM curso_desafios d
    LEFT JOIN cursos cu ON cu.id=d.curso_id
    WHERE d.modulo_id IS NOT NULL OR cu.modulo_id IS NOT NULL`)
  const listados=(t.h.match(/\/admin\/cursos\/desafios\/[0-9a-f-]{36}/g)||[])
  ok('lista todos os desafios de módulo/curso',listados.length>=n.n*0.9,
    `${new Set(listados).size} links para ${n.n} desafios no banco`)

  // --- desafio de aula: abre e diz que não tem entrega
  const [aula]=await c.query(`SELECT d.id,d.titulo FROM curso_desafios d
    JOIN aulas a ON a.id=d.aula_id JOIN cursos cu ON cu.id=a.curso_id
    WHERE d.vale_certificado=0 AND cu.modulo_id IS NOT NULL LIMIT 1`)
  const da=await pega('/admin/cursos/desafios/'+aula.id)
  ok('desafio de aula abre',da.s===200,aula.titulo)
  ok('  mostra o enunciado',da.h.length>3000)
  ok('  diz que não precisa entregar',/não precisa entregar/i.test(da.h))
  ok('  tem link para a aula',/Abrir a aula/.test(da.h))

  // --- projeto de curso: trancado sem as aulas
  const [fin]=await c.query(`SELECT d.id,d.titulo,cu.id curso_id,cu.slug FROM curso_desafios d
    JOIN cursos cu ON cu.id=d.curso_id WHERE d.vale_certificado=1 AND cu.slug='html-estrutura-da-web'`)
  const df=await pega('/admin/cursos/desafios/'+fin.id)
  ok('projeto de curso abre',df.s===200,fin.titulo)
  ok('  mostra o nível',/Fácil|Médio|Difícil/.test(df.h))
  // O React separa nós de texto com <!-- -->, então "Certificado de 10h" chega
  // como "Certificado de <!-- -->10<!-- -->h". Limpa os marcadores antes.
  const semMarcas = t => t.replace(/<!-- -->/g, '')
  ok('  anuncia o certificado', /Certificado de \d+h/.test(semMarcas(df.h)))
  ok('  trancado sem as aulas',/Conclua as aulas/i.test(df.h))

  // conclui as aulas e confere que libera
  const aulas=await c.query('SELECT id FROM aulas WHERE curso_id=? AND publicado=1',[fin.curso_id])
  for(const a of aulas) await c.query(
    'INSERT INTO progresso_aulas (id,user_id,aula_id,curso_id,concluida,concluida_em) VALUES (UUID(),?,?,?,1,NOW())',
    [uid,a.id,fin.curso_id])
  const df2=await pega('/admin/cursos/desafios/'+fin.id)
  ok('concluídas as aulas, a entrega libera',!/Conclua as aulas/i.test(df2.h))
  ok('  com o formulário',/Enviar|arquivo|link/i.test(df2.h))

  // a trilha reflete o progresso
  const t2=await pega('/admin/cursos/desafios')
  ok('a trilha passa a mostrar concluídos',!/0 de \d+ desafios/.test(t2.h))

  // --- o desafio dentro da aula virou link
  const [al]=await c.query(`SELECT a.slug,cu.slug curso FROM aulas a JOIN cursos cu ON cu.id=a.curso_id
    WHERE cu.slug='html-estrutura-da-web' AND a.ordem=1`)
  const pa=await pega(`/admin/cursos/${al.curso}/${al.slug}`)
  ok('o desafio dentro da aula é clicável',/\/admin\/cursos\/desafios\/[0-9a-f-]{36}/.test(pa.h))
}catch(e){console.error('FALHA inesperada:',e.message);falhas++}
finally{
  await limpar()
  const [s]=await c.query("SELECT COUNT(*) n FROM profiles WHERE nome_completo LIKE '%ZZTRILHA%'")
  console.log(`\nlimpeza — perfis restantes: ${s.n}`)
  c.release();await pool.end()
}
console.log(falhas?`\n${falhas} falha(s)`:'\ntodas as verificações passaram')
process.exit(falhas?1:0)
