/**
 * O mesmo teste de ponta a ponta do projeto final, mas para os MODULOS —
 * o certificado maior, que soma os cursos de uma etapa inteira.
 *
 * Vale a pena separar do teste de curso porque a trava e outra: o modulo so
 * libera quando TODOS os cursos dele estao concluidos, e a consulta de
 * progresso e diferente. Um pode funcionar com o outro quebrado.
 *
 * Igual ao de curso: o envio de teste e sempre apagado no fim.
 */
import fs from "node:fs"
import crypto from "node:crypto"
import mariadb from "mariadb/promise.js"

const BASE = process.env.BASE_URL || "https://escolaestadualdrjoaoberaldo.com"
const MARCA = "[teste automatico de entrega — pode apagar]"

const url = new URL(fs.readFileSync("/srv/escola/src/.env", "utf8").match(/DATABASE_URL="([^"]+)"/)[1])
const pool = mariadb.createPool({
  host: url.hostname, port: +(url.port || 3306),
  user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
  database: url.pathname.slice(1), connectionLimit: 3, bigIntAsNumber: true,
})
const c = await pool.getConnection()

const [staff] = await c.query(`
  SELECT p.id, p.nome_completo, p.role FROM profiles p
  WHERE p.role IN ('professor','monitor','diretora','vice_diretora','admin') AND p.aprovado = 1
  ORDER BY FIELD(p.role,'professor','monitor','diretora','vice_diretora','admin') LIMIT 1`)

const token = crypto.randomBytes(32).toString("hex")
const hash = crypto.createHash("sha256").update(token).digest("hex")
await c.query(
  "INSERT INTO sessoes (id, usuario_id, token_hash, expira_em, criado_em) VALUES (UUID(), ?, ?, ?, NOW())",
  [staff.id, hash, new Date(Date.now() + 36e5)])

const cookie = { cookie: "jb_sessao=" + token }
const criados = []
let ok = 0
const falhas = []

try {
  const mods = await c.query("SELECT id, nome, slug, publicado FROM modulos ORDER BY ordem")
  console.log(`entrando como ${staff.nome_completo} (${staff.role})\n`)

  for (const m of mods) {
    const [d] = await c.query(
      `SELECT id, titulo, formatos_aceitos fa, instrucoes_envio ie
       FROM curso_desafios WHERE modulo_id = ? AND vale_certificado = 1`, [m.id])

    if (!d) {
      falhas.push(`${m.nome}: sem projeto de modulo`)
      console.log(`  !! ${m.nome}: sem projeto de modulo`)
      continue
    }

    const pg = await fetch(`${BASE}/admin/modulos/${m.slug}`, { headers: cookie })
    const html = await pg.text()
    const temFormulario = html.includes("Projeto do módulo") && !html.includes("Conclua as aulas dos")

    const [jaTem] = await c.query(
      "SELECT id FROM curso_desafio_envios WHERE desafio_id = ? AND user_id = ?", [d.id, staff.id])

    let envioOk = false, motivo = ""
    if (jaTem) {
      motivo = "ja havia envio deste usuario"
    } else {
      const post = await fetch(`${BASE}/api/cursos/desafio-final`, {
        method: "POST",
        headers: { ...cookie, "content-type": "application/json" },
        body: JSON.stringify({ desafioId: d.id, linkUrl: "https://exemplo.invalido/teste", comentario: MARCA }),
      })
      const r = await post.json().catch(() => ({}))
      envioOk = post.status === 200 && Boolean(r.envio)
      if (envioOk) criados.push({ desafioId: d.id, userId: staff.id })
      else motivo = `POST ${post.status} ${r.error ?? ""}`
    }

    const bom = temFormulario && (envioOk || jaTem)
    if (bom) ok++; else falhas.push(`${m.nome}: ${motivo || "formulario nao renderizou"}`)

    console.log(`  ${bom ? "ok " : "!! "} ${m.nome}`)
    console.log(`      projeto: ${d.titulo}`)
    console.log(`      formulario: ${temFormulario ? "sim" : "NAO"} · envio: ${envioOk ? "aceito" : jaTem ? "pulado" : "FALHOU " + motivo}`)
    if (!d.fa || !d.ie) console.log(`      !! sem formatos_aceitos/instrucoes_envio`)
  }
} finally {
  for (const x of criados) {
    await c.query("DELETE FROM curso_desafio_envios WHERE desafio_id = ? AND user_id = ? AND comentario = ?",
      [x.desafioId, x.userId, MARCA])
  }
  await c.query("DELETE FROM sessoes WHERE token_hash = ?", [hash])
  const [resto] = await c.query("SELECT COUNT(*) n FROM curso_desafio_envios WHERE comentario = ?", [MARCA])
  console.log(`\n  ${criados.length} envio(s) de teste feito(s) e apagado(s) · sobrou ${resto.n}`)
  console.log(`  ${ok} modulo(s) com entrega funcionando · ${falhas.length} com problema`)
  falhas.forEach(f => console.log(`    !! ${f}`))
  c.release()
  await pool.end()
}
