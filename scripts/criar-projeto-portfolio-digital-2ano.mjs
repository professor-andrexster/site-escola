/**
 * Aba Projetos: cria as pastas "2° Ano" e "3° Ano" e o projeto do 2° ano,
 * "Meu Portfólio Digital" (trabalho do 3º trimestre de 2026, MVP em 30/09).
 *
 *   node scripts/criar-projeto-portfolio-digital-2ano.mjs             simula
 *   node scripts/criar-projeto-portfolio-digital-2ano.mjs --aplicar   grava como rascunho (publicado = 0)
 *   node scripts/criar-projeto-portfolio-digital-2ano.mjs --publicar  grava e publica
 *
 * O briefing abaixo e a versao em HTML do PDF que o professor entregou
 * (Trabalho_Portfolio_2ano_3tri.pdf, 28/09/2026). O PDF completo fica em
 * /arquivos/projetos-turma/trabalho-portfolio-digital-2ano-3tri.pdf, que o
 * nginx serve de /var/www/escola/data/uploads/.
 *
 * Tabelas: scripts/sql/projetos-turma.sql. Idempotente: casa a pasta pela
 * serie e o projeto pelo titulo dentro da pasta; rodar duas vezes nao duplica.
 * Rodar de novo SOBRESCREVE resumo, briefing, cronograma e criterios com o
 * texto deste arquivo — nao rode depois de editar pela tela sem antes copiar
 * o texto para ca. O cronograma nasce sem datas (o PDF veio com ___/___):
 * o professor marca em Editar → Cronograma.
 * Roda em /srv/escola/src no VPS (tem node_modules/mariadb e o .env).
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

const PASTAS = ['2° Ano', '3° Ano']
const SERIE_DO_PROJETO = '2° Ano'

const CRONOGRAMA = [
  { titulo: 'MVP · primeira versão no ar', foco: 'Matriz de Eisenhower, contas no GitHub e na Vercel, repositório portfolio, Home com menu, hero e rodapé.', entrega: 'Site publicado na Vercel com menu, hero, cadeado e rodapé; link enviado aqui', inicio: null, fim: '2026-09-30', aviso: null },
  { titulo: 'Semana 01 · Planejamento e identidade', foco: 'Retorno do MVP e revisão da Matriz de Eisenhower. Briefing pessoal, mapa do site, wireframe da Home e identidade visual.', entrega: 'Matriz revisada, briefing, wireframe e identidade visual', inicio: null, fim: null, aviso: null },
  { titulo: 'Semana 02 · Estrutura de todas as páginas', foco: 'Criar todas as páginas com menu (logo, links, submenu Estudos, cadeado) e rodapé.', entrega: 'Todas as páginas criadas com menu e rodapé', inicio: null, fim: null, aviso: null },
  { titulo: 'Semana 03 · Home completa', foco: 'Hero e as 5 seções da Home.', entrega: 'Home com hero e 5 seções', inicio: null, fim: null, aviso: null },
  { titulo: 'Semana 04 · Quem sou eu e Estudos', foco: 'Página Quem sou eu e as três páginas de Estudos (SEO, GEO, Semântica).', entrega: 'Quem sou eu e Estudos prontos', inicio: null, fim: null, aviso: null },
  { titulo: 'Semana 05 · Banco de dados e captura de leads', foco: 'Projeto no Supabase, tabela leads, formulário de contato salvando no banco.', entrega: 'Formulário salvando leads no banco', inicio: null, fim: null, aviso: null },
  { titulo: 'Semana 06 · Portfólio conectado ao banco', foco: 'Tabela projetos e página Portfólio montando os cards a partir do banco.', entrega: 'Portfólio puxando projetos do banco', inicio: null, fim: null, aviso: null },
  { titulo: 'Semana 07 · Login e painel de leads', foco: 'Cadeado, login no Supabase, painel protegido com a aba Leads.', entrega: 'Login e aba Leads funcionando', inicio: null, fim: null, aviso: null },
  { titulo: 'Semana 08 · Painel de projetos', foco: 'Aba Projetos do painel: adicionar, editar e excluir.', entrega: 'Aba Projetos completa', inicio: null, fim: null, aviso: null },
  { titulo: 'Semana 09 · Qualidade: SEO, GEO e acessibilidade', foco: 'Metatags, dados estruturados, textos alternativos, relatório Lighthouse no próprio site.', entrega: 'Versão final com nota Lighthouse', inicio: null, fim: null, aviso: null },
  { titulo: 'Semana 10 · Apresentação', foco: 'Pitch de até 3 minutos com demonstração ao vivo. QR code do portfólio.', entrega: 'Apresentação feita', inicio: null, fim: null, aviso: null },
]

const CRITERIOS = [
  { titulo: 'Planejamento', descricao: 'Matriz de Eisenhower completa, briefing, mapa do site, wireframe e prazos cumpridos.', peso: 1 },
  { titulo: 'Layout e identidade', descricao: 'Visual coerente, menu e rodapé como pedido, site responsivo no celular.', peso: 1 },
  { titulo: 'Conteúdo', descricao: 'Hero, 5 seções da Home, Quem sou eu e as 3 páginas de Estudos com textos próprios.', peso: 1 },
  { titulo: 'Captura de leads', descricao: 'Formulário salva no banco, tem aceite de privacidade e dá retorno ao visitante.', peso: 1 },
  { titulo: 'Login e painel', descricao: 'Cadeado abre o login, painel protegido com abas Leads e Projetos funcionando.', peso: 1 },
  { titulo: 'Portfólio dinâmico', descricao: 'Projetos vêm do banco, os dois projetos do ano estão bem descritos.', peso: 1 },
  { titulo: 'SEO, GEO e acessibilidade', descricao: 'Metatags, dados estruturados, Lighthouse 90 ou mais, textos alternativos.', peso: 1 },
  { titulo: 'Apresentação', descricao: 'Pitch de até 3 minutos, clareza e demonstração ao vivo.', peso: 1 },
]

const PROJETO = {
  titulo: 'Meu Portfólio Digital',
  resumo: 'Trabalho do 3º trimestre: seu site profissional, com banco de dados, painel de gestão e os projetos do ano. MVP no ar em 30/09.',
  arquivo_url: '/arquivos/projetos-turma/trabalho-portfolio-digital-2ano-3tri.pdf',
  briefing: `
<h2>O desafio: bora construir a sua vitrine</h2>
<p>Durante este ano você estudou SEO, GEO e Semântica, criou o site de uma empresa e fez a landing page da carne de sol de Carlos Chagas. Agora chegou a hora de juntar tudo isso num lugar só: <strong>o seu portfólio</strong>.</p>
<p>Pense no portfólio como o seu cartão de visita na internet. Quando alguém quiser saber quem você é e o que você sabe fazer em TI, é esse link que você vai mandar. Por isso ele precisa ser bonito, funcionar no celular e, principalmente, ter a sua cara.</p>
<p>E não é só um site parado. Ele vai ter um <strong>banco de dados de verdade</strong>: quem preencher o formulário de contato vira um lead salvo no banco, e você vai ter um <strong>painel secreto</strong>, aberto pelo cadeado do menu, para ver esses contatos e cadastrar novos projetos sem mexer no código.</p>
<ul>
  <li><strong>O site:</strong> 7 páginas públicas com menu, rodapé e a sua identidade visual.</li>
  <li><strong>O banco:</strong> leads do formulário e projetos do portfólio guardados no Supabase.</li>
  <li><strong>O painel:</strong> área com login onde você gerencia Leads e Projetos.</li>
</ul>
<p><strong>Mapa do site:</strong> Logo → Home · Quem sou eu · Estudos: SEO · GEO · Semântica · Portfólio · Contato · Cadeado → Login → Painel.</p>
<blockquote><p><strong>Regra de ouro:</strong> todo texto do site é seu. Pode pesquisar, pode usar IA para tirar dúvida, mas o texto final precisa ser escrito com as suas palavras. O professor vai perguntar sobre ele na apresentação.</p></blockquote>

<h2>O que o site precisa ter</h2>
<h3>Menu e rodapé (em todas as páginas)</h3>
<ul>
  <li><strong>Menu:</strong> sua logo à esquerda (clicou, volta para a Home); links Quem sou eu, Estudos, Portfólio e Contato; Estudos abre um submenu com SEO, GEO e Semântica; no canto direito, um ícone de cadeado que leva ao login.</li>
  <li><strong>Rodapé:</strong> texto "© 2026 · Feito por @seunome". Clicou no @seunome, a página sobe até o menu (dica: <code>id="menu"</code> no header e o link aponta para <code>#menu</code>).</li>
</ul>
<h3>Home</h3>
<p><strong>Hero:</strong> a primeira coisa que aparece. Nele você fala da sua principal habilidade como profissional de TI. Não precisa ser perfeito, precisa ser verdadeiro. Exemplos: "Crio sites rápidos que aparecem no Google", "Transformo ideias em páginas que vendem", "Organizo dados para ajudar pequenos negócios". Título curto, uma frase de apoio e dois botões: <em>Ver portfólio</em> e <em>Fale comigo</em>.</p>
<p>Depois do hero vêm 5 seções:</p>
<ol>
  <li><strong>Minha escola.</strong> Onde você estuda, como é estudar no EMTI da Escola Estadual Dr. João Beraldo, o que a escola tem de especial e o que ela mudou em você.</li>
  <li><strong>O que estudamos.</strong> As matérias do projeto (Gestão de tempo, HTML / CSS, Programação web e Lógica de programação), como elas se ligam à BNCC (cultura digital, pensamento computacional, projeto de vida) e o que é o projeto EMTI.</li>
  <li><strong>TI para Carlos Chagas.</strong> Que projetos de tecnologia a nossa cidade poderia ter? Apresente de 3 a 5 ideias explicando o problema e a solução. Ideias: catálogo online dos produtores locais (carne de sol, queijo, doces), QR code na embalagem contando a origem do produto, mapa de prestadores de serviço, agendamento online na unidade de saúde, guia turístico digital da região, sistema de empréstimo da biblioteca escolar.</li>
  <li><strong>Livre.</strong> Você escolhe.</li>
  <li><strong>Livre.</strong> Você escolhe. Sugestões: minhas habilidades e ferramentas (HTML, CSS, JS, Git...), linha do tempo do meu ano em TI, meu próximo passo (curso, faculdade ou profissão), depoimentos de colegas ou clientes, certificados e cursos que fiz, o que aprendi errando.</li>
</ol>
<h3>Quem sou eu</h3>
<p>Uma página para as pessoas te conhecerem: quem você é, do que gosta, a sua trajetória até aqui e as suas habilidades. Pode ter foto ou um avatar. <strong>Cuidado com a sua privacidade:</strong> nada de endereço de casa, telefone pessoal ou documentos.</p>
<h3>Estudos: SEO, GEO e Semântica</h3>
<p>Três páginas, uma para cada tema. Em cada uma responda: o que é, para que serve, um exemplo e <strong>como eu apliquei isso no meu próprio portfólio</strong>. Essa última parte é a mais importante, porque prova que você sabe usar, e não só explicar.</p>
<h3>Portfólio</h3>
<p>Aqui aparecem os projetos que você fez este ano. Eles <strong>não ficam escritos no HTML</strong>: vêm do banco de dados. Quando você cadastrar um projeto novo no painel, ele aparece sozinho no site.</p>
<ul>
  <li><strong>Projeto 1 · Site da empresa.</strong> O site que você já entregou. Conte qual era a empresa, o que o site resolve e coloque o link.</li>
  <li><strong>Projeto 2 · Carne de sol de Carlos Chagas.</strong> A landing page publicada na Vercel sobre o conceito da nossa carne de sol, ajudando a criar uma identidade que um dia pode levar Carlos Chagas a ser reconhecida como Indicação Geográfica.</li>
</ul>
<h3>Contato com captura de leads</h3>
<p>Um formulário que salva quem entrou em contato. Cada envio vira uma linha na tabela <code>leads</code>.</p>
<ul>
  <li><strong>Campos:</strong> Nome, Email, WhatsApp (opcional), Assunto (orçamento, parceria, só um oi), Mensagem.</li>
  <li><strong>Não esqueça:</strong> caixinha de aceite "Concordo em ser contatado e com o uso dos meus dados" (LGPD); mensagem de sucesso depois de enviar; campo escondido anti robô.</li>
</ul>
<h3>Cadeado, login e painel</h3>
<p>O cadeado do menu leva para a página de login. Só você tem usuário e senha. Depois de entrar, o painel tem duas abas:</p>
<ul>
  <li><strong>Leads:</strong> lista de todo mundo que mandou mensagem, do mais novo para o mais antigo. Dá para marcar como respondido e responder pelo WhatsApp ou email.</li>
  <li><strong>Projetos:</strong> adicionar, editar e excluir os projetos que aparecem na página Portfólio.</li>
</ul>
<p>Se alguém tentar abrir o painel sem estar logado, o site manda de volta para o login.</p>

<h2>Primeira missão: Matriz de Eisenhower</h2>
<p>Antes de escrever qualquer linha de código, você vai organizar o projeto. Quem planeja bem não passa o trimestre apagando incêndio. A Matriz separa as tarefas em quatro caixas, cruzando duas perguntas: <em>isso é urgente?</em> e <em>isso é importante?</em></p>
<ol>
  <li>Liste TODAS as tarefas do projeto, das grandes às pequenas.</li>
  <li>Para cada tarefa, pergunte: se eu não fizer isso logo, o projeto trava? Isso vale nota ou faz diferença no resultado?</li>
  <li>Coloque cada tarefa no quadrante certo: <strong>1 · Fazer agora</strong> (urgente e importante), <strong>2 · Agendar</strong> (importante, não urgente), <strong>3 · Pedir ajuda</strong> (urgente, não importante), <strong>4 · Eliminar</strong> (nem urgente nem importante).</li>
  <li>Use o quadrante 1 para montar o que você faz nesta semana e o quadrante 2 para as próximas.</li>
</ol>
<p>A matriz em branco para preencher está no PDF. <strong>Entrega: junto com o MVP, em 30/09.</strong></p>

<h2>Ferramentas</h2>
<p>Gratuitas, usadas no mercado de verdade e sem precisar instalar servidor no computador da escola: <strong>HTML, CSS e JavaScript</strong> (sem framework: você entende cada linha), <strong>VS Code</strong>, <strong>GitHub</strong> (código e histórico), <strong>Vercel</strong> (site no ar, atualiza sozinho a cada push), <strong>Supabase</strong> (banco Postgres e login), <strong>Lighthouse</strong> (nota de desempenho, acessibilidade e SEO).</p>
<h3>Como colocar o seu site no ar</h3>
<ol>
  <li>Crie o repositório <code>portfolio</code> no GitHub e envie os seus arquivos.</li>
  <li>Entre na Vercel com a sua conta do GitHub, clique em <em>Add New Project</em>, escolha o repositório e clique em <em>Deploy</em>. Depois troque o endereço para algo como <code>seunome.vercel.app</code> em Settings, Domains.</li>
  <li>Crie o seu projeto no Supabase (região São Paulo) e cole a URL e a chave anon no arquivo <code>js/banco.js</code>.</li>
  <li>A partir daí é simples: salvou, fez commit e push, o site atualiza sozinho.</li>
</ol>
<p><strong>Atenção:</strong> o Supabase gratuito dorme depois de 7 dias sem uso. Se os projetos sumirem, reative no painel dele.</p>

<h2>Cronograma: MVP e as 10 semanas</h2>
<p>A primeira entrega é o <strong>MVP em 30/09</strong>, a versão mínima do seu site, que já precisa estar no ar:</p>
<ul>
  <li>Matriz de Eisenhower: listar todas as tarefas do projeto e distribuir nos 4 quadrantes.</li>
  <li>Criar as contas no GitHub e na Vercel e o repositório <code>portfolio</code>.</li>
  <li>Página inicial com menu (logo, links e cadeado), hero com a principal habilidade e rodapé com @nome.</li>
  <li>Publicar na Vercel e <strong>entregar o link do site no ar aqui, nesta página</strong>.</li>
</ul>
<p>Depois vêm 10 semanas com 7 aulas de 50 minutos cada. As semanas e as datas estão na tabela do cronograma, no alto desta página; o professor preenche as datas conforme o trimestre anda.</p>
<p><strong>Dicas de quem já passou por isso:</strong> faça commit no fim de toda aula (computador trava, GitHub não esquece); publicou, abriu no celular, sempre; não deixe o banco de dados para a última semana; travou por mais de 15 minutos? Pergunte, isso é quadrante 3; feito é melhor que perfeito.</p>

<h2>Checklist do que vou entregar</h2>
<ul>
  <li>MVP no ar em 30/09</li>
  <li>Matriz de Eisenhower preenchida</li>
  <li>Briefing pessoal, mapa do site e wireframe da Home</li>
  <li>Link do site publicado na Vercel</li>
  <li>Link do repositório no GitHub com README</li>
  <li>Menu com logo, submenu Estudos e cadeado</li>
  <li>Rodapé com © e @nome levando ao menu</li>
  <li>Home com hero e as 5 seções</li>
  <li>Páginas Quem sou eu, SEO, GEO e Semântica</li>
  <li>Portfólio com os 2 projetos vindo do banco</li>
  <li>Formulário de contato salvando leads com aceite de privacidade</li>
  <li>Login pelo cadeado e painel com abas Leads e Projetos</li>
  <li>Print do relatório Lighthouse</li>
  <li>QR code do portfólio</li>
  <li>Pitch de até 3 minutos</li>
</ul>

<h2>Como entregar</h2>
<p>Publicou o MVP? Cole o <strong>link do site na Vercel</strong> e o <strong>link do repositório no GitHub</strong> no formulário logo abaixo, em <em>Meu envio</em>. O professor abre o seu site, registra o andamento e deixa a devolutiva aqui mesmo. Você pode atualizar o link a cada semana, conforme o projeto cresce.</p>
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

    // Quem criou: o primeiro professor/gestor da casa, para a coluna criado_por.
    const [criador] = await c.query(
      "SELECT id FROM profiles WHERE role IN ('admin','diretora','professor') AND aprovado = 1 ORDER BY FIELD(role,'admin','diretora','professor'), created_at LIMIT 1"
    )
    const criadoPor = criador?.id ?? null

    const pastaId = {}
    for (const serie of PASTAS) {
      const [existente] = await c.query('SELECT id FROM projeto_pastas WHERE serie = ?', [serie])
      if (existente) {
        pastaId[serie] = existente.id
        console.log(`pasta "${serie}" já existe (${existente.id})`)
        continue
      }
      console.log(`pasta "${serie}": criar`)
      if (APLICAR) {
        const id = crypto.randomUUID()
        await c.query('INSERT INTO projeto_pastas (id, serie, ordem, criado_por) VALUES (?, ?, ?, ?)', [id, serie, PASTAS.indexOf(serie) + 1, criadoPor])
        pastaId[serie] = id
      }
    }

    const pasta = pastaId[SERIE_DO_PROJETO]
    if (!pasta && APLICAR) throw new Error('pasta do projeto não resolvida')

    const [trabalho] = pasta
      ? await c.query('SELECT id, publicado FROM projeto_trabalhos WHERE pasta_id = ? AND titulo = ?', [pasta, PROJETO.titulo])
      : [null]

    if (trabalho) {
      console.log(`projeto "${PROJETO.titulo}" já existe (${trabalho.id}, publicado=${trabalho.publicado}): atualizar texto, cronograma (${CRONOGRAMA.length} etapas) e critérios (${CRITERIOS.length})`)
      if (APLICAR) {
        await c.query(
          'UPDATE projeto_trabalhos SET resumo = ?, briefing = ?, arquivo_url = ?, cronograma = ?, criterios = ?, pede_link_grupo = 0, publicado = ?, atualizado_em = NOW(3) WHERE id = ?',
          [PROJETO.resumo, PROJETO.briefing, PROJETO.arquivo_url, JSON.stringify(CRONOGRAMA), JSON.stringify(CRITERIOS), PUBLICAR ? 1 : trabalho.publicado, trabalho.id]
        )
      }
    } else {
      console.log(`projeto "${PROJETO.titulo}" na pasta "${SERIE_DO_PROJETO}": criar (${PROJETO.briefing.length} chars de briefing)`)
      if (APLICAR) {
        await c.query(
          'INSERT INTO projeto_trabalhos (id, pasta_id, titulo, resumo, briefing, arquivo_url, cronograma, criterios, pede_link_grupo, publicado, ordem, criado_por) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 1, ?)',
          [crypto.randomUUID(), pasta, PROJETO.titulo, PROJETO.resumo, PROJETO.briefing, PROJETO.arquivo_url, JSON.stringify(CRONOGRAMA), JSON.stringify(CRITERIOS), PUBLICAR ? 1 : 0, criadoPor]
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
