/**
 * Aba Projetos: cria (ou atualiza) o projeto final do 3° ano, "Projeto
 * Final: Portfólio Profissional", na pasta "3° Ano".
 *
 *   node scripts/criar-projeto-portfolio-3ano.mjs             simula
 *   node scripts/criar-projeto-portfolio-3ano.mjs --aplicar   grava como rascunho (publicado = 0)
 *   node scripts/criar-projeto-portfolio-3ano.mjs --publicar  grava e publica
 *
 * Fonte: Projeto_Final_3ano_Portfolio.docx do professor (28/09/2026),
 * convertido para PDF em /arquivos/projetos-turma/projeto-final-portfolio-3ano.pdf.
 * O cronograma do documento ja vem com as semanas datadas (23/09 a 25/11 e
 * dezembro de reserva); cada etapa aqui tem inicio e fim de 7 dias. O
 * professor muda as datas em Editar → Cronograma.
 *
 * O trabalho pede o link individual (portfolio) e o link do site em grupo
 * (Carlos Chagas): `pede_link_grupo = 1`.
 *
 * Idempotente: casa a pasta pela serie e o projeto pelo titulo. Rodar de
 * novo SOBRESCREVE resumo, briefing, cronograma e criterios com o texto
 * deste arquivo — nao rode depois de editar pela tela sem antes copiar o
 * texto para ca. Roda em /srv/escola/src no VPS.
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

const SERIE = '3° Ano'

/** Semana de 7 dias a partir da data que o documento cita. */
const semana = (inicio, titulo, foco, entrega, aviso = null) => {
  const d = new Date(inicio + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + 6)
  return { titulo, foco, entrega, inicio, fim: d.toISOString().slice(0, 10), aviso }
}

const CRONOGRAMA = [
  semana('2026-09-23', 'Semana de 23/09 · Apresentação do projeto',
    'Apresentar o projeto final inteiro para a turma. Dividir os 3 grupos do site de Carlos Chagas e entregar o tema de cada um. Explicar a estrutura do portfólio pessoal, as três abas e o rodapé.',
    'Grupos formados, tema de cada grupo definido, estrutura do portfólio entendida'),
  semana('2026-09-30', 'Semana de 30/09 · Primeira versão no ar',
    'Cada aluno cria o próprio projeto e publica uma primeira versão vazia na Vercel. Construir a página Home, com o hero de destaque.',
    'Portfólio publicado na Vercel com a Home e o hero; link enviado aqui'),
  semana('2026-10-07', 'Semana de 07/10 · Quem sou eu + pesquisa',
    'Construir a página Quem sou eu. Em paralelo, os grupos começam a pesquisa histórica: a base comum (história da cidade, relevância, exportação para a China) e o tema específico de cada grupo.',
    'Página Quem sou eu no ar; pesquisa do grupo iniciada',
    'Dia 12/10 é feriado: essa semana perde um dia de aula.'),
  semana('2026-10-14', 'Semana de 14/10 · Banco e login',
    'Criar o banco no Supabase e o login simples de cada aluno. Os grupos fecham a estrutura do site deles, decidindo que páginas e seções vão ter.',
    'Banco criado e login funcionando; estrutura do site do grupo definida'),
  semana('2026-10-21', 'Semana de 21/10 · Painel da aba Portfolio',
    'Construir o painel da aba Portfolio: cadastrar, listar e exibir os projetos. Os grupos começam a construir o site de Carlos Chagas de verdade.',
    'Painel cadastrando e listando projetos; site do grupo em construção'),
  semana('2026-10-28', 'Semana de 28/10 · Projetos prontos no painel',
    'Cada aluno cadastra, no próprio painel, os dois projetos já prontos: restaurante e site do 1º trimestre. Os grupos conectam o site deles ao Supabase e criam o login do grupo.',
    'Restaurante e site do 1º trimestre cadastrados; site do grupo ligado ao Supabase com login'),
  semana('2026-11-04', 'Semana de 04/11 · Rodapé e revisão',
    'Ajustar o rodapé do portfólio, com os links certos, e revisar tudo. Os grupos terminam de colocar o conteúdo, texto e imagem, no site.',
    'Rodapé completo; conteúdo do site do grupo terminado',
    'Dias 02/11 e 15/11 são feriados: essa e a semana seguinte perdem um dia cada.'),
  semana('2026-11-11', 'Semana de 11/11 · Publicação definitiva',
    'Testes finais e publicação definitiva do portfólio. Os grupos publicam o site de Carlos Chagas na Vercel e testam tudo no ar.',
    'Portfólio final publicado; site do grupo publicado na Vercel e testado'),
  semana('2026-11-18', 'Semana de 18/11 · Revisão geral',
    'Revisão geral dos dois projetos, corrigindo o que não estiver funcionando, conferindo que está tudo publicado de verdade.',
    'Os dois projetos revisados e funcionando no ar',
    'Dia 20/11 é feriado nacional: mais um dia perdido nessa semana.'),
  semana('2026-11-25', 'Semana de 25/11 · Apresentação final',
    'Cada grupo apresenta o site de Carlos Chagas, e cada aluno mostra o próprio portfólio publicado, já com os três projetos dentro dele.',
    'Apresentação feita'),
  { titulo: 'Dezembro · Reserva', foco: 'Sem conteúdo novo. Folga para o caso de alguma semana atrasar.', entrega: 'Tudo entregue', inicio: '2026-12-02', fim: '2026-12-18', aviso: 'As duas últimas semanas do ano são de prova final, conselho de classe e encerramento.' },
]

const CRITERIOS = [
  { titulo: 'Estrutura do portfólio', descricao: 'As três abas (Home, Quem sou eu, Portfolio) e o rodapé completo: nome com Instagram, escola com link para o site dela, ano.', peso: 2 },
  { titulo: 'Três projetos mínimos publicados', descricao: 'Restaurante com banco e dashboard, site da empresa de TI e site sobre Carlos Chagas, todos no ar e funcionando de verdade, cadastrados no painel do portfólio.', peso: 3 },
  { titulo: 'Pesquisa do site de Carlos Chagas', descricao: 'Precisão e profundidade: história da cidade, relevâncias, exportação de gado para a China e o tema do grupo.', peso: 2 },
  { titulo: 'Banco de dados e login no Supabase', descricao: 'Projetos do portfólio vêm do banco; login simples protege a edição do conteúdo do aluno e do grupo.', peso: 2 },
  { titulo: 'Publicação', descricao: 'Portfólio e site do grupo publicados na Vercel, abrindo no celular, sem página quebrada.', peso: 1 },
]

const PROJETO = {
  titulo: 'Projeto Final: Portfólio Profissional',
  resumo: 'Projeto final do 3º ano EMTI: seu portfólio profissional com os projetos práticos do ano (restaurante, empresa de TI e o site em grupo sobre Carlos Chagas). Apresentação em 25/11.',
  arquivo_url: '/arquivos/projetos-turma/projeto-final-portfolio-3ano.pdf',
  briefing: `
<h2>O portfólio pessoal</h2>
<p>Componente curricular: <strong>Programação Web e Banco de Dados</strong>. Cada aluno cria e publica o próprio site de portfólio, com um menu de <strong>três abas</strong> e um rodapé completo. É o lugar onde ficam, juntos e funcionando, os projetos que você construiu este ano.</p>
<h3>Home</h3>
<p>Um hero de destaque com o nome do aluno.</p>
<h3>Quem sou eu</h3>
<p>A trajetória do aluno dentro da escola.</p>
<h3>Portfolio</h3>
<p>Um painel conectado a um banco de dados, onde o aluno cadastra cada projeto (título, descrição e link). Os projetos cadastrados aparecem automaticamente nessa página, e clicar em um deles leva até o projeto.</p>
<h3>Rodapé</h3>
<ul>
  <li>Nome do aluno, com link para o Instagram dele.</li>
  <li>Nome da escola, com link para o site da escola.</li>
  <li>Ano em que o site foi feito.</li>
</ul>

<h2>Projetos mínimos exigidos no portfólio</h2>
<ol>
  <li><strong>Restaurante</strong> com banco de dados conectado e dashboard: aqui entra o Supabase de verdade.</li>
  <li><strong>Site da empresa de TI</strong>, feito no 1º trimestre.</li>
  <li><strong>Site sobre Carlos Chagas</strong>, projeto novo em grupo, detalhado abaixo.</li>
</ol>

<h2>Projeto em grupo: site sobre Carlos Chagas</h2>
<p>A turma se divide em <strong>3 grupos</strong>. Cada grupo assume um tema, mas todos precisam contar a história de Carlos Chagas (MG), as principais relevâncias da cidade, e falar sobre a exportação de gado para a China.</p>
<h3>Grupo 1 · Economia e Agropecuária</h3>
<ul>
  <li>Agropecuária e economia local.</li>
  <li>Qualidade da carne.</li>
  <li>Frigorífico e exportação: Carlos Chagas abrindo comércio com a China.</li>
</ul>
<p>Se o grupo usar o apelido "capital do boi", precisa deixar claro que é um capítulo do passado da cidade, e não como ela se identifica hoje.</p>
<h3>Grupo 2 · Turismo e Qualidade de Vida</h3>
<ul>
  <li>Turismo local: pedal da carne de sol, pedra da baleia, kalodão, entre outros pontos.</li>
  <li>Áreas de lazer gratuitas na cidade.</li>
  <li>O projeto Wifi para todos.</li>
</ul>
<h3>Grupo 3 · Cultura, Natureza e História</h3>
<ul>
  <li>Patrimônio histórico e cultural.</li>
  <li>A extinção da Brycon vermelha.</li>
  <li>O rio Mucuri e o rio Urucu.</li>
  <li>Os 80 anos da escola João Beraldo.</li>
</ul>

<h2>Requisitos técnicos, para todos os projetos</h2>
<ul>
  <li>Site publicado na <strong>Vercel</strong>.</li>
  <li>Banco de dados no <strong>Supabase</strong>.</li>
  <li><strong>Login simples</strong> no Supabase, para o aluno ou o grupo editar o próprio conteúdo.</li>
</ul>

<h2>Como o ano fecha</h2>
<p>O ano letivo termina em meados de dezembro. Descontadas as duas últimas semanas (prova final, conselho de classe e encerramento), sobram cerca de <strong>10 semanas úteis</strong>. Restaurante e site do 1º trimestre já estão prontos, então o cronograma acima foca só no portfólio e no site de Carlos Chagas, andando em paralelo. As datas estão na tabela do cronograma; feriados que tiram um dia de aula estão marcados nela.</p>

<h2>Como entregar</h2>
<p>Publicou a primeira versão? Cole o <strong>link do seu portfólio</strong> na Vercel no formulário logo abaixo, em <em>Meu envio</em>. Quando o site do grupo estiver no ar, cole o link dele no campo <em>Link do projeto em grupo</em>. O professor abre os links, marca cada critério, diz em que semana você está e deixa a devolutiva aqui mesmo. Atualize o link sempre que publicar uma versão nova.</p>
`.trim(),
}

const url = new URL(env.DATABASE_URL)
const pool = mariadb.createPool({
  host: url.hostname, port: Number(url.port || 3306), database: url.pathname.slice(1),
  user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
  connectionLimit: 2, charset: 'utf8mb4',
})

async function main() {
  const c = await pool.getConnection()
  try {
    console.log(APLICAR ? (PUBLICAR ? '>> aplicando e publicando' : '>> aplicando (rascunho)') : '>> simulação (nada será gravado)')

    const [pasta] = await c.query('SELECT id FROM projeto_pastas WHERE serie = ?', [SERIE])
    if (!pasta) throw new Error(`pasta "${SERIE}" não existe: rode criar-projeto-portfolio-digital-2ano.mjs antes (ele cria as duas pastas)`)

    const [criador] = await c.query(
      "SELECT id FROM profiles WHERE role IN ('admin','diretora','professor') AND aprovado = 1 ORDER BY FIELD(role,'admin','diretora','professor'), created_at LIMIT 1"
    )
    const criadoPor = criador?.id ?? null
    const cronograma = JSON.stringify(CRONOGRAMA)
    const criterios = JSON.stringify(CRITERIOS)

    const [trabalho] = await c.query('SELECT id, publicado FROM projeto_trabalhos WHERE pasta_id = ? AND titulo = ?', [pasta.id, PROJETO.titulo])
    if (trabalho) {
      console.log(`projeto "${PROJETO.titulo}" já existe (${trabalho.id}, publicado=${trabalho.publicado}): atualizar texto, cronograma (${CRONOGRAMA.length} etapas) e critérios (${CRITERIOS.length})`)
      if (APLICAR) {
        await c.query(
          'UPDATE projeto_trabalhos SET resumo = ?, briefing = ?, arquivo_url = ?, cronograma = ?, criterios = ?, pede_link_grupo = 1, publicado = ?, atualizado_em = NOW(3) WHERE id = ?',
          [PROJETO.resumo, PROJETO.briefing, PROJETO.arquivo_url, cronograma, criterios, PUBLICAR ? 1 : trabalho.publicado, trabalho.id]
        )
      }
    } else {
      console.log(`projeto "${PROJETO.titulo}" na pasta "${SERIE}": criar (${PROJETO.briefing.length} chars de briefing, ${CRONOGRAMA.length} etapas, ${CRITERIOS.length} critérios)`)
      if (APLICAR) {
        await c.query(
          'INSERT INTO projeto_trabalhos (id, pasta_id, titulo, resumo, briefing, arquivo_url, cronograma, criterios, pede_link_grupo, publicado, ordem, criado_por) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 1, ?)',
          [crypto.randomUUID(), pasta.id, PROJETO.titulo, PROJETO.resumo, PROJETO.briefing, PROJETO.arquivo_url, cronograma, criterios, PUBLICAR ? 1 : 0, criadoPor]
        )
      }
    }

    if (APLICAR) {
      const resumo = await c.query(
        'SELECT p.serie, COUNT(t.id) AS trabalhos, SUM(t.publicado) AS publicados FROM projeto_pastas p LEFT JOIN projeto_trabalhos t ON t.pasta_id = p.id GROUP BY p.id ORDER BY p.ordem'
      )
      for (const r of resumo) console.log(`  ${r.serie}: ${r.trabalhos} projeto(s), ${r.publicados ?? 0} publicado(s)`)
    }
  } finally {
    c.release()
    await pool.end()
  }
}

main().catch(e => { console.error(e); process.exit(1) })
