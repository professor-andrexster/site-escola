#!/usr/bin/env node

/**
 * Script para inserir curso CSS no banco de dados via Supabase
 * Uso: node inserir-cursos-css.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yxtjkorchxcjkfnbekrs.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4dGprb3JjaHhjamtmbmJla3JzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTcxMzE2NywiZXhwIjoyMDk1Mjg5MTY3fQ.yAig0AWNO39bAMmlYNlRkWBp3iUAl5buvXQa7hWMgN0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ========================================
// DADOS DO CURSO CSS
// ========================================

const cursoCSS = {
  titulo: 'CSS — Estilo e Layout',
  slug: 'css-estilo-e-layout',
  descricao: 'Aprenda CSS: seletores, propriedades, layouts modernos (Flexbox, Grid) e responsividade. Crie sites lindos e adaptáveis.',
  categoria: 'Web Development',
  autor_nome: 'Professor André Gomes',
  nivel: 'Iniciante',
  publicado: false,
  ordem: 3,
};

const aulasCSS = [
  {
    titulo: 'CSS Fundamentos',
    slug: 'css-fundamentos',
    descricao: 'Sintaxe CSS, seletores básicos e especificidade',
    conteudo: `<h2>Objetivo de Aprendizagem</h2>
<p>Ao fim desta aula você será capaz de:</p>
<ul>
  <li>Entender a sintaxe básica do CSS</li>
  <li>Usar seletores de elemento, classe e ID</li>
  <li>Compreender como a especificidade funciona</li>
</ul>

<h2>O que é CSS?</h2>
<p>CSS (Cascading Style Sheets) é uma linguagem usada para estilizar e fazer o layout de páginas web. Enquanto HTML define a <strong>estrutura</strong>, CSS define a <strong>aparência</strong>.</p>

<h2>Sintaxe Básica do CSS</h2>
<p>Todo CSS segue este padrão:</p>
<pre><code>seletor {
  propriedade: valor;
}</code></pre>

<p>Exemplo:</p>
<pre><code>h1 {
  color: #0066ff;
  font-size: 32px;
}</code></pre>

<h2>Onde Colocar CSS?</h2>
<p>Existem três formas:</p>

<h3>1. CSS Externo (Recomendado)</h3>
<pre><code>&lt;link rel="stylesheet" href="estilos.css"&gt;</code></pre>

<h3>2. CSS Interno (No &lt;head&gt;)</h3>
<pre><code>&lt;style&gt;
  h1 { color: #0066ff; }
&lt;/style&gt;</code></pre>

<h3>3. CSS Inline (Evitar)</h3>
<pre><code>&lt;h1 style="color: #0066ff;"&gt;Título&lt;/h1&gt;</code></pre>

<h2>Seletores Básicos</h2>

<h3>Seletor de Elemento</h3>
<pre><code>p {
  color: #333;
}</code></pre>
<p>Seleciona <strong>todos</strong> os parágrafos da página.</p>

<h3>Seletor de Classe</h3>
<pre><code>.destaque {
  background-color: #ffff00;
}</code></pre>
<p>No HTML: <code>&lt;p class="destaque"&gt;Texto destacado&lt;/p&gt;</code></p>

<h3>Seletor de ID</h3>
<pre><code>#header {
  background-color: #0066ff;
  color: white;
}</code></pre>
<p>No HTML: <code>&lt;div id="header"&gt;Cabeçalho&lt;/div&gt;</code></p>

<p><strong>Regra:</strong> Use <em>classes</em> para reutilizar estilos, <em>IDs</em> apenas para elementos únicos.</p>

<h2>Especificidade</h2>
<p>Quando múltiplos seletores visam o mesmo elemento, CSS usa especificidade para decidir qual regra vence:</p>

<ol>
  <li><strong>Element:</strong> 1 ponto (ex: p)</li>
  <li><strong>Class:</strong> 10 pontos (ex: .destaque)</li>
  <li><strong>ID:</strong> 100 pontos (ex: #header)</li>
  <li><strong>Inline:</strong> 1000 pontos (ex: style="")</li>
</ol>

<p>Quanto <em>mais específico</em> o seletor, mais prioridade tem.</p>

<h2>Cascata</h2>
<p>CSS significa "Cascading" — a última regra que se aplica é a que vence, se tiverem mesma especificidade.</p>

<pre><code>p { color: red; }
p { color: blue; }

/* O parágrafo será azul */</code></pre>

<h2>Resumo</h2>
<ul>
  <li>CSS estiliza a aparência definida por HTML</li>
  <li>Prefira CSS externo em arquivo separado</li>
  <li>Use classes para estilos reutilizáveis, IDs para únicos</li>
  <li>Especificidade determina qual regra vence</li>
</ul>`,
    ordem: 1,
  },
  {
    titulo: 'Propriedades Essenciais',
    slug: 'propriedades-essenciais',
    descricao: 'Cores, fontes, espaçamento e tamanhos',
    conteudo: `<h2>Objetivo de Aprendizagem</h2>
<p>Ao fim desta aula você será capaz de:</p>
<ul>
  <li>Aplicar cores em texto e fundo</li>
  <li>Escolher e importar fontes</li>
  <li>Controlar tamanho, peso e altura de linha</li>
</ul>

<h2>Cores em CSS</h2>
<p>Existem várias formas de definir cores:</p>

<h3>Palavras-chave</h3>
<pre><code>color: red;
color: blue;
color: transparent;</code></pre>

<h3>Hexadecimal</h3>
<pre><code>color: #ff0000;    /* Vermelho */
color: #0066ff;    /* Azul */
color: #00aa00;    /* Verde */</code></pre>

<h3>RGB</h3>
<pre><code>color: rgb(255, 0, 0);      /* Vermelho */
color: rgba(0, 0, 255, 0.5); /* Azul com transparência */</code></pre>

<h2>Propriedades de Texto</h2>

<h3>Cor do Texto</h3>
<pre><code>p {
  color: #333;
}</code></pre>

<h3>Tamanho da Fonte</h3>
<pre><code>p {
  font-size: 16px;
}

h1 {
  font-size: 32px;
}</code></pre>

<h3>Peso da Fonte</h3>
<pre><code>strong {
  font-weight: bold;    /* ou 700 */
}

p {
  font-weight: normal;  /* ou 400 */
}</code></pre>

<h3>Família de Fonte</h3>
<pre><code>body {
  font-family: Arial, Helvetica, sans-serif;
}

h1 {
  font-family: 'Georgia', serif;
}</code></pre>

<h3>Altura de Linha</h3>
<pre><code>p {
  line-height: 1.6;  /* 1.6 vezes o tamanho da fonte */
}</code></pre>

<p><strong>Dica:</strong> Altura de linha maior (1.5–1.8) melhora legibilidade.</p>

<h2>Importar Fontes do Google Fonts</h2>
<p>No <code>&lt;head&gt;</code> do HTML:</p>
<pre><code>&lt;link rel="preconnect" href="https://fonts.googleapis.com"&gt;
&lt;link rel="preconnect" href="https://fonts.gstatic.com" crossorigin&gt;
&lt;link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet"&gt;</code></pre>

<p>No CSS:</p>
<pre><code>body {
  font-family: 'Roboto', sans-serif;
}</code></pre>

<h2>Propriedades de Fundo</h2>

<h3>Cor de Fundo</h3>
<pre><code>.caixa {
  background-color: #f0f0f0;
}</code></pre>

<h3>Imagem de Fundo</h3>
<pre><code>.hero {
  background-image: url('imagem.jpg');
  background-size: cover;
  background-position: center;
}</code></pre>

<h2>Resumo</h2>
<ul>
  <li>Use hexadecimal (#0066ff) ou RGB para cores precisas</li>
  <li>Tamanho, peso e altura de linha controlam legibilidade</li>
  <li>Google Fonts facilita usar fontes bonitas</li>
  <li>background-color e background-image customizam fundos</li>
</ul>`,
    ordem: 2,
  },
  {
    titulo: 'Box Model e Layout',
    slug: 'box-model-e-layout',
    descricao: 'Margin, padding, border e display',
    conteudo: `<h2>Objetivo de Aprendizagem</h2>
<p>Ao fim desta aula você será capaz de:</p>
<ul>
  <li>Compreender e usar o Box Model</li>
  <li>Controlar espaçamento com margin e padding</li>
  <li>Usar display para mudar comportamento de elementos</li>
</ul>

<h2>O Box Model</h2>
<p>Todo elemento HTML é uma caixa composta de:</p>

<ol>
  <li><strong>Content:</strong> O conteúdo do elemento (texto, imagem)</li>
  <li><strong>Padding:</strong> Espaço <em>dentro</em> da caixa, entre conteúdo e borda</li>
  <li><strong>Border:</strong> A borda da caixa</li>
  <li><strong>Margin:</strong> Espaço <em>fora</em> da caixa, entre elementos</li>
</ol>

<pre><code>┌─────────────────────────────┐
│      Margin                 │
│  ┌─────────────────────┐    │
│  │  Padding            │    │
│  │  ┌───────────────┐  │    │
│  │  │  Content      │  │    │
│  │  └───────────────┘  │    │
│  └─────────────────────┘    │
└─────────────────────────────┘</code></pre>

<h2>Padding (Espaçamento Interno)</h2>
<p>Padding é o espaço <strong>dentro</strong> de um elemento, entre o conteúdo e a borda:</p>

<pre><code>.caixa {
  padding: 20px;  /* Todos os lados */
}</code></pre>

<p>Ou especifique cada lado:</p>
<pre><code>.caixa {
  padding-top: 10px;
  padding-right: 20px;
  padding-bottom: 10px;
  padding-left: 20px;
}</code></pre>

<p>Atalho (top, right, bottom, left):</p>
<pre><code>.caixa {
  padding: 10px 20px 10px 20px;
}</code></pre>

<h2>Margin (Espaçamento Externo)</h2>
<p>Margin é o espaço <strong>fora</strong> de um elemento, separando-o de vizinhos:</p>

<pre><code>.caixa {
  margin: 30px;  /* Todos os lados */
}</code></pre>

<p>Mesma sintaxe de padding:</p>
<pre><code>.caixa {
  margin: 10px 20px 10px 20px;
}</code></pre>

<h3>Margin Collapses (Colapso de Margin)</h3>
<p>Quando dois elementos verticais têm margins, eles <strong>não somam</strong>. A maior vence:</p>

<pre><code>h1 { margin-bottom: 20px; }
p { margin-top: 30px; }

/* O espaço será 30px, não 50px */</code></pre>

<h2>Border (Borda)</h2>
<pre><code>.caixa {
  border: 2px solid #0066ff;
}</code></pre>

<p>Propriedades individuais:</p>
<pre><code>.caixa {
  border-width: 2px;
  border-style: solid;
  border-color: #0066ff;
}</code></pre>

<p><strong>Estilos de border:</strong> solid, dashed, dotted, double</p>

<h2>Propriedade Display</h2>
<p>Display controla como um elemento se comporta no layout:</p>

<h3>display: block</h3>
<p>Ocupa toda a largura disponível e quebra a linha:</p>
<pre><code>div {
  display: block;
}</code></pre>
<p><strong>Elementos nativos:</strong> div, p, h1, ul, li</p>

<h3>display: inline</h3>
<p>Ocupa apenas o espaço necessário, não quebra linha:</p>
<pre><code>span {
  display: inline;
}</code></pre>
<p><strong>Elementos nativos:</strong> span, a, strong, em</p>

<h3>display: inline-block</h3>
<p>Combina inline e block: respeita width/height mas fica na mesma linha:</p>
<pre><code>.botao {
  display: inline-block;
  width: 100px;
  padding: 10px;
}</code></pre>

<h3>display: none</h3>
<p>Remove completamente o elemento da página (diferente de visibility: hidden):</p>
<pre><code>.oculto {
  display: none;
}</code></pre>

<h2>Width e Height</h2>
<pre><code>.caixa {
  width: 300px;
  height: 200px;
}</code></pre>

<p><strong>Dica:</strong> width: 100% faz o elemento ocupar toda a largura do container pai.</p>

<h2>Resumo</h2>
<ul>
  <li>Box Model = content + padding + border + margin</li>
  <li>Padding é espaço <em>dentro</em>, margin é espaço <em>fora</em></li>
  <li>display controla como elementos se comportam (block, inline, inline-block)</li>
  <li>width e height definem tamanho (mas respeitam box-sizing)</li>
</ul>`,
    ordem: 3,
  },
  {
    titulo: 'Flexbox',
    slug: 'flexbox',
    descricao: 'Layout flexível unidimensional',
    conteudo: `<h2>Objetivo de Aprendizagem</h2>
<p>Ao fim desta aula você será capaz de:</p>
<ul>
  <li>Criar layouts flexíveis com Flexbox</li>
  <li>Alinhar itens horizontal e verticalmente</li>
  <li>Distribuir espaço entre elementos</li>
</ul>

<h2>O que é Flexbox?</h2>
<p>Flexbox (Flexible Box Layout) é um método moderno de layout que facilita alinhar e distribuir espaço entre elementos, mesmo quando o tamanho é desconhecido ou dinâmico.</p>

<h2>Estrutura Básica</h2>
<p>Um contêiner flex tem <strong>itens filhos</strong>:</p>

<pre><code>&lt;div class="container"&gt;
  &lt;div class="item"&gt;Item 1&lt;/div&gt;
  &lt;div class="item"&gt;Item 2&lt;/div&gt;
  &lt;div class="item"&gt;Item 3&lt;/div&gt;
&lt;/div&gt;</code></pre>

<pre><code>.container {
  display: flex;
}</code></pre>

<h2>Propriedades do Container</h2>

<h3>flex-direction</h3>
<p>Define a direção dos itens:</p>
<pre><code>.container {
  flex-direction: row;       /* Horizontal (padrão) */
  flex-direction: column;    /* Vertical */
  flex-direction: row-reverse;    /* Horizontal invertido */
  flex-direction: column-reverse;  /* Vertical invertido */
}</code></pre>

<h3>justify-content</h3>
<p>Alinha itens ao longo do eixo principal:</p>
<pre><code>.container {
  justify-content: flex-start;    /* Início (padrão) */
  justify-content: center;         /* Centro */
  justify-content: flex-end;       /* Fim */
  justify-content: space-between;  /* Espaço entre */
  justify-content: space-around;   /* Espaço ao redor */
  justify-content: space-evenly;   /* Espaço igual */
}</code></pre>

<h3>align-items</h3>
<p>Alinha itens perpendicular ao eixo principal:</p>
<pre><code>.container {
  align-items: flex-start;   /* Início */
  align-items: center;       /* Centro */
  align-items: flex-end;     /* Fim */
  align-items: stretch;      /* Preenche altura (padrão) */
}</code></pre>

<h3>gap</h3>
<p>Define espaço entre itens:</p>
<pre><code>.container {
  gap: 20px;  /* 20px entre cada item */
}</code></pre>

<h3>flex-wrap</h3>
<p>Permite itens quebrarem para próxima linha:</p>
<pre><code>.container {
  flex-wrap: wrap;      /* Quebra linha se necessário */
  flex-wrap: nowrap;    /* Não quebra (padrão) */
  flex-wrap: wrap-reverse;  /* Quebra ao contrário */
}</code></pre>

<h2>Propriedades dos Itens</h2>

<h3>flex</h3>
<p>Define crescimento, encolhimento e tamanho base:</p>
<pre><code>.item {
  flex: 1;  /* Cresce igualmente entre itens */
}

.item.destaque {
  flex: 2;  /* Cresce o dobro */
}</code></pre>

<h3>align-self</h3>
<p>Alinha um item individualmente:</p>
<pre><code>.item:first-child {
  align-self: flex-start;
}

.item:last-child {
  align-self: center;
}</code></pre>

<h2>Exemplo Prático: Navbar</h2>
<pre><code>&lt;nav class="navbar"&gt;
  &lt;div class="logo"&gt;Logo&lt;/div&gt;
  &lt;ul class="menu"&gt;
    &lt;li&gt;&lt;a href="#"&gt;Home&lt;/a&gt;&lt;/li&gt;
    &lt;li&gt;&lt;a href="#"&gt;Sobre&lt;/a&gt;&lt;/li&gt;
  &lt;/ul&gt;
&lt;/nav&gt;</code></pre>

<pre><code>.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #0066ff;
  color: white;
}

.menu {
  display: flex;
  gap: 20px;
  list-style: none;
}</code></pre>

<h2>Resumo</h2>
<ul>
  <li>display: flex ativa Flexbox no contêiner</li>
  <li>justify-content alinha horizontalmente</li>
  <li>align-items alinha verticalmente</li>
  <li>gap adiciona espaço entre itens</li>
  <li>flex em itens controla crescimento</li>
</ul>`,
    ordem: 4,
  },
  {
    titulo: 'CSS Grid',
    slug: 'css-grid',
    descricao: 'Layout bidimensional com linhas e colunas',
    conteudo: `<h2>Objetivo de Aprendizagem</h2>
<p>Ao fim desta aula você será capaz de:</p>
<ul>
  <li>Criar grids bidimensionais com CSS Grid</li>
  <li>Posicionar itens em linhas e colunas</li>
  <li>Combinar Grid com responsividade</li>
</ul>

<h2>O que é CSS Grid?</h2>
<p>CSS Grid permite criar layouts <strong>bidimensionais</strong> (linhas e colunas), perfeito para dashboards, galerias e páginas complexas.</p>

<h2>Estrutura Básica</h2>
<pre><code>&lt;div class="grid"&gt;
  &lt;div class="item"&gt;1&lt;/div&gt;
  &lt;div class="item"&gt;2&lt;/div&gt;
  &lt;div class="item"&gt;3&lt;/div&gt;
  &lt;div class="item"&gt;4&lt;/div&gt;
&lt;/div&gt;</code></pre>

<pre><code>.grid {
  display: grid;
}</code></pre>

<h2>Definir Colunas e Linhas</h2>

<h3>grid-template-columns</h3>
<p>Define a largura das colunas:</p>
<pre><code>.grid {
  display: grid;
  grid-template-columns: 200px 200px 200px;  /* 3 colunas de 200px */
}</code></pre>

<h3>Unidade fr (fração)</h3>
<p>Divide espaço disponível em frações:</p>
<pre><code>.grid {
  grid-template-columns: 1fr 1fr 1fr;  /* 3 colunas iguais */
  grid-template-columns: 2fr 1fr;      /* Primeira ocupa 2x mais espaço */
}</code></pre>

<h3>Repetir com repeat()</h3>
<p>Evita repetir valores:</p>
<pre><code>.grid {
  grid-template-columns: repeat(3, 1fr);  /* Mesmo que 1fr 1fr 1fr */
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}</code></pre>

<h3>grid-template-rows</h3>
<p>Define altura das linhas (opcional):</p>
<pre><code>.grid {
  grid-template-rows: 100px 100px;  /* 2 linhas de 100px */
}</code></pre>

<h2>Espaçamento</h2>

<h3>gap</h3>
<p>Espaço entre colunas e linhas:</p>
<pre><code>.grid {
  gap: 20px;           /* 20px em ambas direções */
  column-gap: 20px;    /* Apenas colunas */
  row-gap: 10px;       /* Apenas linhas */
}</code></pre>

<h2>Posicionar Itens</h2>

<h3>grid-column</h3>
<p>Faz um item ocupar múltiplas colunas:</p>
<pre><code>.item {
  grid-column: 1 / 3;  /* Ocupa colunas 1 e 2 */
}

.item.destaque {
  grid-column: span 2;  /* Ocupa 2 colunas */
}</code></pre>

<h3>grid-row</h3>
<p>Faz um item ocupar múltiplas linhas:</p>
<pre><code>.item.sidebar {
  grid-row: span 2;  /* Ocupa 2 linhas */
}</code></pre>

<h2>Exemplo Prático: Layout de Página</h2>
<pre><code>&lt;div class="layout"&gt;
  &lt;header&gt;Header&lt;/header&gt;
  &lt;nav&gt;Sidebar&lt;/nav&gt;
  &lt;main&gt;Conteúdo&lt;/main&gt;
  &lt;footer&gt;Footer&lt;/footer&gt;
&lt;/div&gt;</code></pre>

<pre><code>.layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 20px;
  height: 100vh;
}

header {
  grid-column: 1 / -1;  /* Ocupa todas as colunas */
  background-color: #0066ff;
  color: white;
  padding: 20px;
}

nav {
  background-color: #f0f0f0;
  padding: 20px;
}

main {
  padding: 20px;
}

footer {
  grid-column: 1 / -1;
  background-color: #333;
  color: white;
  padding: 20px;
  text-align: center;
}</code></pre>

<h2>Grid Responsivo com auto-fit</h2>
<p>Criar um grid que se adapta automaticamente:</p>
<pre><code>.galeria {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}</code></pre>

<p><strong>auto-fit:</strong> Cria quantas colunas couberem, encolhendo conforme necessário.</p>

<h2>Resumo</h2>
<ul>
  <li>display: grid ativa Grid no contêiner</li>
  <li>grid-template-columns define colunas</li>
  <li>grid-template-rows define linhas</li>
  <li>gap adiciona espaço entre células</li>
  <li>grid-column e grid-row posicionam itens</li>
  <li>auto-fit cria layouts responsivos automáticos</li>
</ul>`,
    ordem: 5,
  },
  {
    titulo: 'Responsividade',
    slug: 'responsividade',
    descricao: 'Media queries e design responsivo',
    conteudo: `<h2>Objetivo de Aprendizagem</h2>
<p>Ao fim desta aula você será capaz de:</p>
<ul>
  <li>Usar media queries para adaptar layout</li>
  <li>Implementar mobile-first design</li>
  <li>Testar responsividade em diferentes telas</li>
</ul>

<h2>O que é Design Responsivo?</h2>
<p>Design responsivo faz um site se adaptar a <strong>qualquer</strong> tamanho de tela: smartphone, tablet, desktop. O conteúdo flui e reorganiza automaticamente.</p>

<h2>O Meta Viewport</h2>
<p>A primeira coisa é informar ao navegador que o site é responsivo. No <code>&lt;head&gt;</code> do HTML:</p>
<pre><code>&lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;</code></pre>

<p>Isso garante que o layout respeite a largura real do dispositivo, não simule uma tela maior.</p>

<h2>Media Queries</h2>
<p>Media queries aplicam estilos <strong>condicionais</strong> baseado no tamanho da tela:</p>

<h3>Sintaxe Básica</h3>
<pre><code>@media (max-width: 768px) {
  /* Estilos para telas até 768px de largura */
  body {
    font-size: 14px;
  }
}</code></pre>

<h3>Breakpoints Comuns</h3>
<pre><code>/* Mobile */
@media (max-width: 480px) { }

/* Tablet */
@media (max-width: 768px) { }

/* Desktop pequeno */
@media (max-width: 1024px) { }

/* Desktop grande */
@media (min-width: 1200px) { }
</code></pre>

<h2>Mobile-First</h2>
<p><strong>Mobile-first</strong> significa começar o CSS para celular, depois adicionar breakpoints para telas maiores:</p>

<pre><code>/* Padrão: celular */
body {
  font-size: 14px;
  padding: 10px;
}

.container {
  display: block;
}

/* Tablet e acima */
@media (min-width: 768px) {
  body {
    font-size: 16px;
  }

  .container {
    display: flex;
    padding: 20px;
  }
}

/* Desktop e acima */
@media (min-width: 1200px) {
  body {
    font-size: 18px;
    max-width: 1200px;
    margin: 0 auto;
  }
}</code></pre>

<h2>Unidades Responsivas</h2>

<h3>px (pixel)</h3>
<p>Tamanho fixo — não recomendado para tudo:</p>
<pre><code>width: 300px;  /* Sempre 300px */</code></pre>

<h3>% (porcentagem)</h3>
<p>Relativa ao container pai:</p>
<pre><code>.sidebar {
  width: 30%;  /* 30% do container */
}</code></pre>

<h3>em (relativa ao elemento)</h3>
<p>Relativa ao tamanho da fonte do elemento:</p>
<pre><code>h1 {
  font-size: 2em;  /* 2x o tamanho da fonte atual */
  padding: 1em;    /* 1x o tamanho da fonte de h1 */
}</code></pre>

<h3>rem (relativa à raiz)</h3>
<p>Relativa ao tamanho da fonte do &lt;html&gt;:</p>
<pre><code>html {
  font-size: 16px;  /* Padrão */
}

body {
  font-size: 1rem;  /* 16px */
  line-height: 1.5rem;  /* 24px */
}</code></pre>

<h3>vw e vh (viewport)</h3>
<p>Relativa ao tamanho da tela:</p>
<pre><code>.hero {
  width: 100vw;  /* 100% da largura da tela */
  height: 100vh; /* 100% da altura da tela */
}</code></pre>

<h2>Exemplo: Navbar Responsiva</h2>
<pre><code>/* Mobile */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
}

.menu {
  display: none;  /* Oculto no celular */
}

.menu-button {
  display: block;  /* Botão hambúrguer */
  cursor: pointer;
}

/* Desktop */
@media (min-width: 768px) {
  .menu {
    display: flex;
    gap: 20px;
  }

  .menu-button {
    display: none;  /* Hambúrguer desaparece */
  }
}</code></pre>

<h2>Grid Responsivo</h2>
<pre><code>/* Mobile: 1 coluna */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

/* Tablet: 2 colunas */
@media (min-width: 768px) {
  .grid {
    grid-template-columns: 1fr 1fr;
  }
}

/* Desktop: 3 colunas */
@media (min-width: 1200px) {
  .grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
}</code></pre>

<h2>Testando Responsividade</h2>
<p>No navegador:</p>
<ol>
  <li>Abra DevTools: F12 ou Ctrl+Shift+I</li>
  <li>Clique no ícone de dispositivo (canto superior esquerdo)</li>
  <li>Escolha diferentes tamanhos: iPhone, iPad, Desktop</li>
  <li>Redimensione a janela e observe como o layout muda</li>
</ol>

<h2>Resumo</h2>
<ul>
  <li>Meta viewport ativa design responsivo</li>
  <li>Media queries aplicam estilos condicionais</li>
  <li>Mobile-first: começar pequeno, crescer</li>
  <li>Use %, em, rem, vw em vez de px fixo</li>
  <li>Teste em múltiplos tamanhos de tela</li>
</ul>`,
    ordem: 6,
  },
];

const desafiosCSS = [
  {
    titulo: 'Seu Primeiro Estilo CSS',
    enunciado: 'Crie um arquivo HTML com um parágrafo. Faça um arquivo CSS externo que mude a cor do texto para azul (#0066ff), tamanho da fonte para 18px e adicione uma margem de 20px.',
    tipo: 'pratico',
    gabarito: 'Verifique se tem: link CSS no HTML, seletor p ou classe, color: #0066ff, font-size: 18px, margin: 20px.',
    ordem: 1,
    aula_index: 0,
  },
  {
    titulo: 'Seletores e Especificidade',
    enunciado: 'Crie um HTML com múltiplos parágrafos. Use seletor de elemento (p), classe (.destaque) e ID (#intro). Aplique cores diferentes. Verifique qual regra "vence" quando há conflito.',
    tipo: 'pratico',
    gabarito: 'ID vence (100 pontos), depois classe (10), depois elemento (1). Demonstre sobrescrita usando especificidade.',
    ordem: 2,
    aula_index: 0,
  },
  {
    titulo: 'Box Model Prático',
    enunciado: 'Crie uma "caixa" com div, adicione padding: 30px, margin: 20px, border: 2px solid #0066ff. Use o DevTools para inspecionar e visualizar o Box Model completo.',
    tipo: 'pratico',
    gabarito: 'Deve mostrar na aba "Computed" do DevTools: padding, border, margin claramente separados. Ajuste valores e observe mudanças.',
    ordem: 3,
    aula_index: 2,
  },
  {
    titulo: 'Layout Flexbox — Navbar',
    enunciado: 'Crie uma navbar (nav com logo e menu ul > li). Use display: flex, justify-content: space-between, align-items: center. Logo à esquerda, menu à direita.',
    tipo: 'pratico',
    gabarito: 'Logo e menu alinhados horizontalmente, espaço distribuído entre eles. Sem floats nem posicionamento absoluto — apenas Flexbox.',
    ordem: 4,
    aula_index: 3,
  },
  {
    titulo: 'CSS Grid — Galeria',
    enunciado: 'Crie uma galeria de 6 imagens (ou divs com números). Use display: grid, grid-template-columns: repeat(3, 1fr), gap: 20px. Todas as colunas com largura igual.',
    tipo: 'pratico',
    gabarito: 'Grid com 3 colunas iguais, espaço de 20px entre células. Adicione border em cada célula para visualizar.',
    ordem: 5,
    aula_index: 4,
  },
  {
    titulo: 'Responsividade com Media Queries',
    enunciado: 'Crie um layout que muda de 3 colunas (desktop) para 2 (tablet) para 1 (mobile). Use grid e media queries com breakpoints 768px e 480px. Inclua a meta viewport.',
    tipo: 'pratico',
    gabarito: 'Verifique com DevTools em Mobile, Tablet, Desktop. Layout deve mudar: 3 → 2 → 1 coluna respectivamente.',
    ordem: 6,
    aula_index: 5,
  },
  {
    titulo: 'Projeto Integrador: Site de Produtos',
    enunciado: 'Crie um site com: navbar (flex), hero (fundo + texto centralizado), grid de produtos (3 colunas desktop, 1 mobile), footer (flex com itens distribuídos). Responsivo completo.',
    tipo: 'pratico',
    gabarito: 'Site funcional e responsivo: navbar visível em ambos, products em 3 colunas (desktop) / 1 coluna (mobile), footer com espaçamento. Teste em diferentes tamanhos.',
    ordem: 7,
    aula_index: 5,
  },
];

// ========================================
// FUNÇÃO PRINCIPAL
// ========================================

async function inserirCursoCSS() {
  try {
    console.log('🚀 Inserindo Curso CSS...\n');

    // 1. Inserir curso
    console.log('📚 Inserindo curso...');
    const { data: curso, error: eroCurso } = await supabase
      .from('cursos')
      .insert([cursoCSS])
      .select();

    if (eroCurso) throw new Error(`Erro ao inserir curso: ${eroCurso.message}`);
    const cursoId = curso[0].id;
    console.log(`✅ Curso inserido com ID: ${cursoId}\n`);

    // 2. Inserir aulas
    console.log('📖 Inserindo aulas...');
    const aulasComCursoId = aulasCSS.map((aula) => ({
      ...aula,
      curso_id: cursoId,
    }));

    const { data: aulas, error: eroAulas } = await supabase
      .from('aulas')
      .insert(aulasComCursoId)
      .select();

    if (eroAulas) throw new Error(`Erro ao inserir aulas: ${eroAulas.message}`);
    console.log(`✅ ${aulas.length} aulas inseridas\n`);

    // 3. Inserir desafios
    console.log('🎯 Inserindo desafios...');
    const desafiosComIds = desafiosCSS.map((desafio) => ({
      curso_id: cursoId,
      aula_id: aulas[desafio.aula_index]?.id || null,
      titulo: desafio.titulo,
      enunciado: desafio.enunciado,
      tipo: desafio.tipo,
      gabarito: desafio.gabarito,
      ordem: desafio.ordem,
    }));

    const { data: desafios, error: eroDesafios } = await supabase
      .from('curso_desafios')
      .insert(desafiosComIds)
      .select();

    if (eroDesafios) throw new Error(`Erro ao inserir desafios: ${eroDesafios.message}`);
    console.log(`✅ ${desafios.length} desafios inseridos\n`);

    // 4. Resumo final
    console.log('========================================');
    console.log('✅ CURSO CSS INSERIDO COM SUCESSO!');
    console.log('========================================');
    console.log(`\n📊 Resumo:`);
    console.log(`   • Curso: ${curso[0].titulo}`);
    console.log(`   • Aulas: ${aulas.length}`);
    console.log(`   • Desafios: ${desafios.length}`);
    console.log(`   • URL: /cursos/${curso[0].slug}\n`);

    console.log('🔗 Links úteis:');
    console.log(`   • Página pública: http://localhost:3000/cursos/${curso[0].slug}`);
    console.log(`   • Painel admin: http://localhost:3000/admin/cursos/gerenciar\n`);

  } catch (error) {
    console.error('❌ ERRO:', error.message);
    process.exit(1);
  }
}

// Executar
inserirCursoCSS();
