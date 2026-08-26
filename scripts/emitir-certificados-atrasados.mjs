/**
 * Emite o certificado de quem teve o projeto final APROVADO e ficou sem ele.
 *
 * Como isso acontece: em `envios/[id]/route.ts` a avaliacao e a emissao nao
 * estao na mesma transacao. `avaliarEnvio()` grava "aprovado" primeiro; se a
 * emissao nao acontecer logo depois — porque o desafio ainda nao valia
 * certificado naquele momento, ou porque a emissao falhou — o aluno fica
 * aprovado e sem documento. A tela entao diz a ele que "o certificado foi
 * emitido" e nao mostra botao nenhum, que e a pior combinacao possivel.
 *
 * Foi o que houve com tres aprovacoes de 19/08/2026.
 *
 * O que este script copia da rota, para o documento sair igual ao que a
 * plataforma emitiria hoje:
 *
 * - o mesmo alfabeto de codigo, sem 0/O e 1/I/L, porque alguem digita a mao;
 * - `carga_min` do curso, que e o que o documento imprime — sem isso um curso
 *   de 25 minutos sairia como "1 hora", porque `carga_horaria` e inteiro;
 * - nota 100, que e como aprovacao binaria de projeto e registrada.
 *
 * A data de emissao e a data da APROVACAO, nao a de hoje: o certificado
 * atrasado precisa dizer quando o trabalho foi aceito, senao ele conta uma
 * historia errada — a aluna concluiu em agosto e o papel diria outro mes.
 *
 * Idempotente por construcao: existe UNIQUE (user_id, curso_id) em
 * `certificados`, e o script so olha para quem ainda nao tem.
 *
 *   node scripts/emitir-certificados-atrasados.mjs           # simula
 *   node scripts/emitir-certificados-atrasados.mjs --aplicar # emite
 */
import fs from "node:fs"
import crypto from "node:crypto"
import mariadb from "mariadb/promise.js"

const APLICAR = process.argv.includes("--aplicar")

// Mesmo alfabeto da rota: sem 0/O e sem 1/I/L.
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
function gerarCodigo() {
  const bytes = crypto.randomBytes(8)
  let s = ""
  for (let i = 0; i < bytes.length; i++) s += ALFABETO[bytes[i] % ALFABETO.length]
  return `JB-${s}`
}

const url = new URL(fs.readFileSync("/srv/escola/src/.env", "utf8").match(/DATABASE_URL="([^"]+)"/)[1])
const pool = mariadb.createPool({
  host: url.hostname, port: +(url.port || 3306),
  user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
  database: url.pathname.slice(1), connectionLimit: 2, bigIntAsNumber: true,
})
const c = await pool.getConnection()

console.log(APLICAR ? "== EMITINDO ==\n" : "== SIMULACAO (use --aplicar para emitir) ==\n")

// --------------------------------------------------------- certificado de curso
const deCurso = await c.query(`
  SELECT v.user_id, v.avaliado_em, v.enviado_em,
         pr.nome_completo aluno, cu.id curso_id, cu.titulo curso, cu.slug,
         cu.carga_horaria, cu.carga_min, cu.autor_nome,
         (SELECT COALESCE(SUM(a.duracao_estimada_min), 0) FROM aulas a
           WHERE a.curso_id = cu.id AND a.publicado = 1) soma_aulas
  FROM curso_desafio_envios v
  JOIN curso_desafios d ON d.id = v.desafio_id
  JOIN cursos cu ON cu.id = d.curso_id
  JOIN profiles pr ON pr.id = v.user_id
  WHERE v.status = 'aprovado' AND d.vale_certificado = 1
    AND NOT EXISTS (SELECT 1 FROM certificados ce
                     WHERE ce.user_id = v.user_id AND ce.curso_id = cu.id)`)

// -------------------------------------------------------- certificado de modulo
const deModulo = await c.query(`
  SELECT v.user_id, v.avaliado_em, v.enviado_em,
         pr.nome_completo aluno, m.id modulo_id, m.nome modulo,
         m.carga_horaria, m.carga_min
  FROM curso_desafio_envios v
  JOIN curso_desafios d ON d.id = v.desafio_id
  JOIN modulos m ON m.id = d.modulo_id
  JOIN profiles pr ON pr.id = v.user_id
  WHERE v.status = 'aprovado' AND d.vale_certificado = 1
    AND NOT EXISTS (SELECT 1 FROM certificados ce
                     WHERE ce.user_id = v.user_id AND ce.modulo_id = m.id)`)

const emitidos = []

for (const x of deCurso) {
  const cargaMin = x.carga_min ?? (Number(x.soma_aulas) || null)
  const cargaHoraria = x.carga_horaria ?? Math.max(1, Math.ceil((Number(x.soma_aulas) || 60) / 60))
  const quando = x.avaliado_em ?? x.enviado_em
  const codigo = gerarCodigo()

  console.log(`  ${x.aluno}`)
  console.log(`     curso: ${x.curso}`)
  console.log(`     carga: ${cargaMin} min (carga_horaria=${cargaHoraria}) · autor: ${x.autor_nome ?? "—"}`)
  console.log(`     emitido em: ${quando.toISOString().slice(0, 16).replace("T", " ")} (data da aprovação)`)
  console.log(`     código: ${codigo}`)

  if (APLICAR) {
    await c.query(
      `INSERT INTO certificados
         (id, codigo, user_id, curso_id, aluno_nome, curso_titulo, autor_nome,
          carga_horaria, carga_min, nota, emitido_em)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, 100, ?)`,
      [codigo, x.user_id, x.curso_id, x.aluno, x.curso, x.autor_nome ?? null,
       cargaHoraria, cargaMin, quando])
    emitidos.push({ codigo, aluno: x.aluno, alvo: x.curso })
  }
}

for (const x of deModulo) {
  const cargaMin = x.carga_min ?? null
  const quando = x.avaliado_em ?? x.enviado_em
  const codigo = gerarCodigo()

  console.log(`  ${x.aluno}`)
  console.log(`     módulo: ${x.modulo}`)
  console.log(`     carga: ${cargaMin} min · emitido em: ${quando.toISOString().slice(0, 16).replace("T", " ")}`)
  console.log(`     código: ${codigo}`)

  if (APLICAR) {
    // Modulo sai assinado pela escola, nao por um professor: ele reune cursos
    // de autores possivelmente diferentes. Mesma regra da rota.
    await c.query(
      `INSERT INTO certificados
         (id, codigo, user_id, modulo_id, aluno_nome, curso_titulo, modulo_titulo,
          autor_nome, carga_horaria, carga_min, nota, emitido_em)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, NULL, ?, ?, 100, ?)`,
      [codigo, x.user_id, x.modulo_id, x.aluno, x.modulo, x.modulo,
       x.carga_horaria ?? 0, cargaMin, quando])
    emitidos.push({ codigo, aluno: x.aluno, alvo: x.modulo })
  }
}

const total = deCurso.length + deModulo.length
console.log(`\n  ${total} certificado(s) ${APLICAR ? "emitido(s)" : "a emitir"}`)

if (!total) console.log("  nada pendente")

console.log("\n== conferência ==")
const [pend] = await c.query(`
  SELECT COUNT(*) n FROM curso_desafio_envios v
  JOIN curso_desafios d ON d.id = v.desafio_id
  WHERE v.status = 'aprovado' AND d.vale_certificado = 1
    AND NOT EXISTS (SELECT 1 FROM certificados ce WHERE ce.user_id = v.user_id
                     AND (ce.curso_id = d.curso_id OR ce.modulo_id = d.modulo_id))`)
console.log(`  ${pend.n === 0 ? "ok  " : "!!  "}aprovados ainda sem certificado: ${pend.n}`)

const [tot] = await c.query("SELECT COUNT(*) n FROM certificados")
console.log(`  certificados no banco: ${tot.n}`)

const semCarga = await c.query("SELECT codigo, aluno_nome FROM certificados WHERE carga_min IS NULL")
console.log(`  ${semCarga.length === 0 ? "ok  " : "!!  "}certificados sem carga_min (imprimem hora arredondada): ${semCarga.length}`)
semCarga.forEach(x => console.log(`      ${x.codigo} ${x.aluno_nome}`))

if (emitidos.length) {
  console.log("\n== os documentos abrem? ==")
  for (const e of emitidos) {
    const r = await fetch(`https://escolaestadualdrjoaoberaldo.com/certificado/${e.codigo}`)
    const t = (await r.text()).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")
    const m = t.match(/carga horária de ([^,]+),/)
    console.log(`  ${r.status === 200 && t.includes(e.aluno) ? "ok " : "!! "} ${e.codigo} ${e.aluno}`)
    console.log(`      ${r.status} · nome: ${t.includes(e.aluno) ? "ok" : "NAO"} · curso: ${t.includes(e.alvo) ? "ok" : "NAO"} · imprime "${m ? m[1].trim() : "?"}"`)
  }
}

c.release()
await pool.end()
