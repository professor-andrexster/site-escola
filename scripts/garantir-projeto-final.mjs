/**
 * Garante que TODO curso publicado tenha um projeto final entregavel.
 *
 * O defeito que este script corrige: `desafioFinalDoCurso()` procura por
 * `vale_certificado = 1`. Onze cursos publicados tinham o projeto de
 * fechamento escrito e gravado, mas com a flag em zero — entao a secao
 * "Certificado do curso" simplesmente nao era renderizada, e nao havia onde
 * entregar. O professor abria a Parte 1 de HTML e nao achava o envio porque
 * nao existia envio para achar.
 *
 * Dois casos, tratados diferente:
 *
 * - PROMOVER: o curso ja tem um desafio de curso (aula_id NULL) escrito como
 *   projeto de fechamento. Ele so recebe a flag e as instrucoes de envio.
 * - CRIAR: o curso nao tem nenhum desafio de curso — todos os desafios dele
 *   estao presos a aulas. Aqui nasce o projeto de fechamento.
 *
 * O que este script NAO faz, de proposito: mexer em curso que ja tem um final
 * funcionando. Quatro cursos tem a flag num desafio de AULA (Parte 3, Parte 4,
 * Excel e PHP) e ja receberam entrega de aluno nesses desafios — duas delas
 * ainda esperando correcao. Mover a flag esconderia o envio do aluno da tela
 * dele. Fica como esta; a inconsistencia e cosmetica, a perda seria real.
 *
 * Idempotente: rodar de novo nao duplica nada.
 *
 *   node scripts/desafio-final-por-curso.mjs           # mostra o que faria
 *   node scripts/desafio-final-por-curso.mjs --aplicar # grava
 */
import fs from "node:fs"
import crypto from "node:crypto"
import mariadb from "mariadb/promise.js"

const APLICAR = process.argv.includes("--aplicar")

/** Como se entrega cada tipo de projeto. */
const ENVIO_WEB = {
  formatos: ".zip, .html, .css, .png",
  instrucoes:
    "Cole o link da página publicada (GitHub Pages, Vercel ou o portfólio da escola). " +
    "Se ainda não publicou, envie a pasta do projeto compactada em .zip, com o .html e o .css dentro.",
}
const ENVIO_HARDWARE = {
  formatos: ".pdf, .docx, .png, .jpg, .zip",
  instrucoes:
    "Entregue o documento em PDF ou Word. Fotos da bancada e capturas de tela contam ponto: " +
    "mostram que você fez, não só descreveu.",
}
const ENVIO_CODIGO = {
  formatos: ".zip, .py, .pdf, .png",
  instrucoes:
    "Envie o código em .zip (ou o arquivo .py solto, se for um só) e cole o link do repositório, " +
    "se você publicou. Inclua uma captura de tela do programa rodando.",
}

/** Cursos que ja tem o projeto escrito e so precisam da flag. */
const PROMOVER = {
  "html-css-1-a-pagina-existe": ENVIO_WEB,
  "html-css-2-a-pagina-ganha-cara": ENVIO_WEB,
  "html-css-5-formularios": ENVIO_WEB,
  "html-css-6-no-ar": ENVIO_WEB,
  "hw-1-as-pecas": ENVIO_HARDWARE,
  "hw-2-a-bancada": ENVIO_HARDWARE,
  "hw-3-primeiro-boot": ENVIO_HARDWARE,
  "hw-4-manutencao-e-defeito": ENVIO_HARDWARE,
  "hw-5-sistema-e-entrega": ENVIO_HARDWARE,
}

/** Cursos sem nenhum desafio de curso: o projeto de fechamento nasce aqui. */
const CRIAR = {
  "do-codigo-ao-ar": {
    titulo: "Projeto final: seu portfólio no ar, com histórico",
    ...ENVIO_WEB,
    enunciado: `
<p>Publique seu portfólio e prove que ele foi <strong>construído</strong>, não despejado de uma vez.</p>
<p>A entrega tem duas metades, e a segunda é a que este curso ensina:</p>
<ul>
  <li><strong>A página no ar</strong> — endereço que abre em qualquer máquina, com sua identificação,
  o que você estuda e pelo menos <strong>três trabalhos</strong> seus, cada um com uma frase dizendo
  o que é e um link para ver.</li>
  <li><strong>O repositório</strong> — com no mínimo <strong>cinco commits</strong> feitos em momentos
  diferentes, cada um com mensagem que diz o que mudou. "atualização", "aaa" e "final2" não contam.</li>
</ul>
<p>O erro que aparece todo ano: fazer a página inteira e dar um commit só no fim, chamado "pronto".
Funciona, publica, e joga fora exatamente aquilo que o Git serve para guardar — a possibilidade de
voltar. Se o site quebrar no dia da apresentação e existir um commit só, não há para onde voltar.</p>
<p>Antes de entregar, faça o teste que vale mais que qualquer conferência: abra o histórico do
repositório no GitHub e leia as mensagens de cima para baixo. <strong>Dá para contar a história do
projeto só por elas?</strong> Se dá, o histórico está certo.</p>
`.trim(),
  },
  "python-do-zero": {
    titulo: "Projeto final: um programa que resolve um problema seu",
    ...ENVIO_CODIGO,
    enunciado: `
<p>Escreva um programa em Python que resolva um problema de verdade — seu, da sua casa, da sala ou
da escola. Controle de gastos, lista de presença, sorteio de apresentação, conferência de notas:
o tema é livre, o que não é livre são as peças que ele tem de usar.</p>
<p>O programa precisa, obrigatoriamente:</p>
<ul>
  <li>Ler e gravar em <strong>arquivo</strong>, para que os dados sobrevivam ao fechar o programa</li>
  <li>Ter pelo menos <strong>duas funções suas</strong>, cada uma fazendo uma coisa só</li>
  <li>Usar uma <strong>lista ou dicionário</strong> para guardar os dados enquanto roda</li>
  <li>Tratar pelo menos <strong>um erro</strong> com <code>try / except</code></li>
</ul>
<p>É esse último item que separa o programa do exercício. O erro a tratar não é o improvável: é o
que <strong>vai</strong> acontecer. O arquivo não existe na primeira vez que o programa roda. O
usuário digita "dez" onde o programa espera 10. Se ele quebrar com um <code>Traceback</code>
vermelho na cara de quem usa, ainda não está pronto.</p>
<p>O teste de aceitação, e faça isso antes de entregar: <strong>rode o programa numa pasta vazia,
com o arquivo de dados apagado, e digite besteira em todo campo que pedir número.</strong> Se ele
sobreviver aos dois, está entregável.</p>
<p>Entregue junto um <code>README.txt</code> de cinco linhas: o que o programa faz, como rodar, e
qual erro você escolheu tratar.</p>
`.trim(),
  },
}

/**
 * Modulos que tem projeto final mas ficaram sem dizer COMO entregar.
 * Sem isto o aluno ve o enunciado e um campo de arquivo, e adivinha o resto.
 */
const MODULOS = {
  "portfolio-na-web": ENVIO_WEB,
  "python-na-pratica": ENVIO_CODIGO,
}

const url = new URL(fs.readFileSync("/srv/escola/src/.env", "utf8").match(/DATABASE_URL="([^"]+)"/)[1])
const pool = mariadb.createPool({
  host: url.hostname, port: +(url.port || 3306),
  user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
  database: url.pathname.slice(1), connectionLimit: 2, bigIntAsNumber: true,
})
const c = await pool.getConnection()

console.log(APLICAR ? "== APLICANDO ==\n" : "== SIMULACAO (use --aplicar para gravar) ==\n")

/** Deixa `desafioId` como o unico final do curso. Espelha definirDesafioFinal(). */
async function marcarFinal(cursoId, desafioId, envio) {
  if (!APLICAR) return
  await c.beginTransaction()
  try {
    await c.query(
      "UPDATE curso_desafios SET vale_certificado = 0 WHERE curso_id = ? AND vale_certificado = 1 AND id <> ?",
      [cursoId, desafioId])
    await c.query(
      "UPDATE curso_desafios SET vale_certificado = 1, formatos_aceitos = ?, instrucoes_envio = ? WHERE id = ?",
      [envio.formatos, envio.instrucoes, desafioId])
    await c.commit()
  } catch (e) {
    await c.rollback()
    throw e
  }
}

let promovidos = 0, criados = 0, pulados = 0

for (const [slug, envio] of Object.entries(PROMOVER)) {
  const [cu] = await c.query("SELECT id, titulo FROM cursos WHERE slug = ?", [slug])
  if (!cu) { console.log(`  !! curso nao encontrado: ${slug}`); continue }

  const [jaTem] = await c.query(
    "SELECT id, titulo FROM curso_desafios WHERE curso_id = ? AND vale_certificado = 1", [cu.id])
  const [proj] = await c.query(
    "SELECT id, titulo FROM curso_desafios WHERE curso_id = ? AND aula_id IS NULL", [cu.id])

  if (!proj) { console.log(`  !! ${cu.titulo}: sem projeto de curso para promover`); continue }
  if (jaTem && jaTem.id === proj.id) { pulados++; console.log(`  -- ${cu.titulo}: ja estava certo`); continue }

  console.log(`  ->  ${cu.titulo}\n      final passa a ser "${proj.titulo}"`)
  await marcarFinal(cu.id, proj.id, envio)
  promovidos++
}

for (const [slug, d] of Object.entries(CRIAR)) {
  const [cu] = await c.query("SELECT id, titulo FROM cursos WHERE slug = ?", [slug])
  if (!cu) { console.log(`  !! curso nao encontrado: ${slug}`); continue }

  const [existe] = await c.query(
    "SELECT id FROM curso_desafios WHERE curso_id = ? AND aula_id IS NULL AND titulo = ?",
    [cu.id, d.titulo])

  if (existe) {
    const [jaTem] = await c.query(
      "SELECT id FROM curso_desafios WHERE curso_id = ? AND vale_certificado = 1", [cu.id])
    if (jaTem && jaTem.id === existe.id) { pulados++; console.log(`  -- ${cu.titulo}: ja estava certo`); continue }
    console.log(`  ->  ${cu.titulo}: projeto ja existia, marcando como final`)
    await marcarFinal(cu.id, existe.id, d)
    promovidos++
    continue
  }

  // Depois do ultimo desafio do curso, para cair no fim da lista.
  const [{ prox }] = await c.query(
    "SELECT COALESCE(MAX(ordem), 0) + 1 prox FROM curso_desafios WHERE curso_id = ?", [cu.id])

  console.log(`  +   ${cu.titulo}\n      cria "${d.titulo}" (ordem ${prox})`)
  if (APLICAR) {
    const id = crypto.randomUUID()
    await c.query(
      `INSERT INTO curso_desafios (id, curso_id, aula_id, titulo, enunciado, tipo, ordem,
         vale_certificado, formatos_aceitos, instrucoes_envio, created_at)
       VALUES (?, ?, NULL, ?, ?, 'projeto', ?, 0, ?, ?, NOW())`,
      [id, cu.id, d.titulo, d.enunciado, prox, d.formatos, d.instrucoes])
    await marcarFinal(cu.id, id, d)
  }
  criados++
}

let modulosCorrigidos = 0
for (const [slug, envio] of Object.entries(MODULOS)) {
  const [m] = await c.query("SELECT id, nome FROM modulos WHERE slug = ?", [slug])
  if (!m) { console.log(`  !! modulo nao encontrado: ${slug}`); continue }

  const [d] = await c.query(
    `SELECT id, titulo, formatos_aceitos fa, instrucoes_envio ie
     FROM curso_desafios WHERE modulo_id = ? AND vale_certificado = 1`, [m.id])
  if (!d) { console.log(`  !! ${m.nome}: sem projeto final`); continue }
  if (d.fa && d.ie) { pulados++; console.log(`  -- ${m.nome}: ja estava certo`); continue }

  console.log(`  ->  modulo ${m.nome}\n      preenche como entregar "${d.titulo}"`)
  if (APLICAR) {
    await c.query("UPDATE curso_desafios SET formatos_aceitos = ?, instrucoes_envio = ? WHERE id = ?",
      [envio.formatos, envio.instrucoes, d.id])
  }
  modulosCorrigidos++
}

console.log(`\n  ${promovidos} promovido(s) · ${criados} criado(s) · ${modulosCorrigidos} modulo(s) · ${pulados} ja certo(s)`)

// Conferencia final: nenhum curso publicado pode ficar sem entrega.
const orfaos = await c.query(`
  SELECT cu.titulo FROM cursos cu
  WHERE cu.publicado = 1
    AND NOT EXISTS (SELECT 1 FROM curso_desafios d WHERE d.curso_id = cu.id AND d.vale_certificado = 1)`)
console.log(`  cursos publicados ainda sem projeto final: ${orfaos.length}`)
orfaos.forEach(x => console.log(`    !! ${x.titulo}`))

const duplos = await c.query(`
  SELECT cu.titulo, COUNT(*) n FROM curso_desafios d JOIN cursos cu ON cu.id = d.curso_id
  WHERE d.vale_certificado = 1 GROUP BY cu.id HAVING n > 1`)
console.log(`  cursos com mais de um projeto final: ${duplos.length}`)
duplos.forEach(x => console.log(`    !! ${x.titulo}: ${x.n}`))

const semComo = await c.query(`
  SELECT COALESCE(cu.titulo, m.nome) alvo FROM curso_desafios d
  LEFT JOIN cursos cu ON cu.id = d.curso_id LEFT JOIN modulos m ON m.id = d.modulo_id
  WHERE d.vale_certificado = 1 AND (d.formatos_aceitos IS NULL OR d.instrucoes_envio IS NULL)`)
console.log(`  projetos finais sem dizer como entregar: ${semComo.length}`)
semComo.forEach(x => console.log(`    !! ${x.alvo}`))

c.release()
await pool.end()
