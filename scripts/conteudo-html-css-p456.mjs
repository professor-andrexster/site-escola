/**
 * Conteúdo das Partes 4, 5 e 6 do módulo HTML e CSS.
 *
 *   node scripts/conteudo-html-css-p456.mjs --aplicar
 */
import { aplicar } from './lib-conteudo.mjs'

const AMPLIACOES = {
  'css-grid': `
<h2>A linha que resolve grade sem media query</h2>
<pre><code>.grade {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}</code></pre>
<p>Lida em português: "faça quantas colunas couberem; cada uma com no mínimo 280 pixels e dividindo
igualmente o que sobrar". Em tela larga dá três ou quatro colunas; no celular, uma. Sem escrever
nenhuma media query.</p>
<p>As duas peças:</p>
<ul>
  <li><code>auto-fit</code> — o navegador decide quantas colunas cabem</li>
  <li><code>minmax(280px, 1fr)</code> — o piso e o teto de cada uma</li>
</ul>

<h2>Grid ou Flexbox?</h2>
<table>
  <tr><th>Situação</th><th>Use</th></tr>
  <tr><td>Uma fileira de botões, um menu</td><td>Flexbox</td></tr>
  <tr><td>Grade de cartões</td><td>Grid</td></tr>
  <tr><td>Layout da página inteira: cabeçalho, lateral, conteúdo, rodapé</td><td>Grid</td></tr>
  <tr><td>Centralizar uma coisa só</td><td>qualquer um dos dois</td></tr>
</table>
<p>A regra curta: <strong>uma direção, Flexbox; duas direções, Grid</strong>. E eles se combinam —
Grid para o esqueleto da página, Flexbox dentro de cada peça.</p>

<h2>Faça agora</h2>
<p>Monte uma grade de seis cartões com a linha acima. Agora arraste a janela de larga a estreita
devagar e conte: em quantas larguras diferentes o número de colunas muda? Cada uma dessas mudanças
seria uma media query escrita na mão.</p>
`,

  'responsividade': `
<h2>Mobile-first não é estilo, é ordem</h2>
<p>Escrever primeiro o layout do celular e depois ampliar dá menos trabalho do que o contrário:</p>
<pre><code>/* base: o celular, sem media query nenhuma */
.grade { display: grid; gap: 1rem; }

/* a partir de 700px, duas colunas */
@media (min-width: 700px) {
  .grade { grid-template-columns: 1fr 1fr; }
}</code></pre>
<p>Fazendo ao contrário — desktop primeiro, com <code>max-width</code> — você acaba desfazendo no
celular tudo que fez no desktop, e o CSS fica cheio de regra que cancela regra.</p>

<h2>Onde colocar o corte</h2>
<p>Não existe "o tamanho do iPhone". Aparelho novo sai todo mês, e a página precisa funcionar em
todos. O ponto de corte se descobre assim:</p>
<ol>
  <li>Abra a página e estreite a janela devagar</li>
  <li>Observe onde o layout <strong>começa a ficar ruim</strong> — texto espremido, imagem
    deformada, colunas finas demais</li>
  <li>É ali que entra a media query</li>
</ol>
<p>O corte sai do seu conteúdo, não de uma lista de tamanhos de aparelho decorada.</p>

<h2>O teste que não se pula</h2>
<pre><code>&lt;meta name="viewport" content="width=device-width, initial-scale=1"&gt;</code></pre>
<p>Sem essa linha no <code>&lt;head&gt;</code>, o celular finge ter 980 pixels de largura e mostra a
página inteira reduzida — aquele site em que tudo é minúsculo e você tem de dar zoom. Nenhuma media
query funciona sem ela.</p>

<h2>Faça agora</h2>
<p>Abra sua página no celular de verdade, não só na janela estreita do computador. Confira três
coisas: dá para ler sem zoom, não há rolagem lateral, e os links são grandes o bastante para acertar
com o dedo. O terceiro é o que mais falha — o alvo mínimo confortável tem cerca de 44 pixels de
lado.</p>
`,

  'formularios-html': `
<h2>O rótulo é obrigatório</h2>
<pre><code>&lt;!-- errado: o "Nome" é só um texto solto ao lado --&gt;
&lt;p&gt;Nome&lt;/p&gt;
&lt;input type="text"&gt;

&lt;!-- certo --&gt;
&lt;label for="nome"&gt;Nome&lt;/label&gt;
&lt;input type="text" id="nome" name="nome"&gt;</code></pre>
<p>O <code>for</code> do rótulo aponta para o <code>id</code> do campo. Isso faz duas coisas: clicar
no texto põe o cursor no campo, e o leitor de tela anuncia "Nome, caixa de texto" em vez de só
"caixa de texto".</p>
<p>Teste rápido em qualquer formulário: clique no <strong>texto</strong> do rótulo. Se o cursor não
pular para o campo, o <code>for</code> está errado ou não existe.</p>

<h2>O tipo certo muda o teclado do celular</h2>
<table>
  <tr><th>Tipo</th><th>No celular aparece</th></tr>
  <tr><td><code>type="text"</code></td><td>teclado comum</td></tr>
  <tr><td><code>type="email"</code></td><td>teclado com @ e ponto</td></tr>
  <tr><td><code>type="tel"</code></td><td>teclado numérico</td></tr>
  <tr><td><code>type="number"</code></td><td>numérico, com setas</td></tr>
  <tr><td><code>type="date"</code></td><td>o seletor de data do aparelho</td></tr>
</table>
<p>Usar <code>text</code> para tudo funciona — e obriga a pessoa a trocar de teclado no meio do
preenchimento. É um daqueles detalhes que ninguém elogia e todo mundo sente.</p>

<h2>Faça agora</h2>
<p>Monte um formulário com nome, e-mail e telefone, cada um com seu rótulo e o tipo certo. Abra no
celular e repare no teclado mudando de campo para campo. Depois clique nos textos dos rótulos: os
três precisam levar o cursor ao campo.</p>
`,

  'publicando-no-github-pages': `
<h2>Antes de publicar, a revisão</h2>
<p>Publicar é rápido; o que dá trabalho é descobrir depois que algo quebrou. Cinco minutos de
conferência evitam isso:</p>
<table>
  <tr><th>Confira</th><th>Por quê</th></tr>
  <tr><td>O arquivo se chama <code>index.html</code></td><td>é o que o servidor procura sozinho</td></tr>
  <tr><td>Nomes de arquivo em minúsculas</td><td>no servidor, <code>Foto.JPG</code> ≠ <code>foto.jpg</code></td></tr>
  <tr><td>Caminhos sem barra no começo</td><td><code>/style.css</code> quebra em subpasta; <code>style.css</code> não</td></tr>
  <tr><td>Nenhuma senha ou dado pessoal no código</td><td>repositório público é público, e o histórico guarda</td></tr>
  <tr><td>Todos os links abrem</td><td>link quebrado é o que mais aparece na primeira publicação</td></tr>
</table>

<h2>Quando a página sobe vazia</h2>
<p>Os três casos, na ordem em que acontecem:</p>
<ul>
  <li><strong>Página em branco</strong> — o arquivo não é <code>index.html</code>, ou não está na
    raiz do repositório</li>
  <li><strong>Sem estilo</strong> — o caminho do CSS está errado. Abra o console (F12) e procure o
    erro 404: ele diz exatamente qual arquivo não foi achado</li>
  <li><strong>Imagem quebrada só no ar</strong> — diferença de maiúscula no nome do arquivo</li>
</ul>
<p>O terceiro pega todo mundo uma vez, porque no Windows funciona e no servidor não. Depois dessa,
você escreve nome de arquivo em minúsculas para sempre.</p>

<h2>Faça agora</h2>
<p>Depois de publicar, abra o endereço numa <strong>aba anônima</strong>. Sem o cache do seu
navegador, você vê a página como um visitante vê — e é aí que aparecem os arquivos que existem só
na sua máquina.</p>
`,
}

const NOVAS = [
  // ---------------------------------------------------------- Parte 4
  {
    curso: 'html-css-4-layout-completo',
    slug: 'media-queries-na-pratica',
    titulo: 'Media queries na prática',
    min: 6, ordem: 3,
    descricao: 'Onde cortar o layout, e como descobrir isso sem chutar.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Escrever media queries que respondem ao seu conteúdo</li>
  <li>Descobrir o ponto de corte observando, não copiando de lista</li>
  <li>Usar as ferramentas do navegador para testar telas</li>
</ul>

<h2>A forma</h2>
<pre><code>/* vale sempre */
.cartao { padding: 1rem; }

/* vale a partir de 700px de largura */
@media (min-width: 700px) {
  .cartao { padding: 2rem; }
}</code></pre>
<p>A media query não substitui a regra de cima: acrescenta. Tudo que não for redeclarado dentro dela
continua valendo — é a cascata funcionando normalmente.</p>

<h2>Achar o ponto de corte</h2>
<p>O erro comum é copiar uma lista de tamanhos: 320, 768, 1024, 1440. Esses números vieram de
aparelhos que já saíram de linha, e não têm relação com a sua página.</p>
<p>O método que funciona:</p>
<ol>
  <li>Abra a página numa janela larga</li>
  <li>Arraste a borda, estreitando devagar</li>
  <li>Pare quando <strong>ficar ruim</strong> — não quando chegar num número redondo</li>
  <li>Veja a largura atual nas ferramentas do navegador e use esse número</li>
</ol>
<p>Assim seus cortes acompanham o seu conteúdo. Uma página de texto corrido pode precisar de um
corte só; uma com grade de cartões, de três.</p>

<h2>As ferramentas do navegador</h2>
<p>F12 e depois o ícone de celular (ou Ctrl+Shift+M) liga o modo dispositivo. Ali dá para:</p>
<ul>
  <li>Escolher um aparelho da lista, ou digitar largura e altura à mão</li>
  <li>Ver a largura atual enquanto arrasta — é o número que você procura</li>
  <li>Simular conexão lenta, para ver a página como ela chega no 4G</li>
</ul>
<p>É simulação: o toque, a fonte do sistema e o navegador do aparelho são diferentes. Serve para
90% do trabalho, e os outros 10% só o aparelho de verdade resolve.</p>

<h2>Além da largura</h2>
<pre><code>/* respeita quem pediu menos animação no sistema */
@media (prefers-reduced-motion: reduce) {
  * { animation: none; transition: none; }
}

/* estilo específico para a impressão */
@media print {
  nav, footer { display: none; }
}</code></pre>
<p>O primeiro atende quem sente enjoo com movimento na tela e desligou animações no sistema — são
duas linhas. O segundo tira o menu quando alguém imprime a página, o que economiza tinta e melhora
o resultado.</p>

<h2>Faça agora</h2>
<p>Descubra o ponto de corte da sua página pelo método de arrastar e escreva a media query com o
número que você encontrou. Anote num comentário <em>por que</em> aquele número — "abaixo daqui os
cartões ficam com menos de 280px". Daqui a três meses esse comentário vale mais que o número.</p>
`,
    desafio: {
      titulo: 'O corte que veio do seu conteúdo',
      enunciado: `<p>Torne sua página responsiva com media queries que você mesmo descobriu.</p>
<ul>
  <li>Escreva mobile-first: o layout do celular sem media query, e o resto com <code>min-width</code></li>
  <li>Encontre os pontos de corte arrastando a janela — não copie de lista</li>
  <li>Comente cada media query dizendo o que quebrava naquela largura</li>
  <li>Acrescente o bloco de <code>prefers-reduced-motion</code></li>
</ul>
<p>Entregue com as larguras que você encontrou anotadas. Se todas forem 768 e 1024, você copiou de
uma lista — refaça arrastando.</p>`,
    },
  },
  {
    curso: 'html-css-4-layout-completo',
    slug: 'imagens-que-se-adaptam',
    titulo: 'Imagens que se adaptam',
    min: 5, ordem: 4,
    descricao: 'A imagem que não estoura a tela nem trava a página no celular.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Fazer a imagem caber em qualquer tela</li>
  <li>Controlar o recorte sem deformar</li>
  <li>Evitar o salto do texto quando a imagem carrega</li>
</ul>

<h2>A regra que toda página precisa</h2>
<pre><code>img {
  max-width: 100%;
  height: auto;
}</code></pre>
<p>Sem ela, uma foto de 2000 pixels numa tela de 400 empurra a página inteira para o lado e cria
aquela rolagem horizontal que não deveria existir. Com ela, a imagem nunca passa da largura
disponível, e a altura acompanha para não deformar.</p>
<p>Escreva no começo do CSS, junto do <code>box-sizing</code>. São as duas regras que todo projeto
tem.</p>

<h2>Recortar sem esticar</h2>
<p>Quando o espaço tem proporção fixa — um cartão, uma capa — e a foto tem outra, o padrão é
esticar. O conserto:</p>
<pre><code>.capa img {
  width: 100%;
  height: 200px;
  object-fit: cover;      /* preenche e recorta o que sobra */
}</code></pre>
<table>
  <tr><th>Valor</th><th>Faz</th></tr>
  <tr><td><code>cover</code></td><td>preenche o espaço, cortando as bordas — o mais usado</td></tr>
  <tr><td><code>contain</code></td><td>mostra a imagem inteira, sobrando espaço vazio</td></tr>
  <tr><td><code>fill</code></td><td>estica para caber — deforma, e é o padrão que se quer evitar</td></tr>
</table>

<h2>O salto que irrita</h2>
<p>Você está lendo, a imagem carrega, e o texto pula para baixo — às vezes bem na hora em que você
ia clicar. Isso acontece porque o navegador não sabia o tamanho da imagem e não reservou o espaço.</p>
<pre><code>&lt;img src="foto.jpg" alt="..." width="800" height="600"&gt;</code></pre>
<p>Com <code>width</code> e <code>height</code> no HTML, o navegador calcula a proporção e reserva o
lugar antes de a imagem chegar. O CSS continua mandando no tamanho final — os atributos servem só
para informar a proporção.</p>

<h2>Carregar só o que aparece</h2>
<pre><code>&lt;img src="foto.jpg" alt="..." loading="lazy"&gt;</code></pre>
<p>O <code>loading="lazy"</code> adia a imagem até ela estar perto de aparecer na tela. Numa página
com dez fotos, isso é a diferença entre abrir na hora e demorar cinco segundos.</p>
<p>Uma exceção: não use na primeira imagem, a que já aparece sem rolar. Adiar justamente aquela
atrasa o que a pessoa vê primeiro.</p>

<h2>Faça agora</h2>
<p>Abra as ferramentas (F12 → Network), marque "Disable cache" e recarregue a página. Olhe o tamanho
das suas imagens. Alguma passa de 300 KB? Redimensione antes de subir — e depois compare o tempo
total de carregamento.</p>
`,
    desafio: {
      titulo: 'Imagens que não travam a página',
      enunciado: `<p>Ajuste todas as imagens da sua página.</p>
<ul>
  <li><code>max-width: 100%</code> e <code>height: auto</code> na regra base</li>
  <li><code>width</code> e <code>height</code> no HTML de cada imagem</li>
  <li><code>loading="lazy"</code> em todas, menos na primeira</li>
  <li>Nenhum arquivo acima de 300 KB</li>
</ul>
<p>Meça antes e depois no painel Network, com o cache desligado, e entregue os dois números: quanto
a página pesava e quanto passou a pesar.</p>`,
    },
  },

  // ---------------------------------------------------------- Parte 5
  {
    curso: 'html-css-5-formularios',
    slug: 'validacao-e-mensagens',
    titulo: 'Validação e mensagens que ajudam',
    min: 6, ordem: 2,
    descricao: 'O navegador já valida sozinho — e a mensagem de erro é parte do trabalho.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Usar a validação que o HTML já traz</li>
  <li>Escrever mensagem de erro que resolve, em vez de acusar</li>
  <li>Marcar campo obrigatório de forma que todos percebam</li>
</ul>

<h2>Validação sem escrever código</h2>
<pre><code>&lt;input type="email" id="email" name="email" required&gt;
&lt;input type="text"  id="cep"   name="cep"
       pattern="[0-9]{5}-[0-9]{3}"
       placeholder="00000-000"&gt;
&lt;input type="number" id="idade" min="10" max="120"&gt;</code></pre>
<table>
  <tr><th>Atributo</th><th>Faz</th></tr>
  <tr><td><code>required</code></td><td>não deixa enviar vazio</td></tr>
  <tr><td><code>pattern</code></td><td>exige um formato</td></tr>
  <tr><td><code>min</code> / <code>max</code></td><td>limita o valor</td></tr>
  <tr><td><code>minlength</code> / <code>maxlength</code></td><td>limita o tamanho do texto</td></tr>
</table>
<p>Tudo isso funciona sem uma linha de JavaScript. Vale lembrar de uma coisa, para quando você
chegar no back-end: essa validação é <strong>conveniência</strong>, não segurança. Ela ajuda quem
preenche; qualquer pessoa consegue contorná-la, e por isso o servidor sempre valida de novo.</p>

<h2>Marcar o obrigatório</h2>
<pre><code>&lt;label for="nome"&gt;
  Nome &lt;span aria-hidden="true"&gt;*&lt;/span&gt;
&lt;/label&gt;
&lt;input type="text" id="nome" required&gt;</code></pre>
<p>O asterisco fica <code>aria-hidden</code> porque o <code>required</code> já faz o leitor de tela
anunciar "obrigatório" — sem isso a pessoa ouviria "Nome asterisco". E, no começo do formulário,
uma linha explicando: "Campos com * são obrigatórios". Asterisco sozinho é convenção que nem todo
mundo conhece.</p>

<h2>A mensagem de erro</h2>
<p>Compare:</p>
<table>
  <tr><th>Ruim</th><th>Melhor</th></tr>
  <tr><td>Erro no campo</td><td>Digite um e-mail com @, como ana@escola.com</td></tr>
  <tr><td>Formato inválido</td><td>O CEP tem 8 números, assim: 39860-000</td></tr>
  <tr><td>Campo obrigatório</td><td>Precisamos do seu nome para responder</td></tr>
</table>
<p>Três regras: diga <strong>o que está errado</strong>, <strong>como corrigir</strong> e mostre um
<strong>exemplo</strong>. E nunca culpe quem preencheu — "você digitou errado" e "o telefone tem 11
números com o DDD" descrevem a mesma situação, e só a segunda ajuda.</p>

<h2>Onde a mensagem aparece</h2>
<pre><code>input:invalid  { border-color: #b91c1c; }
input:valid    { border-color: #15803d; }</code></pre>
<p>Cuidado com essas duas: aplicadas direto, o campo vazio já nasce vermelho, antes de a pessoa
digitar qualquer coisa. Isso passa a sensação de erro logo na chegada. O ajuste:</p>
<pre><code>input:not(:placeholder-shown):invalid { border-color: #b91c1c; }</code></pre>
<p>Assim o vermelho só aparece depois que alguém digitou algo. E a cor nunca vai sozinha — quem não
distingue vermelho de verde precisa do texto da mensagem.</p>

<h2>Faça agora</h2>
<p>Pegue um formulário de um site que você usa e tente enviá-lo errado de propósito: e-mail sem @,
campo vazio, telefone com letras. Anote as mensagens que aparecem. Quantas dizem como corrigir?
Quantas só reclamam?</p>
`,
    desafio: {
      titulo: 'Formulário que explica o erro',
      enunciado: `<p>Complete seu formulário de contato com validação e mensagens.</p>
<ul>
  <li><code>required</code> nos campos necessários, com aviso no início do formulário</li>
  <li>Tipos certos e ao menos um <code>pattern</code></li>
  <li>Estado visual de erro que só aparece depois de a pessoa digitar</li>
  <li>Uma mensagem escrita por você para cada erro possível, dizendo como corrigir e dando exemplo</li>
</ul>
<p>Teste pedindo para alguém preencher errado de propósito, sem você explicar nada. Se a pessoa
conseguir consertar sozinha lendo as mensagens, está pronto.</p>`,
    },
  },
  {
    curso: 'html-css-5-formularios',
    slug: 'estilizando-formularios',
    titulo: 'Estilizando o formulário',
    min: 5, ordem: 3,
    descricao: 'Campos com a cara da página, sem perder o que o navegador dá de graça.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Dar aparência consistente aos campos</li>
  <li>Manter o foco visível ao estilizar</li>
  <li>Montar o formulário em uma coluna, que é o que funciona</li>
</ul>

<h2>Os campos não herdam a fonte</h2>
<pre><code>input, textarea, select, button {
  font: inherit;    /* sem isto, cada um usa a fonte do sistema */
  color: inherit;
}</code></pre>
<p>Essa é a primeira regra de qualquer formulário estilizado. Por padrão, campo e botão ignoram a
fonte da página e usam a do sistema operacional — é por isso que formulário costuma parecer colado
de outro site.</p>

<h2>Uma coluna, sempre</h2>
<pre><code>form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 32rem;
}
label { display: block; margin-bottom: 0.35rem; font-weight: 600; }
input, textarea { width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 8px; }</code></pre>
<p>Campos lado a lado parecem econômicos e atrapalham: o olho tem de decidir a cada linha para onde
ir, e no celular eles quebram de qualquer jeito. Uma coluna, rótulo em cima do campo, é o arranjo
que menos erra.</p>

<h2>Foco: aqui é ainda mais importante</h2>
<pre><code>input:focus-visible, textarea:focus-visible {
  outline: 3px solid var(--cor-destaque);
  outline-offset: 1px;
  border-color: var(--cor-destaque);
}</code></pre>
<p>Num texto, perder o foco é chato. Num formulário, é digitar no campo errado e só perceber ao
enviar. Se você estilizar a borda dos campos, teste com Tab antes de dar por pronto.</p>

<h2>O botão</h2>
<pre><code>button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: var(--cor-destaque);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}
button:hover { filter: brightness(0.92); }
button:disabled { opacity: 0.5; cursor: not-allowed; }</code></pre>
<p>Duas coisas que faltam na maioria dos formulários de iniciante: o <code>cursor: pointer</code>,
que avisa que aquilo é clicável, e o estado <code>:disabled</code>, para quando o envio está em
andamento e não se deve clicar duas vezes.</p>
<p>E confira o contraste do texto sobre a cor do botão. Branco sobre um tom claro de verde ou
amarelo fica em torno de 2 para 1 — ilegível justamente no elemento mais importante da tela.</p>

<h2>Faça agora</h2>
<p>Estilize seu formulário e depois faça dois testes: percorra os campos com Tab conferindo se o
foco aparece em todos, e meça o contraste do texto do botão contra o fundo dele na ferramenta do
navegador.</p>
`,
    desafio: {
      titulo: 'Formulário com a cara da página',
      enunciado: `<p>Dê acabamento ao formulário.</p>
<ul>
  <li><code>font: inherit</code> nos campos, para acompanharem a página</li>
  <li>Uma coluna, com rótulo acima do campo e espaçamento uniforme</li>
  <li>Foco visível em todo campo e no botão</li>
  <li>Botão com <code>cursor: pointer</code>, estado hover e estado desabilitado</li>
  <li>Contraste do texto do botão medido e acima de 4,5 para 1</li>
</ul>
<p>Entregue com o número do contraste anotado. É o item que mais falha, e é o mais fácil de medir.</p>`,
    },
  },

  // ---------------------------------------------------------- Parte 6
  {
    curso: 'html-css-6-no-ar',
    slug: 'revisao-de-acessibilidade',
    titulo: 'A revisão de acessibilidade',
    min: 6, ordem: 3,
    descricao: 'A lista do que conferir antes de dizer que está pronto.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Rodar uma revisão de acessibilidade completa</li>
  <li>Entender o que a ferramenta automática não pega</li>
  <li>Corrigir os problemas mais comuns</li>
</ul>

<h2>Primeiro, a ferramenta</h2>
<p>F12 → Lighthouse → marque "Accessibility" → "Analyze page load". Em segundos você recebe uma nota
e uma lista de problemas com o elemento exato de cada um.</p>
<p>Ela pega bem: contraste insuficiente, imagem sem <code>alt</code>, campo sem rótulo, título fora
de ordem, página sem <code>lang</code>. Vale rodar sempre antes de publicar.</p>

<h2>O que ela não pega</h2>
<p>A ferramenta confere se o <code>alt</code> <strong>existe</strong>; não confere se ele
<strong>descreve</strong> a imagem. <code>alt="imagem"</code> passa no teste automático e não serve
para nada. O mesmo vale para:</p>
<table>
  <tr><th>A ferramenta vê</th><th>A ferramenta não vê</th></tr>
  <tr><td>que o link tem texto</td><td>que o texto é "clique aqui"</td></tr>
  <tr><td>que existe um <code>&lt;h1&gt;</code></td><td>que ele descreve a página</td></tr>
  <tr><td>que o contraste passa</td><td>que a cor é a única marca de um estado</td></tr>
  <tr><td>que o campo tem rótulo</td><td>que o rótulo diz o que preencher</td></tr>
</table>
<p>Por isso a revisão automática é o começo, não o fim. Ela cuida do que é mecânico e libera você
para olhar o que exige julgamento.</p>

<h2>A revisão manual, em cinco minutos</h2>
<ol>
  <li><strong>Só teclado.</strong> Percorra a página com Tab, do início ao fim. O foco fica sempre
    visível? A ordem faz sentido?</li>
  <li><strong>Sem imagens.</strong> Nas ferramentas, bloqueie o carregamento de imagens e
    recarregue. Os textos alternativos explicam o que se perdeu?</li>
  <li><strong>Zoom em 200%.</strong> Ctrl e "+" até dobrar. Some conteúdo? Aparece rolagem
    lateral?</li>
  <li><strong>Em voz alta.</strong> Leia a página como se descrevesse por telefone. O que ficar
    difícil de descrever é o que está confuso.</li>
  <li><strong>Só o texto.</strong> Se você tirasse toda a cor, ainda dá para saber o que é link, o
    que é erro, o que está selecionado?</li>
</ol>

<h2>Os três problemas mais comuns em página de iniciante</h2>
<ul>
  <li><strong>Contraste baixo</strong> em texto secundário — aquele cinza-claro elegante</li>
  <li><strong>Foco removido</strong> com <code>outline: none</code>, copiado de algum tutorial</li>
  <li><strong>Cor como única informação</strong> — link que só se distingue por ser azul, erro que
    só se distingue por ser vermelho</li>
</ul>
<p>Os três são de correção rápida, e os três atingem gente de verdade: cerca de 8% dos homens têm
alguma dificuldade para distinguir cores.</p>

<h2>Faça agora</h2>
<p>Rode o Lighthouse na sua página e anote a nota. Corrija o que ele apontar e rode de novo. Depois
faça a revisão manual dos cinco pontos — e repare que ela encontra coisas que a nota 100 não
encontrou.</p>
`,
    desafio: {
      titulo: 'A revisão completa, automática e manual',
      enunciado: `<p>Faça as duas revisões na sua página e entregue o relato.</p>
<ul>
  <li>Nota do Lighthouse em Accessibility, antes e depois das correções</li>
  <li>Os cinco testes manuais feitos, com o que você encontrou em cada um</li>
  <li>A lista do que corrigiu</li>
</ul>
<p>Se o Lighthouse deu 100 e a revisão manual não encontrou nada, refaça o teste sem imagens e o de
zoom 200% — são os dois que mais revelam problema em página que passou no automático.</p>`,
    },
  },
  {
    curso: 'html-css-6-no-ar',
    slug: 'o-que-vem-depois',
    titulo: 'O que vem depois',
    min: 5, ordem: 4,
    descricao: 'Onde continuar, o que estudar em seguida e como não se perder.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Saber o que você já é capaz de fazer</li>
  <li>Escolher o próximo passo sem se dispersar</li>
  <li>Conhecer as fontes que valem consulta</li>
</ul>

<h2>O que você já sabe fazer</h2>
<p>Ao fim deste módulo, você monta uma página do zero, estrutura o conteúdo com significado,
estiliza com CSS, organiza layout em duas dimensões, faz funcionar no celular, monta formulário e
publica na internet. Isso não é pouco: é o que sustenta qualquer site que existe.</p>
<p>O que vem a seguir acrescenta comportamento, dados e ferramentas — mas o alicerce é este, e ele
não muda.</p>

<h2>O próximo passo, na ordem</h2>
<table>
  <tr><th>Depois deste módulo</th><th>Por quê</th></tr>
  <tr><td>Lógica de Programação</td><td>o raciocínio antes da linguagem — condição, repetição, decomposição</td></tr>
  <tr><td>JavaScript</td><td>a página deixa de ser só leitura e passa a reagir</td></tr>
  <tr><td>Git, GitHub e Vercel</td><td>versionar e publicar de verdade, com histórico</td></tr>
  <tr><td>Banco de dados</td><td>guardar o que os usuários mandam</td></tr>
</table>
<p>A ordem importa. Pular a lógica e ir direto ao JavaScript é o caminho mais comum de quem desiste:
a pessoa entende a sintaxe e não sabe montar o raciocínio.</p>

<h2>Onde consultar quando travar</h2>
<ul>
  <li><strong>MDN Web Docs</strong> — a referência de HTML e CSS. Quando não souber o que uma
    propriedade faz, procure "mdn" mais o nome dela</li>
  <li><strong>Can I Use</strong> — diz se um recurso funciona nos navegadores que você precisa
    atender</li>
  <li><strong>Kevin Powell</strong> — vídeos de CSS que explicam o porquê, não só o comando</li>
</ul>
<p>Evite decorar: ninguém sabe todas as propriedades de cor. O que se aprende é <em>o que existe</em>
e <em>onde procurar</em>.</p>

<h2>O erro que trava quem está começando</h2>
<p>Assistir a mais um tutorial em vez de escrever a próxima linha. É confortável — o vídeo dá a
sensação de progresso sem o desconforto de travar. Só que travar é o que ensina.</p>
<p>A proporção que funciona: para cada hora estudando, duas escrevendo código próprio. Quando
travar, tente vinte minutos antes de procurar a resposta; o que você achar depois de tentar, fica.</p>

<h2>Continue por conta própria</h2>
<p>Três projetos que cabem no que você já sabe e ensinam mais do que parecem:</p>
<ol>
  <li><strong>Página de um negócio da sua rua</strong> — restrição real, cliente real, e você vai
    ter de decidir o que é importante</li>
  <li><strong>Seu portfólio</strong> — é o que abre porta, e melhora a cada projeto novo</li>
  <li><strong>Recriar uma página que você admira</strong> — só olhando, sem ver o código. Depois
    compare com o original e veja o que fez diferente</li>
</ol>
<p>O terceiro é o exercício que mais ensina layout, e quase ninguém faz.</p>

<h2>Faça agora</h2>
<p>Escolha um dos três e comece hoje, nem que seja pelo esqueleto HTML. O projeto que se começa no
dia em que se decide é o que tem chance de terminar.</p>
`,
    desafio: {
      titulo: 'O próximo projeto, começado',
      enunciado: `<p>Escolha um dos três projetos da aula e comece.</p>
<ul>
  <li>Crie a pasta, o <code>index.html</code> e o <code>style.css</code></li>
  <li>Escreva o esqueleto e pelo menos uma seção de conteúdo de verdade</li>
  <li>Publique como está — mesmo incompleto</li>
  <li>Anote as três próximas coisas que você vai fazer nele</li>
</ul>
<p>Não precisa estar pronto. Precisa estar começado e no ar: projeto que fica na pasta esperando
ficar bom não fica bom nunca.</p>`,
    },
  },
]

await aplicar({ AMPLIACOES, NOVAS })
