/**
 * Conteúdo da Parte 1 — A página existe.
 *
 *   node scripts/conteudo-html-css-p1.mjs --aplicar
 *
 * Duas aulas novas e um bloco a mais em cada uma das quatro que já existiam.
 * O objetivo declarado era subir a carga, mas o que sobe a carga de verdade não
 * é texto a mais: é exercício dentro da aula e o erro comum explicado antes de
 * o aluno cair nele. Foi por aí que o acréscimo foi escrito.
 *
 * Nada aqui leva cor, fundo ou tamanho próprios — quem decide isso é o tema do
 * player. Foi o contrário disso que deixou quatro cursos ilegíveis.
 */
import { readFileSync } from 'node:fs'
import mariadb from '../node_modules/mariadb/promise.js'

const APLICAR = process.argv.includes('--aplicar')
const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, '')] })
)

/** Blocos acrescentados ao fim do conteúdo das aulas que já existem. */
const AMPLIACOES = {
  'html-fundamentos': `
<h2>O navegador é mais tolerante do que você imagina</h2>
<p>Escreva isto num arquivo e abra no navegador:</p>
<pre><code>&lt;h1&gt;Meu título
&lt;p&gt;Meu parágrafo</code></pre>
<p>Funciona. Nenhuma tag foi fechada, não há <code>&lt;html&gt;</code>, <code>&lt;head&gt;</code> nem
<code>&lt;body&gt;</code>, e mesmo assim a página aparece. O navegador conserta o que falta, porque
foi feito para nunca recusar uma página.</p>
<p>Isso é uma armadilha. O conserto que o navegador faz é um <em>chute</em>, e o chute dele nem
sempre é o seu. Um dia a página vai aparecer diferente do que você imaginou, você vai passar uma
hora mexendo no CSS, e o problema vai ser uma tag que ficou aberta três linhas acima.</p>
<p>Por isso a regra: <strong>feche tudo que abre</strong>, e escreva o esqueleto completo mesmo
quando parece desnecessário.</p>

<h2>O esqueleto, linha por linha</h2>
<pre><code>&lt;!DOCTYPE html&gt;
&lt;html lang="pt-BR"&gt;
&lt;head&gt;
  &lt;meta charset="UTF-8"&gt;
  &lt;meta name="viewport" content="width=device-width, initial-scale=1"&gt;
  &lt;title&gt;Página da Ana&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
  &lt;h1&gt;Olá&lt;/h1&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre>
<table>
  <tr><th>Linha</th><th>Para que serve</th><th>Se faltar</th></tr>
  <tr><td><code>&lt;!DOCTYPE html&gt;</code></td><td>Diz que é HTML moderno</td><td>O navegador entra em "modo antigo" e o layout muda sozinho</td></tr>
  <tr><td><code>lang="pt-BR"</code></td><td>Diz o idioma</td><td>O leitor de tela lê com sotaque errado; o tradutor se perde</td></tr>
  <tr><td><code>charset="UTF-8"</code></td><td>Diz como ler os caracteres</td><td>"João" vira "JoÃ£o"</td></tr>
  <tr><td><code>viewport</code></td><td>Diz que a página serve para celular</td><td>O celular finge ser um computador e tudo fica minúsculo</td></tr>
  <tr><td><code>&lt;title&gt;</code></td><td>Nome na aba e no Google</td><td>Aparece o nome do arquivo, que ninguém entende</td></tr>
</table>
<p>Esse bloco é sempre igual. Decore ou copie — o que não vale é escrever pela metade.</p>

<h2>Faça agora</h2>
<p>Crie <code>index.html</code> com o esqueleto acima. Troque o <code>&lt;title&gt;</code> pelo seu
nome e abra no navegador. Olhe a <strong>aba</strong>, não a página: é ali que o título aparece.
Depois apague a linha do <code>charset</code>, escreva "João" no corpo e recarregue. O que
acontece com o "ã" é exatamente o motivo de aquela linha existir.</p>
`,

  'elementos-html-essenciais': `
<h2>Negrito não é a mesma coisa que importante</h2>
<p>Existem duas formas de deixar um texto em negrito, e elas não significam a mesma coisa:</p>
<pre><code>&lt;b&gt;atenção&lt;/b&gt;        &lt;!-- grosso, e só --&gt;
&lt;strong&gt;atenção&lt;/strong&gt;  &lt;!-- importante, e por isso grosso --&gt;</code></pre>
<p>Na tela os dois ficam idênticos. A diferença aparece em quem não está vendo a tela: o leitor de
tela muda a entonação no <code>&lt;strong&gt;</code> e ignora o <code>&lt;b&gt;</code>. O mesmo
vale para <code>&lt;i&gt;</code> (inclinado) e <code>&lt;em&gt;</code> (enfatizado).</p>
<p>A regra que resolve: pergunte-se <strong>por que</strong> você quer o negrito. Se a resposta é
"porque isso é importante", use <code>&lt;strong&gt;</code>. Se é "porque fica bonito", o lugar
disso é o CSS, não o HTML.</p>

<h2>Os títulos são um sumário, não tamanhos de letra</h2>
<p>De <code>&lt;h1&gt;</code> a <code>&lt;h6&gt;</code>, os títulos formam o índice da página. O
leitor de tela consegue listar todos eles e pular direto para uma seção — como quem olha o sumário
de um livro.</p>
<pre><code>&lt;h1&gt;Ana Souza&lt;/h1&gt;
  &lt;h2&gt;Sobre mim&lt;/h2&gt;
  &lt;h2&gt;Projetos&lt;/h2&gt;
    &lt;h3&gt;Página da pizzaria&lt;/h3&gt;
    &lt;h3&gt;Calculadora&lt;/h3&gt;
  &lt;h2&gt;Contato&lt;/h2&gt;</code></pre>
<p>Duas regras saem daí:</p>
<ul>
  <li><strong>Um <code>&lt;h1&gt;</code> por página.</strong> É o assunto dela.</li>
  <li><strong>Não pule níveis.</strong> Depois de um <code>&lt;h2&gt;</code> vem
    <code>&lt;h3&gt;</code>, nunca <code>&lt;h4&gt;</code> porque o tamanho ficou melhor.</li>
</ul>
<p>Se o <code>&lt;h2&gt;</code> está grande demais para o seu gosto, o conserto é uma linha de CSS.
Trocar por <code>&lt;h4&gt;</code> conserta a aparência e quebra o sumário.</p>

<h2>O erro que todo mundo comete uma vez</h2>
<pre><code>&lt;p&gt;Primeira linha&lt;br&gt;
Segunda linha&lt;br&gt;
&lt;br&gt;
Terceira linha&lt;/p&gt;</code></pre>
<p>O <code>&lt;br&gt;</code> serve para quebra de linha <em>dentro</em> do mesmo parágrafo — o
endereço, o verso de um poema. Usar <code>&lt;br&gt;&lt;br&gt;</code> para separar parágrafos é
como pular linha com Enter no Word: parece igual e não é. São dois parágrafos, e o HTML tem uma
tag exatamente para isso.</p>

<h2>Faça agora</h2>
<p>Escreva três parágrafos sobre você, com um <code>&lt;h1&gt;</code> e dois
<code>&lt;h2&gt;</code>. Marque duas palavras com <code>&lt;strong&gt;</code> — e, para cada uma,
consiga explicar em voz alta por que ela é importante. Se não conseguir explicar, tire a marcação:
essa é a regra inteira.</p>
`,

  'listas-e-links': `
<h2>Link que não diz para onde vai</h2>
<p>Compare:</p>
<pre><code>Veja meu projeto &lt;a href="..."&gt;clicando aqui&lt;/a&gt;.
Veja &lt;a href="..."&gt;o site da pizzaria que eu fiz&lt;/a&gt;.</code></pre>
<p>Quem usa leitor de tela pode pedir a lista de todos os links da página. Na primeira versão,
essa lista é "clique aqui, clique aqui, clique aqui" — inútil. Na segunda, cada item diz para onde
leva.</p>
<p>A regra: <strong>o texto do link precisa fazer sentido lido sozinho</strong>, fora da frase.</p>

<h2>Caminho relativo e absoluto</h2>
<table>
  <tr><th>Escreve</th><th>Significa</th></tr>
  <tr><td><code>href="sobre.html"</code></td><td>arquivo na mesma pasta</td></tr>
  <tr><td><code>href="paginas/sobre.html"</code></td><td>dentro da pasta <code>paginas</code></td></tr>
  <tr><td><code>href="../index.html"</code></td><td>uma pasta acima</td></tr>
  <tr><td><code>href="https://…"</code></td><td>outro site, endereço completo</td></tr>
  <tr><td><code>href="#contato"</code></td><td>um ponto desta mesma página</td></tr>
</table>
<p>O último exige que exista um elemento com aquele <code>id</code>:</p>
<pre><code>&lt;a href="#contato"&gt;Fale comigo&lt;/a&gt;
...
&lt;h2 id="contato"&gt;Contato&lt;/h2&gt;</code></pre>

<h2>Abrir em nova aba: quando sim</h2>
<pre><code>&lt;a href="https://github.com" target="_blank" rel="noopener"&gt;Meu GitHub&lt;/a&gt;</code></pre>
<p>O <code>target="_blank"</code> abre em outra aba. Use só para <strong>links que saem do seu
site</strong> — dentro dele, abrir abas atrapalha quem esperava o botão "voltar" funcionar.</p>
<p>O <code>rel="noopener"</code> vai junto por segurança: sem ele, a página aberta ganha um
controle parcial sobre a sua. Custa dez caracteres.</p>

<h2>A lista certa para cada caso</h2>
<ul>
  <li><code>&lt;ul&gt;</code> — a ordem não importa: ingredientes, habilidades</li>
  <li><code>&lt;ol&gt;</code> — a ordem importa: passo 1, passo 2</li>
  <li><code>&lt;dl&gt;</code> — termo e definição: glossário, ficha técnica</li>
</ul>
<p>Escolher <code>&lt;ol&gt;</code> só porque você queria números na frente é o mesmo erro dos
títulos: aparência decidindo estrutura. Números você põe com CSS.</p>

<h2>Faça agora</h2>
<p>Monte um menu com três links para pontos da própria página (<code>#sobre</code>,
<code>#projetos</code>, <code>#contato</code>) e crie as seções correspondentes. Clique e veja a
página rolar sozinha. Depois releia os textos dos links: cada um diz para onde vai?</p>
`,

  'imagens-e-multimedia': `
<h2>O <code>alt</code> não é legenda</h2>
<p>O texto alternativo é o que substitui a imagem para quem não a vê — porque usa leitor de tela,
porque a internet falhou, ou porque o arquivo sumiu.</p>
<pre><code>&lt;img src="pizza.jpg" alt="imagem"&gt;                     &lt;!-- não diz nada --&gt;
&lt;img src="pizza.jpg" alt="pizza"&gt;                      &lt;!-- diz pouco --&gt;
&lt;img src="pizza.jpg" alt="Pizza margherita saindo do forno a lenha"&gt;</code></pre>
<p>A pergunta que resolve: <strong>se eu tivesse de descrever esta imagem por telefone, o que eu
diria?</strong> É isso que vai no <code>alt</code>.</p>
<p>Há um caso em que ele fica vazio de propósito: imagem puramente decorativa, que não acrescenta
informação. Aí se escreve <code>alt=""</code> — vazio, mas presente. Assim o leitor de tela pula a
imagem em silêncio, em vez de anunciar o nome do arquivo.</p>

<h2>Qual formato usar</h2>
<table>
  <tr><th>Formato</th><th>Bom para</th><th>Observação</th></tr>
  <tr><td>JPG</td><td>fotografia</td><td>arquivo pequeno, perde um pouco de qualidade</td></tr>
  <tr><td>PNG</td><td>logotipo, print, fundo transparente</td><td>arquivo maior</td></tr>
  <tr><td>WEBP</td><td>quase tudo, hoje</td><td>menor que os dois, aceito por todo navegador atual</td></tr>
  <tr><td>SVG</td><td>ícone, desenho, logotipo</td><td>não perde qualidade em nenhum tamanho</td></tr>
</table>

<h2>O erro que deixa a página lenta</h2>
<p>A foto que sai do celular tem 4000 pixels de largura e uns 5 MB. Se ela aparece num espaço de
400 pixels, o navegador baixa os 5 MB inteiros e encolhe na hora de mostrar. No 4G do aluno, isso
é a diferença entre a página abrir e a pessoa desistir.</p>
<p>Redimensione a imagem <strong>antes</strong> de subir. E declare o tamanho no HTML:</p>
<pre><code>&lt;img src="foto.jpg" alt="..." width="400" height="300"&gt;</code></pre>
<p>Com <code>width</code> e <code>height</code>, o navegador já reserva o espaço antes de a imagem
chegar. Sem eles, o texto pula quando ela carrega — aquele salto irritante que faz você clicar no
lugar errado.</p>

<h2>Faça agora</h2>
<p>Coloque duas imagens na sua página: uma que informa (com <code>alt</code> descritivo) e uma
decorativa (com <code>alt=""</code>). Depois quebre o nome do arquivo da primeira de propósito e
recarregue: o texto que aparece no lugar é o seu <code>alt</code>. Ele explica o que se perdeu?</p>
`,
}

/** As duas aulas que faltavam para a Parte 1 ficar completa. */
const NOVAS = [
  {
    slug: 'tabelas-quando-usar',
    titulo: 'Tabelas: quando usar e quando não',
    min: 6,
    ordem: 5,
    descricao: 'Dado em linha e coluna — e por que tabela não serve para fazer layout.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Montar uma tabela de dados correta</li>
  <li>Reconhecer quando o problema NÃO é de tabela</li>
  <li>Entender por que o cabeçalho da tabela importa para quem não a vê</li>
</ul>

<h2>Tabela serve para dado</h2>
<p>Tabela é para informação que só faz sentido cruzando linha com coluna: horário de aula, tabela
de preços, resultado de campeonato. Se você consegue ler a informação em voz alta como uma lista
sem perder nada, ela não é tabela.</p>
<pre><code>&lt;table&gt;
  &lt;caption&gt;Horário do 3º ano A&lt;/caption&gt;
  &lt;thead&gt;
    &lt;tr&gt;
      &lt;th&gt;Horário&lt;/th&gt;
      &lt;th&gt;Segunda&lt;/th&gt;
      &lt;th&gt;Terça&lt;/th&gt;
    &lt;/tr&gt;
  &lt;/thead&gt;
  &lt;tbody&gt;
    &lt;tr&gt;
      &lt;th&gt;7h00&lt;/th&gt;
      &lt;td&gt;Matemática&lt;/td&gt;
      &lt;td&gt;Português&lt;/td&gt;
    &lt;/tr&gt;
  &lt;/tbody&gt;
&lt;/table&gt;</code></pre>

<h2>As partes, e por que cada uma existe</h2>
<table>
  <tr><th>Tag</th><th>O que é</th></tr>
  <tr><td><code>&lt;caption&gt;</code></td><td>O título da tabela. É a primeira coisa que o leitor de tela anuncia</td></tr>
  <tr><td><code>&lt;thead&gt;</code></td><td>A faixa de cabeçalho</td></tr>
  <tr><td><code>&lt;tbody&gt;</code></td><td>Os dados</td></tr>
  <tr><td><code>&lt;tr&gt;</code></td><td>Uma linha</td></tr>
  <tr><td><code>&lt;th&gt;</code></td><td>Célula de <strong>cabeçalho</strong> — de coluna ou de linha</td></tr>
  <tr><td><code>&lt;td&gt;</code></td><td>Célula de dado</td></tr>
</table>
<p>Repare que o "7h00" está em <code>&lt;th&gt;</code>, não em <code>&lt;td&gt;</code>: ele é o
cabeçalho <em>daquela linha</em>. Isso é o que permite ao leitor de tela dizer "7h00, Segunda,
Matemática" em vez de só "Matemática" — a pessoa saber em que célula está é a função inteira do
cabeçalho.</p>

<h2>O erro histórico: layout com tabela</h2>
<p>Antes de o CSS existir de verdade, os sites eram montados com tabelas invisíveis: uma célula
para o menu, outra para o texto, outra para a barra lateral. Você ainda vai encontrar isso em
código antigo, e em e-mail marketing, onde sobrevive por outro motivo.</p>
<p>Para uma página hoje, isso está errado, e não por purismo:</p>
<ul>
  <li>O leitor de tela anuncia "tabela de 3 colunas" e tenta ler o menu como dado</li>
  <li>No celular a tabela não quebra em coluna única — a página nasce quebrada</li>
  <li>Mudar o layout vira remexer no HTML, quando deveria ser uma linha de CSS</li>
</ul>
<p>Layout é trabalho do CSS, e as Partes 3 e 4 são inteiras sobre isso. Tabela é para dado.</p>

<h2>Um teste que decide</h2>
<p>Antes de escrever <code>&lt;table&gt;</code>, faça a pergunta: <strong>essa informação tem
cabeçalho de coluna que significa alguma coisa?</strong></p>
<ul>
  <li>Preços por tamanho de pizza → sim, é tabela</li>
  <li>Menu do site com Início, Sobre, Contato → não, é lista de links</li>
  <li>Três cartões de projeto lado a lado → não, é layout</li>
</ul>

<h2>Faça agora</h2>
<p>Monte a tabela de preços de algo que você conhece — lanchonete, salão, oficina — com pelo menos
três linhas e três colunas, usando <code>&lt;caption&gt;</code>, <code>&lt;thead&gt;</code> e
<code>&lt;th&gt;</code> nos lugares certos.</p>
<p>Depois faça o teste: leia a tabela em voz alta para alguém <strong>sem mostrar a tela</strong>.
Se a pessoa entender os preços, seus cabeçalhos estão certos.</p>
`,
    desafio: {
      titulo: 'Uma tabela que se lê em voz alta',
      enunciado: `<p>Monte uma tabela de dados de verdade — horário de aulas, preços, ou o campeonato do seu time.</p>
<ul>
  <li><code>&lt;caption&gt;</code> dizendo do que é a tabela</li>
  <li><code>&lt;thead&gt;</code> e <code>&lt;tbody&gt;</code> separados</li>
  <li><code>&lt;th&gt;</code> nos cabeçalhos de coluna <strong>e</strong> nos de linha</li>
  <li>Pelo menos quatro linhas de dados</li>
</ul>
<p>O teste da entrega: leia a tabela em voz alta para alguém que não está vendo a tela. Se a pessoa
conseguir responder "quanto custa X na terça?", está certa.</p>`,
    },
  },
  {
    slug: 'a-primeira-pagina-inteira',
    titulo: 'A primeira página inteira',
    min: 8,
    ordem: 6,
    descricao: 'Prática guiada: juntar tudo da Parte 1 numa página que existe de verdade.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Montar uma página completa do zero, sem copiar de lugar nenhum</li>
  <li>Organizar os arquivos como um projeto de verdade</li>
  <li>Ler o próprio HTML procurando erro, antes de abrir o navegador</li>
</ul>

<h2>Antes de escrever, a pasta</h2>
<p>Projeto começa com organização. Crie assim:</p>
<pre><code>minha-pagina/
  index.html
  imagens/
    foto.jpg</code></pre>
<p>Três coisas que parecem detalhe e não são:</p>
<ul>
  <li><strong><code>index.html</code></strong> é o nome que todo servidor procura sozinho. Chame de
    <code>pagina.html</code> e o endereço precisará do nome do arquivo</li>
  <li><strong>Tudo em minúsculas, sem acento e sem espaço.</strong> No seu computador
    <code>Foto.JPG</code> e <code>foto.jpg</code> são o mesmo arquivo; no servidor, não são. É o
    erro que faz a imagem sumir só depois de publicar</li>
  <li><strong>Imagens em pasta própria.</strong> Com quinze arquivos soltos, você não acha nada</li>
</ul>

<h2>Agora, a página</h2>
<p>Escreva na ordem — esqueleto, depois conteúdo:</p>
<pre><code>&lt;!DOCTYPE html&gt;
&lt;html lang="pt-BR"&gt;
&lt;head&gt;
  &lt;meta charset="UTF-8"&gt;
  &lt;meta name="viewport" content="width=device-width, initial-scale=1"&gt;
  &lt;title&gt;Ana Souza — 3º ano EMTI&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;

  &lt;h1&gt;Ana Souza&lt;/h1&gt;
  &lt;p&gt;Estudante do 3º ano do EMTI na E.E. Dr. João Beraldo, em Carlos Chagas.&lt;/p&gt;

  &lt;h2 id="sobre"&gt;Sobre mim&lt;/h2&gt;
  &lt;p&gt;Comecei a estudar programação este ano, no curso de &lt;strong&gt;HTML e CSS&lt;/strong&gt;.
     Quero trabalhar com desenvolvimento web.&lt;/p&gt;

  &lt;h2 id="quero-aprender"&gt;O que quero aprender&lt;/h2&gt;
  &lt;ul&gt;
    &lt;li&gt;Fazer páginas que funcionem no celular&lt;/li&gt;
    &lt;li&gt;JavaScript&lt;/li&gt;
    &lt;li&gt;Publicar meus projetos na internet&lt;/li&gt;
  &lt;/ul&gt;

  &lt;h2 id="contato"&gt;Contato&lt;/h2&gt;
  &lt;p&gt;Me encontre no
     &lt;a href="https://github.com/anasouza" target="_blank" rel="noopener"&gt;meu GitHub&lt;/a&gt;.&lt;/p&gt;

&lt;/body&gt;
&lt;/html&gt;</code></pre>

<h2>A revisão que se faz sem o navegador</h2>
<p>Antes de abrir, leia o seu arquivo procurando estas cinco coisas. É mais rápido do que caçar o
problema depois, na tela:</p>
<table>
  <tr><th>Confira</th><th>Erro típico</th></tr>
  <tr><td>Toda tag aberta foi fechada?</td><td>um <code>&lt;/p&gt;</code> esquecido joga o resto da página para dentro do parágrafo</td></tr>
  <tr><td>Um <code>&lt;h1&gt;</code> só?</td><td>dois <code>&lt;h1&gt;</code> desmontam o sumário</td></tr>
  <tr><td>Toda imagem tem <code>alt</code>?</td><td><code>alt</code> ausente é diferente de <code>alt=""</code></td></tr>
  <tr><td>O texto de cada link diz para onde vai?</td><td>"clique aqui" não diz</td></tr>
  <tr><td>Os <code>id</code> dos links existem na página?</td><td><code>href="#contato"</code> sem <code>id="contato"</code> não leva a lugar nenhum</td></tr>
</table>

<h2>Só então abra</h2>
<p>Vai estar sem graça: fonte Times, tudo alinhado à esquerda, links azuis sublinhados. Esse é o
HTML sem CSS — e é assim que ele deve estar ao fim da Parte 1.</p>
<p>Aperte <strong>Ctrl+U</strong> para ver o código-fonte da própria página. É o mesmo arquivo que
você escreveu; qualquer pessoa consegue ver o de qualquer site. Aproveite: abra um site de que você
gosta e dê Ctrl+U. Vai reconhecer as tags que aprendeu — e vai ver muita coisa que ainda não
conhece, o que é exatamente o esperado.</p>

<h2>O que a Parte 2 vai fazer com isso</h2>
<p>Na próxima parte, você escreve um arquivo de CSS e liga nesta mesma página, <strong>sem tocar
no HTML</strong>. A página muda por completo, e nem uma tag sai do lugar.</p>
<p>É por isso que a Parte 1 foi só HTML. Estrutura primeiro, aparência depois — e é bem mais fácil
estilizar uma página bem estruturada do que consertar uma bagunça com CSS.</p>
`,
    desafio: {
      titulo: 'A revisão dos cinco pontos',
      enunciado: `<p>Termine sua página e faça a revisão da aula — <strong>antes</strong> de abrir no navegador.</p>
<ul>
  <li>Leia o arquivo inteiro conferindo os cinco pontos da tabela</li>
  <li>Anote quantos erros você achou lendo, sem o navegador</li>
  <li>Só então abra e veja se sobrou algum</li>
</ul>
<p>A conta que interessa é essa: quantos você pegou lendo e quantos escaparam. Quanto mais você
pega na leitura, menos tempo perde depois procurando por que a página está estranha.</p>`,
    },
  },
]

const url = new URL(env.DATABASE_URL)
const pool = mariadb.createPool({
  host: url.hostname, port: Number(url.port || 3306),
  user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
  database: url.pathname.slice(1), connectionLimit: 2, bigIntAsNumber: true,
})
const c = await pool.getConnection()

try {
  const [curso] = await c.query("SELECT id FROM cursos WHERE slug = 'html-css-1-a-pagina-existe'")
  if (!curso) throw new Error('Parte 1 não encontrada — rode montar-html-css.mjs antes')

  for (const [slug, bloco] of Object.entries(AMPLIACOES)) {
    const [aula] = await c.query('SELECT id, titulo, conteudo FROM aulas WHERE slug = ?', [slug])
    if (!aula) { console.log(`  ! aula não encontrada: ${slug}`); continue }
    // Idempotente: o bloco só entra se ainda não estiver lá.
    const marca = bloco.trim().split('\n')[0]
    const ja = aula.conteudo.includes(marca)
    console.log(`  ${ja ? '=' : APLICAR ? 'ok' : 'sim'}  ampliar "${aula.titulo}" (+${Math.round(bloco.length / 1000)}k)`)
    if (ja || !APLICAR) continue
    await c.query('UPDATE aulas SET conteudo = CONCAT(conteudo, ?), updated_at = NOW() WHERE id = ?',
      ['\n' + bloco.trim(), aula.id])
  }

  for (const nova of NOVAS) {
    const [ja] = await c.query('SELECT id FROM aulas WHERE slug = ?', [nova.slug])
    console.log(`  ${APLICAR ? 'ok' : 'sim'}  ${ja ? 'atualizar' : 'criar'} "${nova.titulo}"`)
    if (!APLICAR) continue

    if (ja) {
      await c.query('UPDATE aulas SET titulo=?, descricao=?, conteudo=?, ordem=?, duracao_estimada_min=?, curso_id=?, publicado=1, updated_at=NOW() WHERE id=?',
        [nova.titulo, nova.descricao, nova.conteudo.trim(), nova.ordem, nova.min, curso.id, ja.id])
    } else {
      await c.query(
        `INSERT INTO aulas (id, curso_id, titulo, slug, descricao, ordem, duracao_estimada_min, publicado, conteudo, created_at, updated_at)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, 1, ?, NOW(), NOW())`,
        [curso.id, nova.titulo, nova.slug, nova.descricao, nova.ordem, nova.min, nova.conteudo.trim()]
      )
    }
    const [aulaId] = await c.query('SELECT id FROM aulas WHERE slug = ?', [nova.slug])
    const [desafioJa] = await c.query('SELECT id FROM curso_desafios WHERE aula_id = ?', [aulaId.id])
    if (desafioJa) {
      await c.query('UPDATE curso_desafios SET titulo=?, enunciado=? WHERE id=?',
        [nova.desafio.titulo, nova.desafio.enunciado.trim(), desafioJa.id])
    } else {
      await c.query(
        `INSERT INTO curso_desafios (id, curso_id, aula_id, titulo, enunciado, tipo, ordem, vale_certificado, created_at)
         VALUES (UUID(), ?, ?, ?, ?, 'pratico', ?, 0, NOW())`,
        [curso.id, aulaId.id, nova.desafio.titulo, nova.desafio.enunciado.trim(), nova.ordem]
      )
    }
  }

  if (!APLICAR) console.log('\n(simulação — passe --aplicar para gravar)')
} finally {
  c.release()
  await pool.end()
}
