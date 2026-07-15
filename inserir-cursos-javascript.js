#!/usr/bin/env node

/**
 * Script para inserir curso de JavaScript (Interatividade Web)
 * Uso: node inserir-cursos-javascript.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yxtjkorchxcjkfnbekrs.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4dGprb3JjaHhjamtmbmJla3JzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTcxMzE2NywiZXhwIjoyMDk1Mjg5MTY3fQ.yAig0AWNO39bAMmlYNlRkWBp3iUAl5buvXQa7hWMgN0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ========================================
// DADOS DO CURSO JAVASCRIPT
// ========================================

const cursoJavaScript = {
  titulo: 'JavaScript — Interatividade Web',
  slug: 'javascript-interatividade-web',
  descricao: 'Aprenda JavaScript para criar interações dinâmicas em páginas web. Manipule o DOM, gerencie eventos, trabalhe com arrays e objetos, e domine promises com async/await para criar aplicações web modernas.',
  categoria: 'Web Development',
  autor_nome: 'Professor André Gomes',
  nivel: 'Intermediário',
  publicado: false,
  ordem: 3,
};

const aulasJavaScript = [
  {
    titulo: 'Fundamentos de JavaScript',
    slug: 'fundamentos-javascript',
    descricao: 'Conhecer sintaxe básica, tipos de dados e declaração de variáveis',
    conteudo: `<h2 style="color: #0066cc;">Objetivo de Aprendizagem</h2>
<p>Ao fim desta aula você será capaz de:</p>
<ul>
  <li>Entender variáveis, tipos de dados e operadores</li>
  <li>Diferenciar var, let e const</li>
  <li>Escrever comentários e estrutura básica</li>
</ul>

<h2 style="color: #0066cc;">O que é JavaScript?</h2>
<p>JavaScript é uma linguagem de programação que roda no navegador, permitindo criar interações em páginas web. Diferente do HTML que estrutura e CSS que estiliza, JavaScript <strong>adiciona comportamento e dinamicidade</strong>.</p>

<h2 style="color: #0066cc;">Inserindo JavaScript em HTML</h2>
<pre><code>&lt;script&gt;
  console.log('Olá, JavaScript!');
&lt;/script&gt;</code></pre>

<h2 style="color: #0066cc;">Variáveis e Tipos de Dados</h2>
<pre><code>// Declaração com let (recomendado)
let nome = 'Maria';
let idade = 17;
let ativo = true;

// Tipos: string, number, boolean, null, undefined, object
typeof nome;    // 'string'
typeof idade;   // 'number'
typeof ativo;   // 'boolean'</code></pre>

<h2 style="color: #0066cc;">Const vs Let vs Var</h2>
<table style="border-collapse: collapse; width: 100%;">
  <tr style="border: 1px solid #ccc;">
    <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Palavra-chave</th>
    <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Escopo</th>
    <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Reatribuição</th>
  </tr>
  <tr style="border: 1px solid #ccc;">
    <td style="border: 1px solid #ccc; padding: 8px;"><strong>const</strong></td>
    <td style="border: 1px solid #ccc; padding: 8px;">Bloco</td>
    <td style="border: 1px solid #ccc; padding: 8px;">Não (obrigatório atribuir)</td>
  </tr>
  <tr style="border: 1px solid #ccc;">
    <td style="border: 1px solid #ccc; padding: 8px;"><strong>let</strong></td>
    <td style="border: 1px solid #ccc; padding: 8px;">Bloco</td>
    <td style="border: 1px solid #ccc; padding: 8px;">Sim</td>
  </tr>
  <tr style="border: 1px solid #ccc;">
    <td style="border: 1px solid #ccc; padding: 8px;"><strong>var</strong></td>
    <td style="border: 1px solid #ccc; padding: 8px;">Função</td>
    <td style="border: 1px solid #ccc; padding: 8px;">Sim (evitar)</td>
  </tr>
</table>

<h2 style="color: #0066cc;">Operadores Básicos</h2>
<pre><code>// Aritmética
let resultado = 10 + 5;   // 15
resultado = 10 - 5;       // 5
resultado = 10 * 5;       // 50
resultado = 10 / 5;       // 2
resultado = 10 % 3;       // 1 (resto)
resultado = 2 ** 3;       // 8 (exponencial)

// Comparação
5 == 5;        // true
5 === '5';     // false (compara tipo também)
5 !== 3;       // true

// Lógicos
true && false; // false (E)
true || false; // true (OU)
!true;         // false (NÃO)</code></pre>

<h2 style="color: #0066cc;">Console para Debug</h2>
<pre><code>// Abra o DevTools (F12) para ver estes logs
console.log('Mensagem');
console.warn('Aviso');
console.error('Erro');
console.table({nome: 'João', idade: 17});</code></pre>

<h2 style="color: #0066cc;">Resumo</h2>
<p>JavaScript usa variáveis, tipos de dados e operadores. Prefira <strong>const</strong> por padrão, use <strong>let</strong> quando precisar reatribuir, e evite <strong>var</strong>. O console é seu melhor amigo para debugar.</p>`,
    ordem: 1,
  },
  {
    titulo: 'Manipulação do DOM',
    slug: 'manipulacao-dom',
    descricao: 'Acessar, modificar e criar elementos HTML com JavaScript',
    conteudo: `<h2 style="color: #0066cc;">Objetivo de Aprendizagem</h2>
<p>Ao fim desta aula você será capaz de:</p>
<ul>
  <li>Selecionar elementos do DOM</li>
  <li>Modificar conteúdo, atributos e estilos</li>
  <li>Criar e remover elementos dinamicamente</li>
</ul>

<h2 style="color: #0066cc;">O que é DOM?</h2>
<p>DOM (Document Object Model) é a representação em árvore de uma página HTML. Cada elemento é um <strong>nó</strong> que pode ser manipulado via JavaScript.</p>

<h2 style="color: #0066cc;">Selecionando Elementos</h2>
<pre><code>// Selecionar por ID
const titulo = document.getElementById('titulo');

// Selecionar por classe
const cards = document.getElementsByClassName('card');

// Seletores CSS (recomendado)
const primeiro = document.querySelector('.card');  // Primeiro
const todos = document.querySelectorAll('.card');  // Todos

// Navegar na árvore
const pai = titulo.parentElement;
const filhos = titulo.children;
const primeiroFilho = titulo.firstElementChild;</code></pre>

<h2 style="color: #0066cc;">Modificar Conteúdo e Atributos</h2>
<pre><code>// Modificar texto
const paragrafo = document.querySelector('p');
paragrafo.textContent = 'Novo texto';  // Apenas texto
paragrafo.innerHTML = '&lt;strong&gt;Novo&lt;/strong&gt;';  // Com HTML

// Modificar atributos
const link = document.querySelector('a');
link.href = 'https://novo-link.com';
link.target = '_blank';
link.setAttribute('data-id', '123');

// Modificar classes
link.classList.add('ativo');
link.classList.remove('inativo');
link.classList.toggle('destaque');
link.classList.contains('ativo');  // true ou false</code></pre>

<h2 style="color: #0066cc;">Modificar Estilos</h2>
<pre><code>const botao = document.querySelector('button');

// Inline styles
botao.style.backgroundColor = '#0066cc';
botao.style.color = 'white';
botao.style.padding = '10px 20px';

// Melhor: usar classes CSS
botao.classList.add('botao-primario');</code></pre>

<h2 style="color: #0066cc;">Criar e Remover Elementos</h2>
<pre><code>// Criar novo elemento
const novoCard = document.createElement('div');
novoCard.className = 'card';
novoCard.innerHTML = '&lt;h3&gt;Novo Card&lt;/h3&gt;';

// Adicionar ao DOM
const container = document.querySelector('.container');
container.appendChild(novoCard);
container.insertBefore(novoCard, container.firstChild);

// Remover
novoCard.remove();
container.removeChild(novoCard);</code></pre>

<h2 style="color: #0066cc;">Prática: Modificar Página em Tempo Real</h2>
<pre><code>&lt;button id="btn-mudar"&gt;Mudar Título&lt;/button&gt;
&lt;h1 id="titulo"&gt;Título Original&lt;/h1&gt;

&lt;script&gt;
  const botao = document.getElementById('btn-mudar');
  const titulo = document.getElementById('titulo');

  botao.addEventListener('click', function() {
    titulo.textContent = 'Título Mudado!';
    titulo.style.color = '#0066cc';
  });
&lt;/script&gt;</code></pre>

<h2 style="color: #0066cc;">Resumo</h2>
<p>O DOM permite acessar, modificar e criar elementos. Use <strong>querySelector</strong> para seleções CSS, prefira <strong>classList</strong> para classes e combine com eventos para criar interações.</p>`,
    ordem: 2,
  },
  {
    titulo: 'Eventos e Interatividade',
    slug: 'eventos-interatividade',
    descricao: 'Responder a ações do usuário com event listeners',
    conteudo: `<h2 style="color: #0066cc;">Objetivo de Aprendizagem</h2>
<p>Ao fim desta aula você será capaz de:</p>
<ul>
  <li>Capturar eventos de clique, digitação e envio</li>
  <li>Usar event listeners de forma eficiente</li>
  <li>Trabalhar com o objeto Event</li>
</ul>

<h2 style="color: #0066cc;">O que são Eventos?</h2>
<p>Eventos são ações do usuário como clique, digitação, carregamento de página. JavaScript permite <strong>escutar e responder</strong> a estes eventos.</p>

<h2 style="color: #0066cc;">Tipos Comuns de Eventos</h2>
<table style="border-collapse: collapse; width: 100%;">
  <tr style="border: 1px solid #ccc;">
    <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Evento</th>
    <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Acionado quando</th>
  </tr>
  <tr style="border: 1px solid #ccc;">
    <td style="border: 1px solid #ccc; padding: 8px;"><strong>click</strong></td>
    <td style="border: 1px solid #ccc; padding: 8px;">Elemento é clicado</td>
  </tr>
  <tr style="border: 1px solid #ccc;">
    <td style="border: 1px solid #ccc; padding: 8px;"><strong>input</strong></td>
    <td style="border: 1px solid #ccc; padding: 8px;">Campo de texto é alterado</td>
  </tr>
  <tr style="border: 1px solid #ccc;">
    <td style="border: 1px solid #ccc; padding: 8px;"><strong>submit</strong></td>
    <td style="border: 1px solid #ccc; padding: 8px;">Formulário é enviado</td>
  </tr>
  <tr style="border: 1px solid #ccc;">
    <td style="border: 1px solid #ccc; padding: 8px;"><strong>keydown/keyup</strong></td>
    <td style="border: 1px solid #ccc; padding: 8px;">Tecla pressionada/liberada</td>
  </tr>
  <tr style="border: 1px solid #ccc;">
    <td style="border: 1px solid #ccc; padding: 8px;"><strong>mouseenter/leave</strong></td>
    <td style="border: 1px solid #ccc; padding: 8px;">Mouse entra/sai do elemento</td>
  </tr>
  <tr style="border: 1px solid #ccc;">
    <td style="border: 1px solid #ccc; padding: 8px;"><strong>load</strong></td>
    <td style="border: 1px solid #ccc; padding: 8px;">Página/imagem carregou</td>
  </tr>
</table>

<h2 style="color: #0066cc;">Event Listeners</h2>
<pre><code>const botao = document.querySelector('button');

// Forma recomendada
botao.addEventListener('click', function(event) {
  console.log('Botão foi clicado!');
  console.log(event.target);  // Elemento que disparou o evento
});

// Com arrow function
botao.addEventListener('click', (event) => {
  console.log('Clicado via arrow');
});

// Remover listener
function manipulador() {
  console.log('Clicado');
}
botao.addEventListener('click', manipulador);
botao.removeEventListener('click', manipulador);</code></pre>

<h2 style="color: #0066cc;">Objeto Event</h2>
<pre><code>const input = document.querySelector('input');

input.addEventListener('input', (event) => {
  console.log(event.target.value);  // Valor do input
  console.log(event.type);          // 'input'
  console.log(event.key);           // Tecla pressionada (keydown)
});

// Prevenir comportamento padrão
const form = document.querySelector('form');
form.addEventListener('submit', (event) => {
  event.preventDefault();  // Não recarrega a página
  console.log('Formulário enviado!');
});</code></pre>

<h2 style="color: #0066cc;">Event Delegation (Escuta em Pai)</h2>
<pre><code>// Escutar cliques em QUALQUER .item
const lista = document.querySelector('.lista');

lista.addEventListener('click', (event) => {
  if (event.target.classList.contains('item')) {
    console.log('Item clicado:', event.target.textContent);
    event.target.classList.toggle('completo');
  }
});

// Útil quando itens são adicionados dinamicamente</code></pre>

<h2 style="color: #0066cc;">Exemplo Prático: Contador</h2>
<pre><code>&lt;button id="btn-incrementar"&gt;+&lt;/button&gt;
&lt;span id="contador"&gt;0&lt;/span&gt;

&lt;script&gt;
  let contador = 0;
  const botao = document.getElementById('btn-incrementar');
  const display = document.getElementById('contador');

  botao.addEventListener('click', () => {
    contador++;
    display.textContent = contador;
  });
&lt;/script&gt;</code></pre>

<h2 style="color: #0066cc;">Resumo</h2>
<p>Use <strong>addEventListener</strong> para capturar eventos. Acesse informações do evento via objeto <strong>Event</strong>. Use event delegation para elementos dinâmicos e <strong>preventDefault()</strong> para parar comportamentos padrão.</p>`,
    ordem: 3,
  },
  {
    titulo: 'Funções e Escopo',
    slug: 'funcoes-escopo',
    descricao: 'Criar funções reutilizáveis e entender escopo de variáveis',
    conteudo: `<h2 style="color: #0066cc;">Objetivo de Aprendizagem</h2>
<p>Ao fim desta aula você será capaz de:</p>
<ul>
  <li>Declarar e chamar funções</li>
  <li>Entender escopo local e global</li>
  <li>Usar funções arrow e callbacks</li>
</ul>

<h2 style="color: #0066cc;">Declarando Funções</h2>
<pre><code>// Declaração tradicional
function saudar(nome) {
  return 'Olá, ' + nome + '!';
}

console.log(saudar('João'));  // 'Olá, João!'

// Expressão de função
const dobrar = function(numero) {
  return numero * 2;
};

console.log(dobrar(5));  // 10

// Arrow function (ES6)
const quadrado = (num) => {
  return num * num;
};

// Arrow sem chaves (retorno implícito)
const triplo = (num) => num * 3;</code></pre>

<h2 style="color: #0066cc;">Parâmetros e Argumentos</h2>
<pre><code>// Múltiplos parâmetros
function calcular(a, b, operacao) {
  if (operacao === '+') return a + b;
  if (operacao === '-') return a - b;
  if (operacao === '*') return a * b;
}

// Parâmetros padrão
function cumprimento(nome = 'Visitante') {
  console.log('Bem-vindo, ' + nome);
}

cumprimento();           // 'Bem-vindo, Visitante'
cumprimento('Maria');    // 'Bem-vindo, Maria'

// Rest parameters (...args)
function somar(...numeros) {
  let total = 0;
  for (let num of numeros) {
    total += num;
  }
  return total;
}

console.log(somar(1, 2, 3, 4));  // 10</code></pre>

<h2 style="color: #0066cc;">Escopo de Variáveis</h2>
<pre><code>// Escopo Global
let global = 'Acessível em toda página';

function minhafuncao() {
  // Escopo Local
  let local = 'Acessível apenas aqui';
  console.log(global);  // Funciona
  console.log(local);   // Funciona
}

console.log(global);  // Funciona
console.log(local);   // Erro! local não definida

// Escopo de Bloco
if (true) {
  let bloco = 'Apenas dentro do if';
}
console.log(bloco);   // Erro! bloco não definida</code></pre>

<h2 style="color: #0066cc;">Callbacks e Funções de Ordem Superior</h2>
<pre><code>// Callback: função passada como argumento
function processar(numeros, callback) {
  const resultados = [];
  for (let num of numeros) {
    resultados.push(callback(num));
  }
  return resultados;
}

const dobrados = processar([1, 2, 3], (n) => n * 2);
console.log(dobrados);  // [2, 4, 6]

// Callback em evento
const botao = document.querySelector('button');
botao.addEventListener('click', () => {
  console.log('Clicado!');
});  // Arrow function é callback aqui</code></pre>

<h2 style="color: #0066cc;">This em Funções</h2>
<pre><code>const usuario = {
  nome: 'João',
  saudar: function() {
    console.log('Olá, ' + this.nome);  // 'João'
  },
  saudarArrow: () => {
    console.log(this.nome);  // undefined (arrow não tem this)
  }
};

usuario.saudar();       // 'Olá, João'
usuario.saudarArrow();  // undefined</code></pre>

<h2 style="color: #0066cc;">Resumo</h2>
<p>Funções encapsulam lógica reutilizável. Use arrow functions para callbacks, entenda escopo de bloco com <strong>let/const</strong>, e lembre que arrow functions não têm seu próprio <strong>this</strong>.</p>`,
    ordem: 4,
  },
  {
    titulo: 'Arrays e Objetos',
    slug: 'arrays-objetos',
    descricao: 'Trabalhar com coleções de dados e objetos em JavaScript',
    conteudo: `<h2 style="color: #0066cc;">Objetivo de Aprendizagem</h2>
<p>Ao fim desta aula você será capaz de:</p>
<ul>
  <li>Criar e manipular arrays</li>
  <li>Criar objetos e acessar propriedades</li>
  <li>Usar métodos de array (map, filter, find)</li>
</ul>

<h2 style="color: #0066cc;">Arrays: Listas de Dados</h2>
<pre><code>// Criar arrays
const frutas = ['maçã', 'banana', 'laranja'];
const numeros = [1, 2, 3, 4, 5];
const misto = [1, 'texto', true, null];

// Acessar elementos
console.log(frutas[0]);      // 'maçã'
console.log(frutas.length);  // 3

// Adicionar elementos
frutas.push('melancia');     // Adiciona no final
frutas.unshift('abacaxi');   // Adiciona no início
frutas[frutas.length] = 'pera';  // Adiciona no final

// Remover elementos
frutas.pop();                // Remove último
frutas.shift();              // Remove primeiro
frutas.splice(1, 1);         // Remove a partir do índice 1</code></pre>

<h2 style="color: #0066cc;">Iterando sobre Arrays</h2>
<pre><code>const numeros = [1, 2, 3, 4, 5];

// for clássico
for (let i = 0; i < numeros.length; i++) {
  console.log(numeros[i]);
}

// for...of (recomendado)
for (let num of numeros) {
  console.log(num);
}

// forEach com callback
numeros.forEach((num, index) => {
  console.log(index + ': ' + num);
});</code></pre>

<h2 style="color: #0066cc;">Métodos de Array Importantes</h2>
<pre><code>const numeros = [1, 2, 3, 4, 5];

// map: transformar cada elemento
const dobrados = numeros.map(n => n * 2);  // [2, 4, 6, 8, 10]

// filter: manter apenas elementos que atendem condição
const pares = numeros.filter(n => n % 2 === 0);  // [2, 4]

// find: encontrar primeiro elemento
const primeiro = numeros.find(n => n > 3);  // 4

// some: verificar se algum atende condição
const temPar = numeros.some(n => n % 2 === 0);  // true

// every: verificar se todos atendem
const todosPares = numeros.every(n => n % 2 === 0);  // false

// reduce: combinar em um valor
const soma = numeros.reduce((total, n) => total + n, 0);  // 15

// includes: verificar se contém
numeros.includes(3);  // true</code></pre>

<h2 style="color: #0066cc;">Objetos: Coleções de Propriedades</h2>
<pre><code>// Criar objeto
const pessoa = {
  nome: 'João',
  idade: 17,
  cidade: 'Teófilo Otoni',
  ativo: true
};

// Acessar propriedades
console.log(pessoa.nome);       // 'João'
console.log(pessoa['idade']);   // 17

// Adicionar propriedade
pessoa.email = 'joao@email.com';

// Modificar
pessoa.idade = 18;

// Deletar
delete pessoa.ativo;

// Verificar se propriedade existe
if ('nome' in pessoa) {
  console.log('pessoa tem nome');
}</code></pre>

<h2 style="color: #0066cc;">Métodos em Objetos</h2>
<pre><code>const calculadora = {
  valor: 0,
  somar: function(n) {
    this.valor += n;
    return this.valor;
  },
  subtrair(n) {  // Sintaxe abreviada
    this.valor -= n;
    return this.valor;
  }
};

calculadora.somar(5);      // 5
calculadora.somar(3);      // 8
calculadora.subtrair(2);   // 6</code></pre>

<h2 style="color: #0066cc;">Desestruturação</h2>
<pre><code>// Desestruturação de arrays
const cores = ['vermelho', 'verde', 'azul'];
const [primeiro, segundo] = cores;
console.log(primeiro);  // 'vermelho'

// Desestruturação de objetos
const usuario = { nome: 'Maria', idade: 16 };
const { nome, idade } = usuario;
console.log(nome);  // 'Maria'

// Com valores padrão
const { cidade = 'Teófilo Otoni' } = usuario;
console.log(cidade);  // 'Teófilo Otoni'</code></pre>

<h2 style="color: #0066cc;">Resumo</h2>
<p>Arrays armazenam listas e objetos armazenam pares chave-valor. Use <strong>map</strong>, <strong>filter</strong> e <strong>reduce</strong> em vez de loops. Desestruturação torna código mais limpo.</p>`,
    ordem: 5,
  },
  {
    titulo: 'Promises e Async/Await',
    slug: 'promises-async-await',
    descricao: 'Trabalhar com código assincronismo em JavaScript moderno',
    conteudo: `<h2 style="color: #0066cc;">Objetivo de Aprendizagem</h2>
<p>Ao fim desta aula você será capaz de:</p>
<ul>
  <li>Entender Promises e seus estados</li>
  <li>Usar async/await para código mais legível</li>
  <li>Lidar com erros em código assincronismo</li>
</ul>

<h2 style="color: #0066cc;">O que é Assincronismo?</h2>
<p>Algumas operações levam tempo (buscar dados, ler arquivo). JavaScript não trava esperando, ele continua executando. <strong>Callbacks, Promises e async/await</strong> gerenciam esta espera.</p>

<h2 style="color: #0066cc;">Promises</h2>
<pre><code>// Criar uma Promise
const minhaPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('Sucesso!');
    // ou reject('Erro!');
  }, 1000);
});

// Usar a Promise
minhaPromise
  .then(resultado => {
    console.log(resultado);  // 'Sucesso!'
  })
  .catch(erro => {
    console.error(erro);
  })
  .finally(() => {
    console.log('Promise resolvida');
  });</code></pre>

<h2 style="color: #0066cc;">Estados de uma Promise</h2>
<p>Uma Promise pode estar em 3 estados:</p>
<ul>
  <li><strong>Pendente:</strong> Esperando resultado</li>
  <li><strong>Realizada (fulfilled):</strong> resolve() foi chamado</li>
  <li><strong>Rejeitada (rejected):</strong> reject() foi chamado</li>
</ul>

<h2 style="color: #0066cc;">Cadeia de Promises (.then())</h2>
<pre><code>function buscarDados() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: 1, nome: 'João' });
    }, 1000);
  });
}

buscarDados()
  .then(dados => {
    console.log('Dados recebidos:', dados);
    return dados.id;  // Passa valor para próximo then
  })
  .then(id => {
    console.log('ID:', id);
  })
  .catch(erro => {
    console.error('Erro:', erro);
  });</code></pre>

<h2 style="color: #0066cc;">Async/Await (Sintaxe Moderna)</h2>
<pre><code>// Await pausa execução até Promise resolver
async function buscarUsuario() {
  try {
    const resposta = await fetch('https://api.github.com/users/github');
    const usuario = await resposta.json();
    console.log('Usuário:', usuario.name);
    return usuario;
  } catch (erro) {
    console.error('Erro ao buscar:', erro);
  }
}

// Chamar função async
buscarUsuario();  // Retorna uma Promise</code></pre>

<h2 style="color: #0066cc;">Fetch API: Buscar Dados</h2>
<pre><code>// Buscar dados de uma API
async function buscarPosts() {
  try {
    const resposta = await fetch('https://jsonplaceholder.typicode.com/posts');
    const posts = await resposta.json();
    console.log(posts);
  } catch (erro) {
    console.error('Erro:', erro);
  }
}

// POST request
async function enviarDados() {
  const dados = { nome: 'João', email: 'joao@email.com' };

  const resposta = await fetch('https://api.example.com/usuarios', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dados)
  });

  const resultado = await resposta.json();
  console.log(resultado);
}</code></pre>

<h2 style="color: #0066cc;">Promise.all() para Múltiplas Requisições</h2>
<pre><code>// Aguardar múltiplas promises em paralelo
async function buscarVarios() {
  try {
    const [usuarios, posts, comentarios] = await Promise.all([
      fetch('https://api.example.com/usuarios').then(r => r.json()),
      fetch('https://api.example.com/posts').then(r => r.json()),
      fetch('https://api.example.com/comentarios').then(r => r.json())
    ]);

    console.log('Todos carregados!', { usuarios, posts, comentarios });
  } catch (erro) {
    console.error('Erro em uma das requisições:', erro);
  }
}</code></pre>

<h2 style="color: #0066cc;">Tratamento de Erros</h2>
<pre><code>async function operacaoComErro() {
  try {
    const resultado = await minhaFuncaoQuePodenFalhar();
    console.log(resultado);
  } catch (erro) {
    console.error('Capturou erro:', erro.message);
  } finally {
    console.log('Limpeza executada');
  }
}

// Lançar erro customizado
async function validarEmail(email) {
  if (!email.includes('@')) {
    throw new Error('Email inválido');
  }
  return email;
}</code></pre>

<h2 style="color: #0066cc;">Resumo</h2>
<p>Promises gerenciam operações assincronismos. <strong>Async/await</strong> torna o código mais legível que callbacks. Use <strong>try/catch</strong> para erros e <strong>Promise.all()</strong> para paralelizar múltiplas requisições.</p>`,
    ordem: 6,
  },
];

const desafiosJavaScript = [
  {
    titulo: 'Primeiro Script JavaScript',
    enunciado: 'Crie um script que declare variáveis (nome, idade, ativo), exiba o tipo de cada uma no console e faça cálculos simples (+, -, *).',
    tipo: 'pratico',
    gabarito: 'let nome = "João"; let idade = 17; let ativo = true; console.log(typeof nome); console.log(10 + 5);',
    ordem: 1,
    aula_index: 0,
  },
  {
    titulo: 'Modificar Página Dinamicamente',
    enunciado: 'Selecione um elemento HTML pelo ID, mude seu texto, cor de fundo, e adicione uma classe CSS. Use querySelector, textContent, style e classList.',
    tipo: 'pratico',
    gabarito: 'const elem = document.getElementById("id"); elem.textContent = "Novo"; elem.style.backgroundColor = "blue"; elem.classList.add("classe");',
    ordem: 2,
    aula_index: 1,
  },
  {
    titulo: 'Botão com Contador',
    enunciado: 'Crie um botão que, ao ser clicado, incrementa um contador e exibe o número em uma <span>. Use addEventListener, evento click e manipulação do DOM.',
    tipo: 'pratico',
    gabarito: 'let count = 0; botao.addEventListener("click", () => { count++; display.textContent = count; });',
    ordem: 3,
    aula_index: 2,
  },
  {
    titulo: 'Calculadora com Funções',
    enunciado: 'Crie funções somar(a,b), subtrair(a,b), multiplicar(a,b), dividir(a,b). Cada retorna o resultado. Teste com valores variados no console.',
    tipo: 'pratico',
    gabarito: 'const somar = (a, b) => a + b; const dividir = (a, b) => a / b; console.log(somar(10, 5));',
    ordem: 4,
    aula_index: 3,
  },
  {
    titulo: 'Filtrar e Transformar Array',
    enunciado: 'Dado array [1, 2, 3, 4, 5], use map() para dobrar valores e filter() para manter apenas pares. Exiba resultados no console.',
    tipo: 'pratico',
    gabarito: 'const nums = [1, 2, 3, 4, 5]; const dobrados = nums.map(n => n * 2); const pares = nums.filter(n => n % 2 === 0);',
    ordem: 5,
    aula_index: 4,
  },
  {
    titulo: 'Buscar Dados de API com Async/Await',
    enunciado: 'Use fetch() e async/await para buscar dados de https://jsonplaceholder.typicode.com/users e exiba 5 nomes no console. Trate erros com try/catch.',
    tipo: 'pratico',
    gabarito: 'async function buscar() { try { const resp = await fetch("..."); const data = await resp.json(); console.log(data[0].name); } catch (e) { console.error(e); } }',
    ordem: 6,
    aula_index: 5,
  },
  {
    titulo: 'Projeto Integrador: Todo List',
    enunciado: 'Crie uma aplicação TODO: input para nova tarefa, botão Adicionar, lista dinâmica com clique para completar (toggle classe) e remover (delete). Use eventos, DOM manipulation, arrays e funções.',
    tipo: 'pratico',
    gabarito: 'Implemente: adicionar tarefa com addEventListener(input+button), renderizar com .map(), toggle completo com classList, remover com .remove().',
    ordem: 7,
    aula_index: 5,
  },
];

// ========================================
// FUNÇÃO PRINCIPAL
// ========================================

async function inserirCurso() {
  try {
    console.log('🚀 Inserindo Curso JavaScript — Interatividade Web...\n');

    // 1. Inserir curso
    console.log('📚 Inserindo curso...');
    const { data: curso, error: eroCurso } = await supabase
      .from('cursos')
      .insert([cursoJavaScript])
      .select();

    if (eroCurso) throw new Error(`Erro ao inserir curso: ${eroCurso.message}`);
    const cursoId = curso[0].id;
    console.log(`✅ Curso inserido com ID: ${cursoId}\n`);

    // 2. Inserir aulas
    console.log('📖 Inserindo aulas...');
    const aulasComCursoId = aulasJavaScript.map((aula) => ({
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
    const desafiosComIds = desafiosJavaScript.map((desafio) => ({
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
    console.log('✅ CURSO JAVASCRIPT INSERIDO COM SUCESSO!');
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
inserirCurso();
