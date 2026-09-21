/**
 * Cria o módulo "Desafios Extras" e o primeiro desafio dele: Sistema Escolar
 * na Web, dentro da trilha Programação (o card "Programação" de /admin/cursos).
 *
 *   node scripts/criar-modulo-desafios-extras.mjs             simula
 *   node scripts/criar-modulo-desafios-extras.mjs --aplicar   grava como rascunho (publicado = 0)
 *   node scripts/criar-modulo-desafios-extras.mjs --publicar  liga módulo, curso e aula
 *
 * O que é um "desafio extra" aqui: um curso de UMA aula (o briefing) com um
 * desafio final que vale certificado. O aluno lê o briefing, marca a aula como
 * concluída, publica o sistema na internet e envia o link pela tela do desafio
 * final (DesafioFinal aceita arquivo ou link). O professor avalia em
 * /admin/cursos/gerenciar/entregas ou em /admin/cursos/gerenciar/<id>/desafio-final.
 *
 * Por que curso-de-uma-aula e não outra coisa: envio, fila de correção,
 * aprovação e certificado só existem para o desafio final de curso
 * (desafioFinalDoCurso, um por curso) e para o desafio grande de módulo. Um
 * curso por desafio extra usa essa máquina inteira sem mudar código nem fazer
 * deploy. Novos desafios extras entram como novos cursos neste módulo.
 *
 * Posição: módulo na ordem 12 (depois de Java, nível Difícil); curso na
 * posição 15 da trilha Programação (última). Não empurra ninguém.
 *
 * O banco do desafio é o da aula 7 de "Banco de Dados para Iniciantes"
 * (scripts/criar-curso-banco-de-dados-iniciante.mjs): 8 tabelas, cascata,
 * matrícula. Os dois enunciados apontam um para o outro.
 *
 * Tudo nasce despublicado. Idempotente: rodar duas vezes não duplica nada.
 */
import { readFileSync } from 'node:fs'
import mariadb from '../node_modules/mariadb/promise.js'

const APLICAR = process.argv.includes('--aplicar') || process.argv.includes('--publicar')
const PUBLICAR = process.argv.includes('--publicar')

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, '')] })
)

const TRILHA_SLUG = 'programacao'

const MODULO = {
  slug: 'desafios-extras',
  nome: 'Desafios Extras',
  nivel: 'Difícil',
  ordem: 12,
  carga: 1,
  cargaMin: 60,
  descricao:
    'Projetos completos para quem já fez os cursos da trilha e quer construir algo de verdade: você monta o sistema, publica na internet, envia o link e o professor avalia. Cada desafio vale certificado próprio.',
}

const CURSO = {
  slug: 'desafio-extra-sistema-escolar',
  titulo: 'Desafio Extra: Sistema Escolar na Web',
  categoria: 'Programação',
  nivel: 'Difícil',
  carga: 1,
  cargaMin: 60,
  ordemNoModulo: 1,
  ordemNaTrilha: 15,
  descricao:
    'Transforme o banco de dados do sistema escolar (turmas, professores, disciplinas, alunos, matrículas, notas e faltas) em um site de verdade: cadastro, matrícula, lançamento de notas e boletim. Publique na internet, envie o link e receba a avaliação do professor.',
}

const AULA = {
  slug: 'briefing-sistema-escolar-na-web',
  titulo: 'Briefing: o sistema escolar, do banco ao site',
  descricao: 'O que construir, com o quê, como publicar e como será avaliado. Leia inteiro antes de abrir o editor.',
  min: 5,
  conteudo: `
<h2>O que é um desafio extra</h2>
<p>Não é aula. É um projeto inteiro, do tamanho de um trabalho de verdade. Você recebe o briefing
(esta página), constrói o sistema no seu ritmo, publica na internet e envia o link na seção
<strong>Certificado do curso</strong>, lá embaixo na página deste desafio. O professor abre o seu
site, testa, e devolve com nota e comentários. Aprovou, sai o certificado.</p>
<p>Marque esta aula como concluída quando terminar de ler: é isso que libera o envio.</p>

<h2>O que você vai construir</h2>
<p>Um <strong>sistema escolar</strong> para a secretaria de uma escola pequena, em cima do banco de
dados que você montou na aula 7 de <a href="/admin/cursos/banco-de-dados-iniciante">Banco de Dados
para Iniciantes</a>: <code>turmas</code>, <code>professores</code>, <code>disciplinas</code>,
<code>alunos</code>, <code>matriculas</code>, <code>turma_disciplinas</code>, <code>notas</code> e
<code>faltas</code>, com as chaves estrangeiras e as regras de cascata daquele desafio. Se ainda não
fez aquele desafio, faça primeiro: o banco é metade deste projeto.</p>

<h3>Telas obrigatórias</h3>
<ol>
  <li><strong>Entrar:</strong> login simples da secretaria (um usuário e senha bastam; senha guardada
  com hash, nunca em texto puro)</li>
  <li><strong>Turmas:</strong> listar, criar, editar. Apagar turma com matrícula tem que ser
  recusado, com mensagem clara (é o <code>RESTRICT</code> do banco chegando na tela)</li>
  <li><strong>Alunos:</strong> listar com busca por nome, criar, editar, ver a ficha com o
  histórico de matrículas</li>
  <li><strong>Matrícula:</strong> matricular um aluno em uma turma em um ano; mudar a situação
  (ativa, transferido, concluido). A regra "um aluno, uma matrícula por ano" tem que aparecer como
  mensagem, não como erro do banco na cara do usuário</li>
  <li><strong>Notas:</strong> escolher turma e disciplina e lançar as notas do bimestre de todos os
  alunos da turma em uma tela só (uma linha por aluno)</li>
  <li><strong>Faltas:</strong> lista de chamada do dia: marcar quem faltou, com justificada sim ou não</li>
  <li><strong>Boletim:</strong> por aluno, ano: disciplina, nota por bimestre, média e total de faltas.
  Precisa de uma versão para imprimir (o <code>@media print</code> do curso de HTML e CSS serve)</li>
  <li><strong>Relatório:</strong> alunos com média abaixo de 6 em alguma disciplina, por turma</li>
</ol>

<h3>Regras do jogo</h3>
<ul>
  <li>Nada é apagado de verdade fora do que o banco já apaga em cascata. Aluno que sai da escola é
  matrícula "transferido", não <code>DELETE</code></li>
  <li>Toda entrada do usuário passa pela consulta com parâmetro (prepared statement). Nunca cole texto
  do formulário dentro do SQL. Teste: digite <code>' OR 1=1 --</code> na busca e veja que nada quebra</li>
  <li>Toda tela funciona no celular (a secretaria usa o que tiver na mão)</li>
  <li>O sistema chega com dados de exemplo (os do desafio da aula 7 servem) para o professor não
  avaliar telas vazias</li>
</ul>

<h2>Com o quê</h2>
<p>Qualquer linguagem da trilha Programação. Escolha o que você já fez curso:</p>
<table>
  <tr><th>Caminho</th><th>Banco</th><th>Curso que preparou</th></tr>
  <tr><td>PHP puro ou com um micro-framework</td><td>MySQL/MariaDB ou SQLite (PDO)</td><td>PHP — Back-end Web</td></tr>
  <tr><td>Python com Flask ou Django</td><td>SQLite (nasce com o Python) ou PostgreSQL</td><td>Python do Zero</td></tr>
  <tr><td>Node.js com Express</td><td>SQLite (better-sqlite3) ou MySQL</td><td>Programação Web com JavaScript</td></tr>
</table>
<p>O banco é o mesmo em qualquer caminho. Só troque <code>INTEGER PRIMARY KEY</code> por
<code>INT AUTO_INCREMENT PRIMARY KEY</code> se for MySQL. Guarde o <code>.sql</code> de criação no
repositório: quem clonar o projeto precisa recriar o banco.</p>

<h2>Como publicar</h2>
<p>O site precisa estar acessível por um link público quando o professor abrir. Três caminhos, do mais
simples ao mais livre:</p>
<ol>
  <li><strong>Servidor da escola:</strong> peça ao professor um espaço no servidor da escola. Você
  recebe um endereço e um acesso, sobe o projeto e pronto. É o caminho recomendado</li>
  <li><strong>Hospedagem gratuita com back-end:</strong> existem serviços gratuitos que rodam Python,
  Node ou PHP a partir de um repositório no GitHub (o professor indica os que estão funcionando no
  momento; eles mudam com frequência). Todos pedem uma conta e um repositório público</li>
  <li><strong>Servidor próprio:</strong> quem já tem um VPS ou um Raspberry Pi em casa com IP fixo pode
  usar; não é obrigatório</li>
</ol>
<p>Junto com o link, mande o <strong>usuário e a senha de teste</strong> no campo de comentário do
envio, e o link do repositório com o código. Sem os três (site, login, código) a avaliação não começa.</p>

<h2>Como será avaliado</h2>
<table>
  <tr><th>Critério</th><th>O que se espera</th></tr>
  <tr><td>No ar</td><td>O link abre, o login de teste entra, os dados de exemplo estão lá</td></tr>
  <tr><td>As oito telas</td><td>Cada uma faz o que o briefing pede, de ponta a ponta</td></tr>
  <tr><td>Banco certo</td><td>As oito tabelas com chave estrangeira e cascata; nota e falta apontam para a matrícula</td></tr>
  <tr><td>Regras na tela</td><td>Turma com matrícula não apaga, aluno não se matricula duas vezes no ano, e o usuário entende o porquê</td></tr>
  <tr><td>Segurança básica</td><td>Senha com hash, consultas com parâmetro, telas fechadas sem login</td></tr>
  <tr><td>Boletim</td><td>Média certa, imprime limpo, funciona no celular</td></tr>
  <tr><td>Código</td><td>Repositório com README dizendo como rodar, <code>.sql</code> de criação, nomes claros, sem senha no código</td></tr>
</table>
<p>Nota de 0 a 10. Abaixo de 6 o professor devolve com o que falta, você corrige e reenvia. Não tem
limite de tentativas.</p>

<h2>Antes de começar</h2>
<ul>
  <li>Faça o banco primeiro (desafio da aula 7 do curso de Banco de Dados). Teste as oito consultas no
  sqliteonline.com: elas viram as telas de boletim, chamada e relatório</li>
  <li>Desenhe as telas no papel. Oito retângulos com o que cada um mostra e para onde cada botão leva</li>
  <li>Comece por Entrar, depois Alunos. Publique já com duas telas prontas e vá atualizando. Site no ar
  desde o começo é mais fácil de manter no ar do que site publicado no último dia</li>
</ul>
`,
}

const DESAFIO_FINAL = {
  titulo: 'Sistema Escolar na Web: envie o link do sistema publicado',
  enunciado: `
<p>Terminou o briefing e construiu o sistema? Publique na internet e envie aqui. O professor abre o seu
link, entra com o login de teste, passa pelas oito telas e devolve com nota e comentários.</p>

<h3>O que enviar</h3>
<ul>
  <li><strong>O link do sistema publicado</strong> (obrigatório), no campo de link</li>
  <li><strong>No comentário:</strong> o usuário e a senha de teste, o link do repositório com o código
  e uma linha dizendo qual caminho você usou (PHP, Python ou Node, e qual banco)</li>
  <li>Opcional: um <code>.zip</code> com o código, se o repositório for privado</li>
</ul>

<h3>Checklist antes de enviar</h3>
<ul>
  <li>Abri o link em uma aba anônima e consegui entrar com o login de teste</li>
  <li>As oito telas existem e funcionam: Entrar, Turmas, Alunos, Matrícula, Notas, Faltas, Boletim, Relatório</li>
  <li>Tentei apagar uma turma com matrícula e recebi uma mensagem, não uma tela de erro</li>
  <li>Digitei <code>' OR 1=1 --</code> na busca de alunos e nada quebrou</li>
  <li>Abri o boletim no celular e mandei imprimir</li>
  <li>O README do repositório diz como rodar e tem o <code>.sql</code> de criação do banco</li>
  <li>Não há senha nem chave dentro do código</li>
</ul>
<p>Os critérios de nota estão no briefing. Reprovou? Corrija e reenvie, quantas vezes precisar.</p>
`,
  instrucoes: 'Cole o link do sistema publicado. No comentário: usuário e senha de teste, link do repositório e o caminho usado (PHP, Python ou Node). Zip do código só se o repositório for privado.',
  formatos: '.zip, .pdf, .png',
}

// ---------------------------------------------------------------- execução

const url = new URL(env.DATABASE_URL)
const pool = mariadb.createPool({
  host: url.hostname, port: Number(url.port || 3306),
  user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
  database: url.pathname.slice(1), connectionLimit: 2, bigIntAsNumber: true,
})
const c = await pool.getConnection()
const acao = m => console.log(`${APLICAR ? '  ok  ' : ' sim  '} ${m}`)
const PUB = PUBLICAR ? 1 : 0

try {
  const [trilha] = await c.query('SELECT id FROM trilhas WHERE slug = ?', [TRILHA_SLUG])
  if (!trilha) throw new Error(`trilha ${TRILHA_SLUG} não existe`)

  // Módulo: sem abrir espaço, entra no fim (ordem 12). Se alguém já ocupar a
  // ordem 12 no futuro, o script avisa em vez de empurrar.
  const [moduloExistente] = await c.query('SELECT id FROM modulos WHERE slug = ?', [MODULO.slug])
  let moduloId = moduloExistente?.id
  if (!moduloId) {
    const [ocupado] = await c.query('SELECT slug FROM modulos WHERE ordem = ? AND slug <> ?', [MODULO.ordem, MODULO.slug])
    if (ocupado) throw new Error(`ordem ${MODULO.ordem} de módulos já é de ${ocupado.slug}; ajuste MODULO.ordem`)
    acao(`criar módulo "${MODULO.nome}" (${MODULO.nivel}, ${MODULO.cargaMin} min) na ordem ${MODULO.ordem}, publicado=${PUB}`)
    if (APLICAR) {
      await c.query(
        `INSERT INTO modulos (id, nome, slug, descricao, nivel, ordem, carga_horaria, carga_min, publicado, criado_em, atualizado_em)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [MODULO.nome, MODULO.slug, MODULO.descricao, MODULO.nivel, MODULO.ordem, MODULO.carga, MODULO.cargaMin, PUB]
      )
      moduloId = (await c.query('SELECT id FROM modulos WHERE slug = ?', [MODULO.slug]))[0].id
    }
  } else {
    acao(`módulo já existe, atualizando${PUBLICAR ? ' e publicando' : ''}`)
    if (APLICAR) {
      await c.query(
        `UPDATE modulos SET nome=?, descricao=?, nivel=?, carga_horaria=?, carga_min=?, publicado=IF(?, 1, publicado), atualizado_em=NOW() WHERE id=?`,
        [MODULO.nome, MODULO.descricao, MODULO.nivel, MODULO.carga, MODULO.cargaMin, PUB, moduloId])
    }
  }

  // Curso: última posição da trilha Programação, sem empurrar ninguém.
  const [cursoExistente] = await c.query('SELECT id FROM cursos WHERE slug = ?', [CURSO.slug])
  let cursoId = cursoExistente?.id
  if (!cursoId) {
    const [ocupado] = await c.query('SELECT slug FROM cursos WHERE trilha_id = ? AND ordem_na_trilha = ?', [trilha.id, CURSO.ordemNaTrilha])
    if (ocupado) throw new Error(`posição ${CURSO.ordemNaTrilha} da trilha ${TRILHA_SLUG} já é de ${ocupado.slug}; ajuste CURSO.ordemNaTrilha`)
    acao(`criar curso "${CURSO.titulo}" (${CURSO.nivel}, ${CURSO.cargaMin} min), curso ${CURSO.ordemNaTrilha} da trilha Programação e ${CURSO.ordemNoModulo} do módulo, publicado=${PUB}`)
    if (APLICAR) {
      await c.query(
        `INSERT INTO cursos (id, titulo, slug, descricao, categoria, nivel, autor_nome, publicado,
                             ordem, carga_horaria, carga_min, modulo_id, ordem_no_modulo, trilha_id, ordem_na_trilha,
                             created_at, updated_at, criado_em, atualizado_em)
         VALUES (UUID(), ?, ?, ?, ?, ?, 'André Gomes', ?, 40, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW(), NOW())`,
        [CURSO.titulo, CURSO.slug, CURSO.descricao, CURSO.categoria, CURSO.nivel, PUB, CURSO.carga, CURSO.cargaMin,
          moduloId ?? null, CURSO.ordemNoModulo, trilha.id, CURSO.ordemNaTrilha]
      )
      cursoId = (await c.query('SELECT id FROM cursos WHERE slug = ?', [CURSO.slug]))[0].id
    }
  } else {
    acao(`curso já existe, atualizando${PUBLICAR ? ' e publicando' : ''}`)
    if (APLICAR) {
      await c.query(
        `UPDATE cursos SET titulo=?, descricao=?, nivel=?, carga_horaria=?, carga_min=?, modulo_id=?, ordem_no_modulo=?, trilha_id=?, publicado=IF(?, 1, publicado), atualizado_em=NOW() WHERE id=?`,
        [CURSO.titulo, CURSO.descricao, CURSO.nivel, CURSO.carga, CURSO.cargaMin, moduloId, CURSO.ordemNoModulo, trilha.id, PUB, cursoId])
    }
  }

  // A aula única: o briefing. Concluir a aula é o que libera o envio.
  const [aulaJa] = APLICAR ? await c.query('SELECT id FROM aulas WHERE slug = ? AND curso_id = ?', [AULA.slug, cursoId]) : []
  acao(`aula 1 (briefing): ${AULA.titulo}${aulaJa ? ' (atualiza)' : ''}`)
  if (APLICAR) {
    if (aulaJa) {
      await c.query(
        `UPDATE aulas SET titulo=?, descricao=?, conteudo=?, ordem=1, duracao_estimada_min=?, publicado=IF(?, 1, publicado), updated_at=NOW() WHERE id=?`,
        [AULA.titulo, AULA.descricao, AULA.conteudo.trim(), AULA.min, PUB, aulaJa.id])
    } else {
      await c.query(
        `INSERT INTO aulas (id, curso_id, titulo, slug, descricao, ordem, duracao_estimada_min, publicado, conteudo, created_at, updated_at)
         VALUES (UUID(), ?, ?, ?, ?, 1, ?, ?, ?, NOW(), NOW())`,
        [cursoId, AULA.titulo, AULA.slug, AULA.descricao, AULA.min, PUB, AULA.conteudo.trim()]
      )
    }
  }

  // Desafio final: tipo 'final', ordem 99, vale_certificado = 1, sem aula.
  // É o que desafioFinalDoCurso() procura; é a tela de envio com link.
  acao(`desafio final (envio do link): ${DESAFIO_FINAL.titulo}`)
  if (APLICAR) {
    const [ja] = await c.query('SELECT id FROM curso_desafios WHERE curso_id = ? AND aula_id IS NULL AND modulo_id IS NULL', [cursoId])
    if (ja) {
      await c.query('UPDATE curso_desafios SET titulo=?, enunciado=?, tipo=\'final\', ordem=99, vale_certificado=1, instrucoes_envio=?, formatos_aceitos=? WHERE id=?',
        [DESAFIO_FINAL.titulo, DESAFIO_FINAL.enunciado.trim(), DESAFIO_FINAL.instrucoes, DESAFIO_FINAL.formatos, ja.id])
    } else {
      await c.query(
        `INSERT INTO curso_desafios (id, curso_id, titulo, enunciado, tipo, ordem, vale_certificado, instrucoes_envio, formatos_aceitos, created_at)
         VALUES (UUID(), ?, ?, ?, 'final', 99, 1, ?, ?, NOW())`,
        [cursoId, DESAFIO_FINAL.titulo, DESAFIO_FINAL.enunciado.trim(), DESAFIO_FINAL.instrucoes, DESAFIO_FINAL.formatos]
      )
    }
  }

  if (!APLICAR) console.log('\n(simulação: passe --aplicar para gravar como rascunho, --publicar para ligar)')
  else console.log(`\nmódulo, curso, 1 aula e 1 desafio final no lugar (publicado=${PUB})`)
} finally {
  c.release()
  await pool.end()
}
