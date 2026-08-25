/**
 * Testa, no ar, o caminho completo do projeto final de cada curso:
 * carregar o desafio -> enviar -> ler de volta -> apagar o envio de teste.
 *
 * Existe porque o defeito que ele pega nao aparece em teste de unidade nem na
 * auditoria de tela: o curso carregava, a pagina respondia 200, e simplesmente
 * nao havia formulario de entrega — a secao inteira sumia quando o curso nao
 * tinha desafio com `vale_certificado`.
 *
 * O envio de teste e SEMPRE apagado no fim, inclusive se o teste falhar: isto
 * roda contra o banco de producao e a fila de correcao do professor nao pode
 * amanhecer com lixo. Envio de aluno de verdade nunca e tocado — a limpeza
 * apaga so as linhas criadas por esta execucao, pelo id.
 *
 *   node scripts/testar-envio-desafios.mjs                    # todos os cursos
 *   node scripts/testar-envio-desafios.mjs html-css hardware  # so essas trilhas
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

// Sessao temporaria de um usuario da equipe. E a equipe que precisa conseguir
// entregar sem ter feito as aulas — o aluno tem a trava de propósito.
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
const criados = []          // ids de envio criados aqui, para apagar no fim
let ok = 0
const falhas = []

/** Ordem pedida: HTML e CSS primeiro, depois software, depois o resto. */
const PRIORIDADE = ["Programação", "Software", "Hardware", "Excel & Dados"]
const filtros = process.argv.slice(2)

try {
  const cursos = await c.query(`
    SELECT cu.id, cu.slug, cu.titulo, t.nome trilha, cu.ordem_na_trilha
    FROM cursos cu LEFT JOIN trilhas t ON t.id = cu.trilha_id
    WHERE cu.publicado = 1 ORDER BY FIELD(t.nome, ${PRIORIDADE.map(() => "?").join(",")}), cu.ordem_na_trilha`,
    PRIORIDADE)

  const alvo = filtros.length
    ? cursos.filter(x => filtros.some(f => x.slug.includes(f) || x.trilha?.toLowerCase().includes(f.toLowerCase())))
    : cursos

  let trilha = ""
  for (const cu of alvo) {
    if (cu.trilha !== trilha) { trilha = cu.trilha; console.log(`\n== ${trilha} ==`) }

    // 1. o desafio final chega pela API?
    const g = await fetch(`${BASE}/api/cursos/desafio-final?curso=${cu.slug}`, { headers: cookie })
    const dados = await g.json().catch(() => ({}))
    if (g.status !== 200 || !dados.desafio) {
      falhas.push(`${cu.titulo}: API nao devolveu desafio (${g.status})`)
      console.log(`  !! ${cu.titulo}\n     sem desafio final na API`)
      continue
    }

    const d = dados.desafio
    const jaTinha = Boolean(dados.envio)   // envio real de aluno? nao mexer
    const semInstrucoes = !d.instrucoes_envio || !d.formatos_aceitos

    // 2. a pagina do curso mostra o formulario?
    const pg = await fetch(`${BASE}/admin/cursos/${cu.slug}`, { headers: cookie })
    const html = await pg.text()
    const temFormulario = html.includes("Certificado do curso")

    // 3. envio de verdade
    let envioOk = false, motivo = ""
    if (jaTinha) {
      motivo = "ja havia envio deste usuario — nao sobrescrevi"
    } else {
      const post = await fetch(`${BASE}/api/cursos/desafio-final`, {
        method: "POST",
        headers: { ...cookie, "content-type": "application/json" },
        body: JSON.stringify({
          desafioId: d.id,
          linkUrl: "https://exemplo.invalido/teste-de-entrega",
          comentario: MARCA,
        }),
      })
      const r = await post.json().catch(() => ({}))
      envioOk = post.status === 200 && Boolean(r.envio)
      if (envioOk) criados.push({ desafioId: d.id, userId: staff.id })
      else motivo = `POST ${post.status} ${r.error ?? ""}`
    }

    const bom = temFormulario && (envioOk || jaTinha)
    if (bom) ok++
    else falhas.push(`${cu.titulo}: ${motivo || "formulario nao renderizou"}`)

    console.log(`  ${bom ? "ok " : "!! "} ${cu.titulo}`)
    console.log(`      projeto: ${d.titulo}`)
    console.log(`      formulario na pagina: ${temFormulario ? "sim" : "NAO"} · envio: ${envioOk ? "aceito" : jaTinha ? "pulado (envio real existente)" : "FALHOU " + motivo}`)
    if (semInstrucoes) console.log(`      !! sem formatos_aceitos/instrucoes_envio`)
  }
} finally {
  // Limpeza: so o que esta execucao criou.
  for (const x of criados) {
    await c.query("DELETE FROM curso_desafio_envios WHERE desafio_id = ? AND user_id = ? AND comentario = ?",
      [x.desafioId, x.userId, MARCA])
  }
  await c.query("DELETE FROM sessoes WHERE token_hash = ?", [hash])
  const [resto] = await c.query("SELECT COUNT(*) n FROM curso_desafio_envios WHERE comentario = ?", [MARCA])
  console.log(`\n  ${criados.length} envio(s) de teste feito(s) e apagado(s) · sobrou ${resto.n}`)
  console.log(`  ${ok} curso(s) com entrega funcionando · ${falhas.length} com problema`)
  falhas.forEach(f => console.log(`    !! ${f}`))
  c.release()
  await pool.end()
}
