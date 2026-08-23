/**
 * Conteúdo das Partes 2 e 3 do módulo HTML e CSS.
 *
 *   node scripts/conteudo-html-css-p23.mjs --aplicar
 *
 * Mesmo padrão da Parte 1: objetivo, o conceito, o erro comum explicado ANTES
 * de o aluno cair nele, uma tabela de decisão e um "faça agora". O que sobe a
 * carga não é texto a mais — é prática dentro da aula.
 *
 * Sem cor, fundo ou tamanho próprios no HTML: quem decide isso é o tema.
 */
import { aplicar } from './lib-conteudo.mjs'

const AMPLIACOES = {
  'css-fundamentos': `
<h2>Três formas de escrever CSS, e só uma que se usa</h2>
<pre><code>&lt;!-- 1. no atributo: some no meio do HTML, não dá para reaproveitar --&gt;
&lt;p style="color: blue"&gt;texto&lt;/p&gt;

&lt;!-- 2. no &lt;head&gt;: serve para teste rápido, só vale nesta página --&gt;
&lt;style&gt; p { color: blue; } &lt;/style&gt;

&lt;!-- 3. arquivo separado: é assim que se faz --&gt;
&lt;link rel="stylesheet" href="style.css"&gt;</code></pre>
<p>A terceira ganha por um motivo prático: com dez páginas no site, você muda a cor em um arquivo
e as dez mudam. Nas outras duas, você muda em dez lugares — e esquece um.</p>

<h2>A cascata, em uma frase</h2>
<p>Quando duas regras brigam pelo mesmo elemento, o navegador decide em três perguntas, nesta
ordem:</p>
<ol>
  <li><strong>Qual é mais específica?</strong> <code>#menu p</code> ganha de <code>p</code></li>
  <li><strong>Se empatar, qual veio depois?</strong> a última linha do arquivo vence</li>
  <li><code>!important</code> atropela tudo — e por isso quase nunca deve ser usado</li>
</ol>
<p>O <code>!important</code> é a origem de uma das piores dores de CSS: você o usa para vencer uma
briga, e amanhã precisa de outro <code>!important</code> para vencer esse. Quando sentir vontade de
escrevê-lo, o problema costuma ser um seletor específico demais lá atrás.</p>

<h2>Faça agora</h2>
<p>Crie <code>style.css</code>, ligue na sua página da Parte 1 com <code>&lt;link&gt;</code> e
escreva uma regra só: <code>body { background: #f5f5f5; }</code>. Recarregue. Se o fundo não mudou,
o caminho do arquivo está errado — abra o console do navegador com F12 e veja o erro 404. Aprender
a ler esse erro vale mais do que a regra em si.</p>
`,

  'propriedades-essenciais': `
<h2>As unidades, e quando usar cada uma</h2>
<table>
  <tr><th>Unidade</th><th>É</th><th>Use para</th></tr>
  <tr><td><code>px</code></td><td>pixel fixo</td><td>borda, sombra, detalhe que não deve escalar</td></tr>
  <tr><td><code>rem</code></td><td>múltiplo do tamanho base do navegador</td><td>fonte, espaçamento — o padrão de hoje</td></tr>
  <tr><td><code>%</code></td><td>relativo ao elemento-pai</td><td>largura de coluna</td></tr>
  <tr><td><code>vw</code> / <code>vh</code></td><td>% da largura/altura da tela</td><td>seção que ocupa a tela inteira</td></tr>
</table>
<p>A escolha entre <code>px</code> e <code>rem</code> na fonte tem uma consequência concreta: quem
enxerga mal aumenta a fonte padrão do navegador. Texto em <code>rem</code> acompanha; texto em
<code>px</code> ignora e continua pequeno. É acessibilidade, não preferência.</p>

<h2>O atalho que economiza quatro linhas</h2>
<pre><code>/* longo */
margin-top: 10px;
margin-right: 20px;
margin-bottom: 10px;
margin-left: 20px;

/* curto: cima direita baixo esquerda */
margin: 10px 20px 10px 20px;

/* mais curto: vertical horizontal */
margin: 10px 20px;

/* todos os lados */
margin: 10px;</code></pre>
<p>Vale igual para <code>padding</code> e <code>border-radius</code>. A ordem é sempre a do
relógio, começando em cima.</p>

<h2>Faça agora</h2>
<p>Aumente a fonte padrão do seu navegador (Ctrl e "+" não vale — mude nas configurações, em
"tamanho da fonte"). Depois abra uma página sua com tamanhos em <code>px</code> e outra em
<code>rem</code>. A diferença que você vai ver é a razão de a recomendação existir.</p>
`,

  'box-model-e-layout': `
<h2>Por que a largura nunca é a largura</h2>
<p>Você escreve <code>width: 300px</code> e o elemento ocupa 340. Some o <code>padding</code> dos
dois lados e a borda: por padrão, o CSS soma tudo <em>por fora</em> da largura declarada.</p>
<pre><code>width: 300px; padding: 15px; border: 5px solid;
/* ocupa 300 + 15 + 15 + 5 + 5 = 340px */</code></pre>
<p>Isso confunde tanto que existe uma linha para desligar o comportamento, e praticamente todo
projeto do mundo a usa:</p>
<pre><code>* {
  box-sizing: border-box;
}</code></pre>
<p>Com ela, <code>width: 300px</code> passa a significar 300px <strong>no total</strong>, padding e
borda incluídos. Escreva no começo do seu CSS e esqueça o assunto.</p>

<h2>Margem que some, e margem que soma</h2>
<p>Dois parágrafos, um com <code>margin-bottom: 20px</code> e o outro com
<code>margin-top: 30px</code>. A distância entre eles não é 50 — é 30. Margens verticais vizinhas
<strong>colapsam</strong>: vale a maior, não a soma.</p>
<p>Isso vale só na vertical, e só entre elementos irmãos. Quando o espaçamento sair diferente do
que você somou, é quase sempre isto.</p>

<h2>Faça agora</h2>
<p>Monte três caixas com fundo, <code>padding</code> e borda. Abra o inspetor (F12), clique numa
delas e olhe o desenho do box model que o navegador mostra: conteúdo, padding, borda e margem em
cores diferentes. Agora acrescente <code>box-sizing: border-box</code> e veja os números mudarem.
Esse desenho é a ferramenta que resolve 80% dos problemas de espaçamento.</p>
`,

  'semantica-e-acessibilidade': `
<h2>A página desenhada só com as tags</h2>
<p>HTML semântico é usar a tag pelo que ela significa, não pela aparência. O ganho não é estético:</p>
<pre><code>&lt;body&gt;
  &lt;header&gt;   logotipo e menu       &lt;/header&gt;
  &lt;main&gt;
    &lt;article&gt;  o conteúdo principal &lt;/article&gt;
    &lt;aside&gt;    o que é complementar &lt;/aside&gt;
  &lt;/main&gt;
  &lt;footer&gt;   contato e créditos    &lt;/footer&gt;
&lt;/body&gt;</code></pre>
<p>Quem usa leitor de tela pode pular direto para o <code>&lt;main&gt;</code>, saltando o menu — em
toda página que visita. Com <code>&lt;div class="principal"&gt;</code> isso não existe: para o
leitor, uma div é uma caixa sem significado.</p>

<h2>Quando a div ainda serve</h2>
<p>Semântica não quer dizer nunca usar <code>&lt;div&gt;</code>. Ela é a escolha certa quando o
agrupamento existe <strong>só para o layout</strong> e não significa nada para quem lê:</p>
<pre><code>&lt;section&gt;
  &lt;h2&gt;Projetos&lt;/h2&gt;
  &lt;div class="grade"&gt;   &lt;!-- existe para o Grid, e só --&gt;
    &lt;article&gt;…&lt;/article&gt;
    &lt;article&gt;…&lt;/article&gt;
  &lt;/div&gt;
&lt;/section&gt;</code></pre>
<p>A pergunta que decide: <em>se eu lesse esta página em voz alta, esse agrupamento significaria
alguma coisa?</em> Se sim, tem tag própria. Se não, é div.</p>

<h2>Faça agora</h2>
<p>Instale a extensão de acessibilidade do seu navegador ou abra as ferramentas (F12 → Lighthouse →
Accessibility) e rode na sua página. Ela vai apontar em segundos coisas que você não veria: imagem
sem alt, contraste baixo, título fora de ordem. Corrija o que aparecer.</p>
`,

  'flexbox': `
<h2>Uma direção por vez</h2>
<p>Flexbox organiza em <strong>uma linha</strong> — horizontal ou vertical. Para as duas ao mesmo
tempo existe o Grid, que é a Parte 4. Escolher errado entre os dois é a origem de muito CSS
torturado.</p>
<pre><code>.barra {
  display: flex;
  justify-content: space-between;  /* ao longo da linha */
  align-items: center;             /* na transversal */
}</code></pre>
<p>A confusão clássica é entre os dois. A regra: <code>justify-content</code> trabalha na direção
da linha; <code>align-items</code>, na perpendicular. Se você trocar <code>flex-direction</code>
para <code>column</code>, os dois trocam de eixo junto.</p>

<h2>Os quatro casos que resolvem quase tudo</h2>
<table>
  <tr><th>Quero</th><th>Escrevo</th></tr>
  <tr><td>logo à esquerda, menu à direita</td><td><code>justify-content: space-between</code></td></tr>
  <tr><td>tudo centralizado, nos dois eixos</td><td><code>justify-content: center; align-items: center</code></td></tr>
  <tr><td>itens que quebram linha no celular</td><td><code>flex-wrap: wrap</code></td></tr>
  <tr><td>um item ocupa o espaço que sobra</td><td><code>flex: 1</code> naquele item</td></tr>
</table>

<h2>O espaçamento certo</h2>
<pre><code>/* ruim: margem no item, e sobra margem na ponta */
.item { margin-right: 16px; }

/* certo: o container distribui */
.barra { display: flex; gap: 16px; }</code></pre>
<p>O <code>gap</code> só coloca espaço <em>entre</em> os itens, nunca antes do primeiro nem depois
do último. Antes dele existir, isso exigia truque; hoje não há motivo para usar outra coisa.</p>

<h2>Faça agora</h2>
<p>Monte uma barra com seu nome à esquerda e três links à direita. Depois acrescente
<code>flex-wrap: wrap</code> e estreite a janela até os links descerem para a linha de baixo. Esse
comportamento — quebrar sozinho quando não cabe — é metade do que se chama de página responsiva.</p>
`,
}

const NOVAS = [
  // ---------------------------------------------------------- Parte 2
  {
    curso: 'html-css-2-a-pagina-ganha-cara',
    slug: 'cores-e-contraste',
    titulo: 'Cores e contraste',
    min: 6, ordem: 4,
    descricao: 'Escolher uma paleta e garantir que o texto se leia.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Escrever cor em CSS nos formatos usados hoje</li>
  <li>Montar uma paleta que não brigue consigo mesma</li>
  <li>Medir contraste em vez de confiar no olho</li>
</ul>

<h2>Os formatos</h2>
<pre><code>color: red;                      /* nome: 147 existem, úteis para teste */
color: #c0392b;                  /* hexadecimal: o mais comum */
color: rgb(192, 57, 43);         /* vermelho, verde, azul */
color: rgb(192 57 43 / 50%);     /* o mesmo, com 50% de opacidade */</code></pre>
<p>O hexadecimal é só uma forma compacta do RGB: <code>#c0392b</code> são os mesmos 192, 57 e 43,
escritos em base 16. Quando o código tem os pares repetidos, dá para abreviar —
<code>#ffffff</code> vira <code>#fff</code>.</p>

<h2>Três cores bastam</h2>
<p>Paleta de iniciante costuma ter oito cores e parecer bagunçada. A receita que funciona:</p>
<table>
  <tr><th>Papel</th><th>Onde entra</th></tr>
  <tr><td>Fundo</td><td>a página quase inteira — geralmente um tom bem claro ou bem escuro</td></tr>
  <tr><td>Texto</td><td>alto contraste com o fundo</td></tr>
  <tr><td>Destaque</td><td>botão, link, o que deve ser notado — e só isso</td></tr>
</table>
<p>A cor de destaque perde a função quando aparece em tudo. Se o botão, o título, a borda e o ícone
são todos da cor de destaque, nada se destaca.</p>

<h2>Contraste se mede</h2>
<p>Cinza-claro sobre branco parece elegante na sua tela e some na tela do celular no sol. Existe um
número para isso: a razão de contraste, que vai de 1 (invisível) a 21 (preto no branco).</p>
<table>
  <tr><th>Tipo de texto</th><th>Mínimo aceitável</th></tr>
  <tr><td>Texto normal</td><td>4,5 para 1</td></tr>
  <tr><td>Texto grande (24px ou mais)</td><td>3 para 1</td></tr>
</table>
<p>Para medir: abra as ferramentas do navegador (F12), clique no quadradinho de cor ao lado de
qualquer <code>color</code> e ele mostra a razão calculada. Sites como o WebAIM Contrast Checker
fazem o mesmo colando os dois códigos.</p>

<h2>O erro que quase todo site iniciante tem</h2>
<pre><code>/* parece suave, e é ilegível */
color: #999999;   /* sobre branco: 2,8 para 1 — reprovado */

/* o mesmo cinza, escurecido o suficiente */
color: #595959;   /* sobre branco: 7 para 1 — aprovado */</code></pre>
<p>Texto secundário pode ser mais claro que o principal, mas não pode sumir. Se você precisa
apertar os olhos na sua própria tela, quem tem dificuldade de visão não lê.</p>

<h2>Faça agora</h2>
<p>Escolha três cores para a sua página e escreva-as no topo do CSS como comentário, com o papel de
cada uma. Depois meça o contraste do texto contra o fundo na ferramenta do navegador. Se der menos
de 4,5, escureça o texto até passar — e repare que a página não fica feia por causa disso.</p>
`,
    desafio: {
      titulo: 'Sua paleta, medida',
      enunciado: `<p>Defina a paleta da sua página: fundo, texto e destaque. Três cores, no máximo.</p>
<ul>
  <li>Aplique no CSS, sem mexer no HTML</li>
  <li>Meça o contraste entre o texto e o fundo com a ferramenta do navegador</li>
  <li>Anote os números que você obteve num comentário no topo do arquivo</li>
  <li>Todo texto normal precisa passar de 4,5 para 1</li>
</ul>
<p>Depois abra a página no celular, do lado de fora, com sol. É o teste que nenhuma ferramenta
substitui.</p>`,
    },
  },
  {
    curso: 'html-css-2-a-pagina-ganha-cara',
    slug: 'tipografia-na-web',
    titulo: 'Tipografia: o texto que se lê',
    min: 6, ordem: 5,
    descricao: 'Fonte, tamanho, altura de linha e largura de coluna.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Escolher e carregar fontes</li>
  <li>Ajustar tamanho, altura de linha e largura para o texto ser lido sem cansaço</li>
  <li>Reconhecer os três erros que tornam um texto cansativo</li>
</ul>

<h2>A pilha de fontes</h2>
<pre><code>font-family: Georgia, 'Times New Roman', serif;</code></pre>
<p>O navegador tenta na ordem: se não tiver Georgia, usa Times; se não tiver nenhuma, usa a serifada
padrão. A última da lista é sempre uma família genérica — <code>serif</code>,
<code>sans-serif</code> ou <code>monospace</code> — porque essa nunca falta.</p>
<p>Para usar uma fonte que o computador de quem visita não tem, ela precisa ser baixada junto com a
página: é o que o Google Fonts faz com aquela linha de <code>&lt;link&gt;</code>. Cada fonte
adicional é um arquivo a mais para carregar — duas famílias bastam para quase qualquer página.</p>

<h2>Os três erros que cansam quem lê</h2>
<table>
  <tr><th>Erro</th><th>Conserto</th></tr>
  <tr><td>Linha atravessando a tela inteira</td><td><code>max-width: 65ch</code> no bloco de texto</td></tr>
  <tr><td>Linhas grudadas</td><td><code>line-height: 1.6</code> no corpo</td></tr>
  <tr><td>Fonte pequena demais</td><td><code>font-size: 1rem</code> como mínimo no texto corrido</td></tr>
</table>
<p>O <code>ch</code> é uma unidade que vale a largura do caractere "0" da fonte em uso. Então
<code>65ch</code> é literalmente "cerca de 65 caracteres por linha", que é a faixa em que o olho
acha a próxima linha sem se perder. Linha muito longa faz reler a mesma; muito curta força pular o
tempo todo.</p>

<h2>Hierarquia com poucas peças</h2>
<pre><code>body { font-size: 1rem;   line-height: 1.6; }
h1   { font-size: 2.5rem; line-height: 1.1; }
h2   { font-size: 1.75rem; }
small{ font-size: 0.875rem; }</code></pre>
<p>Repare que o título tem <code>line-height</code> menor. Texto grande precisa de menos espaço
entre linhas — a mesma altura que funciona no parágrafo faz o título parecer desmontado.</p>

<h2>Faça agora</h2>
<p>Aplique <code>max-width: 65ch</code> no seu texto e compare com o antes, lendo os dois em voz
alta. A diferença aparece rápido: com a linha longa, você perde o lugar; com a curta, não. Foi por
isso que jornal e livro sempre usaram colunas estreitas.</p>
`,
    desafio: {
      titulo: 'Texto que se lê sem cansar',
      enunciado: `<p>Ajuste a tipografia da sua página.</p>
<ul>
  <li>Uma fonte para títulos e outra para o texto — no máximo duas</li>
  <li><code>line-height</code> de 1.5 a 1.7 no corpo</li>
  <li><code>max-width</code> em torno de 65ch nos blocos de texto</li>
  <li>Hierarquia clara entre h1, h2 e parágrafo</li>
</ul>
<p>Teste: peça para alguém ler um parágrafo em voz alta na sua tela. Se a pessoa se perder de linha
ou aproximar o rosto, ainda falta ajuste.</p>`,
    },
  },
  {
    curso: 'html-css-2-a-pagina-ganha-cara',
    slug: 'organizando-o-css',
    titulo: 'Organizando o CSS',
    min: 5, ordem: 6,
    descricao: 'Variáveis, ordem das regras e como não se perder no próprio arquivo.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Guardar valores repetidos em variáveis</li>
  <li>Organizar o arquivo numa ordem que se acha</li>
  <li>Reconhecer repetição que vai dar problema depois</li>
</ul>

<h2>Variáveis: a cor num lugar só</h2>
<p>Se o vermelho da escola aparece em nove regras, mudar de tom é caçar nove linhas — e esquecer
uma. Variáveis resolvem:</p>
<pre><code>:root {
  --cor-fundo: #f7f4ef;
  --cor-texto: #1a1a1a;
  --cor-destaque: #c0392b;
  --espaco: 1rem;
}

body   { background: var(--cor-fundo); color: var(--cor-texto); }
a      { color: var(--cor-destaque); }
.botao { background: var(--cor-destaque); padding: var(--espaco); }</code></pre>
<p>O <code>:root</code> é o topo do documento — declarar ali faz a variável valer na página inteira.
Trocar o tom da marca passa a ser uma linha.</p>

<h2>A ordem que se acha</h2>
<p>Arquivo de CSS cresce rápido e vira sopa. Uma ordem que funciona:</p>
<ol>
  <li>Variáveis e reset (<code>* { box-sizing: border-box; margin: 0; }</code>)</li>
  <li>Elementos base: <code>body</code>, títulos, links, parágrafo</li>
  <li>Blocos, na ordem em que aparecem na página: cabeçalho, main, rodapé</li>
  <li>Media queries no fim</li>
</ol>
<p>E um comentário separando cada bloco. Custa cinco segundos e economiza minutos toda vez que você
volta ao arquivo.</p>

<h2>A repetição que denuncia</h2>
<pre><code>/* três regras quase iguais */
.card-projeto { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; }
.card-aula    { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; }
.card-contato { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; }

/* uma classe compartilhada, e as diferenças à parte */
.card         { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; }
.card-projeto { background: #fff; }</code></pre>
<p>No HTML: <code>class="card card-projeto"</code>. Um elemento pode ter várias classes, e é assim
que se combina o que é comum com o que é específico.</p>

<h2>Nomes que descrevem função, não aparência</h2>
<pre><code>.texto-vermelho  { color: #c0392b; }   /* e quando virar azul? */
.alerta          { color: #c0392b; }   /* continua fazendo sentido */</code></pre>
<p>Nome ligado à aparência envelhece na primeira mudança de cor — e aí você tem uma classe chamada
<code>texto-vermelho</code> que pinta de azul, o que é pior do que não ter nome nenhum.</p>

<h2>Faça agora</h2>
<p>Releia seu CSS procurando um valor que aparece três vezes ou mais — uma cor, um espaçamento, um
raio de borda. Transforme em variável. Depois mude o valor da variável e veja a página inteira
acompanhar.</p>
`,
    desafio: {
      titulo: 'Um CSS que você entende daqui a um mês',
      enunciado: `<p>Reorganize o CSS da sua página.</p>
<ul>
  <li>Variáveis no <code>:root</code> para as cores e para o espaçamento base</li>
  <li>As regras na ordem: variáveis, reset, elementos base, blocos, media queries</li>
  <li>Comentário separando cada bloco</li>
  <li>Nenhum valor de cor repetido fora das variáveis</li>
</ul>
<p>O teste: troque o valor de <code>--cor-destaque</code> e recarregue. Se a página inteira mudou
de acento com uma linha, está organizado.</p>`,
    },
  },

  // ---------------------------------------------------------- Parte 3
  {
    curso: 'html-css-3-estrutura-que-sustenta',
    slug: 'cabecalho-e-navegacao',
    titulo: 'Cabeçalho e navegação',
    min: 6, ordem: 3,
    descricao: 'O menu que toda página tem — feito do jeito certo.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Montar cabeçalho e menu com as tags certas</li>
  <li>Marcar em que página o visitante está</li>
  <li>Fazer o menu funcionar no celular sem JavaScript</li>
</ul>

<h2>Menu é uma lista de links</h2>
<p>Parece detalhe e não é:</p>
<pre><code>&lt;header&gt;
  &lt;a href="/" class="marca"&gt;Ana Souza&lt;/a&gt;
  &lt;nav aria-label="Principal"&gt;
    &lt;ul&gt;
      &lt;li&gt;&lt;a href="#sobre"&gt;Sobre&lt;/a&gt;&lt;/li&gt;
      &lt;li&gt;&lt;a href="#projetos"&gt;Projetos&lt;/a&gt;&lt;/li&gt;
      &lt;li&gt;&lt;a href="#contato"&gt;Contato&lt;/a&gt;&lt;/li&gt;
    &lt;/ul&gt;
  &lt;/nav&gt;
&lt;/header&gt;</code></pre>
<p>O <code>&lt;ul&gt;</code> faz o leitor de tela anunciar "lista com 3 itens" — a pessoa sabe o
tamanho do menu antes de percorrê-lo. O <code>&lt;nav&gt;</code> permite pular o menu inteiro. O
<code>aria-label</code> distingue este de outros <code>&lt;nav&gt;</code> da página, como o do
rodapé.</p>

<h2>Tirar os marcadores</h2>
<pre><code>nav ul {
  list-style: none;   /* sem bolinhas */
  margin: 0;
  padding: 0;
  display: flex;
  gap: 1.5rem;
}</code></pre>
<p>Repare que a lista continua sendo lista no HTML — o que muda é só a aparência. É exatamente a
separação que a Parte 1 preparou: significado no HTML, aparência no CSS.</p>

<h2>Dizer onde a pessoa está</h2>
<pre><code>&lt;a href="#sobre" aria-current="page"&gt;Sobre&lt;/a&gt;</code></pre>
<pre><code>nav a[aria-current="page"] {
  font-weight: bold;
  border-bottom: 2px solid var(--cor-destaque);
}</code></pre>
<p>O <code>aria-current</code> diz ao leitor de tela qual item é a página atual, e de quebra serve
de gancho para o CSS. Marcar só com cor não basta: quem não distingue cores não vê a marcação.</p>

<h2>No celular, sem JavaScript</h2>
<p>Menu de três ou quatro itens não precisa daquele botão de três riscos. Deixe-os quebrarem
linha:</p>
<pre><code>header {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;
  align-items: center;
}</code></pre>
<p>Em tela estreita o menu desce para a linha de baixo, inteiro e visível. O botão que abre e fecha
esconde os links atrás de um clique — só compensa quando são muitos.</p>

<h2>Faça agora</h2>
<p>Monte o cabeçalho e navegue por ele <strong>só com o teclado</strong>: Tab para avançar, Enter
para abrir. Confira duas coisas — a ordem em que o foco anda faz sentido, e dá para ver onde ele
está? Se o contorno some, alguém escreveu <code>outline: none</code> em algum lugar. Nunca faça
isso sem colocar outra marca de foco no lugar.</p>
`,
    desafio: {
      titulo: 'Cabeçalho navegável pelo teclado',
      enunciado: `<p>Monte o cabeçalho da sua página.</p>
<ul>
  <li><code>&lt;header&gt;</code> com marca à esquerda e <code>&lt;nav&gt;</code> à direita</li>
  <li>Menu como <code>&lt;ul&gt;</code>, com os marcadores removidos pelo CSS</li>
  <li><code>aria-current="page"</code> no item ativo, marcado por peso ou borda — não só por cor</li>
  <li>No celular, os itens quebram linha e continuam visíveis</li>
</ul>
<p>Entregue com este teste feito: percorra a página inteira usando só Tab, do primeiro ao último
elemento. Anote em que ponto você perdeu de vista onde estava o foco — e conserte.</p>`,
    },
  },
  {
    curso: 'html-css-3-estrutura-que-sustenta',
    slug: 'foco-e-teclado',
    titulo: 'Foco e teclado: quem não usa mouse',
    min: 5, ordem: 4,
    descricao: 'A parte da acessibilidade que se testa em dois minutos.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Entender o que é o foco e por que ele precisa ser visível</li>
  <li>Testar uma página inteira usando só o teclado</li>
  <li>Corrigir os três problemas mais comuns</li>
</ul>

<h2>Nem todo mundo usa mouse</h2>
<p>Usa teclado quem tem dificuldade motora, quem usa leitor de tela, quem está com o mouse
quebrado — e programador experiente, por velocidade. Para todos eles, o <strong>foco</strong> é o
cursor: o lugar onde o teclado vai agir.</p>
<p>O navegador desenha um contorno em volta do elemento focado. É feio? Às vezes. Some quando você
escreve isto:</p>
<pre><code>/* nunca faça isso sozinho */
*:focus { outline: none; }</code></pre>
<p>Essa linha aparece em muito tutorial antigo e é a causa mais comum de páginas impossíveis de
navegar por teclado: a pessoa aperta Tab e não faz ideia de onde está.</p>

<h2>Trocar, em vez de apagar</h2>
<pre><code>a:focus-visible,
button:focus-visible {
  outline: 3px solid var(--cor-destaque);
  outline-offset: 2px;
  border-radius: 2px;
}</code></pre>
<p>O <code>:focus-visible</code> resolve a queixa estética: ele aplica o contorno quando a pessoa
navega por <strong>teclado</strong>, e não quando clica com o mouse. Você fica com a aparência limpa
no clique e o contorno onde ele é necessário.</p>

<h2>O teste dos dois minutos</h2>
<ol>
  <li>Clique na barra de endereço e aperte Tab repetidamente</li>
  <li>Percorra a página inteira, do topo ao rodapé</li>
  <li>Anote toda vez que você <strong>não souber</strong> onde está o foco</li>
</ol>
<table>
  <tr><th>Sintoma</th><th>Causa</th></tr>
  <tr><td>O foco some em algum ponto</td><td><code>outline: none</code>, ou elemento escondido que ainda recebe foco</td></tr>
  <tr><td>A ordem pula de um canto ao outro</td><td>a ordem visual não bate com a do HTML — o CSS reposicionou</td></tr>
  <tr><td>Um botão nunca recebe foco</td><td>é uma <code>&lt;div&gt;</code> com clique, não um <code>&lt;button&gt;</code></td></tr>
</table>

<h2>O terceiro caso merece atenção</h2>
<pre><code>&lt;!-- parece botão, não é --&gt;
&lt;div class="botao" onclick="..."&gt;Enviar&lt;/div&gt;

&lt;!-- é botão --&gt;
&lt;button&gt;Enviar&lt;/button&gt;</code></pre>
<p>O <code>&lt;button&gt;</code> já vem com tudo: recebe foco, funciona com Enter e barra de espaço,
e o leitor de tela anuncia "botão". A div precisa de atributo, de código e de teste para chegar
perto — e quase nunca chega. Use a tag certa e ganhe de graça.</p>

<h2>Faça agora</h2>
<p>Faça o teste dos dois minutos na sua página e escreva o que encontrou. Depois faça o mesmo num
site que você usa todo dia. Você vai encontrar problemas lá também — e é isso que mostra que o
teste é útil, não excesso de zelo.</p>
`,
    desafio: {
      titulo: 'A página inteira sem mouse',
      enunciado: `<p>Percorra sua página usando <strong>somente o teclado</strong> e corrija o que aparecer.</p>
<ul>
  <li>Todo link e botão recebe foco, e dá para ver onde ele está</li>
  <li>A ordem do foco segue a ordem visual</li>
  <li>Nenhum <code>outline: none</code> sem substituto</li>
  <li>Nada de <code>&lt;div&gt;</code> fazendo papel de botão</li>
</ul>
<p>Entregue junto a lista do que você encontrou e corrigiu. Se não encontrou nada, refaça o teste —
é raríssimo passar de primeira.</p>`,
    },
  },
]

await aplicar({ AMPLIACOES, NOVAS })
