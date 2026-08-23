/**
 * Amplia o curso Programação Web com JavaScript.
 *
 *   node scripts/conteudo-javascript.mjs --aplicar
 *
 * Mesmo padrão dos anteriores. As três aulas novas cobrem o que faltava:
 * objetos (que o curso não tinha e é básico), depuração no navegador — o par da
 * aula "Achando o erro" de Lógica — e localStorage, que é o que faz o projeto
 * do aluno parar de esquecer tudo ao recarregar.
 */
import { aplicar } from './lib-conteudo.mjs'

const AMPLIACOES = {
  'javascript-a-pagina-ganha-vida': `
<h2>O que cada um faz</h2>
<table>
  <tr><th>Linguagem</th><th>Responde por</th><th>Exemplo na página</th></tr>
  <tr><td>HTML</td><td>o que existe</td><td>tem um botão e uma lista</td></tr>
  <tr><td>CSS</td><td>como aparece</td><td>o botão é vermelho e arredondado</td></tr>
  <tr><td>JavaScript</td><td>o que acontece</td><td>clicar no botão acrescenta um item</td></tr>
</table>
<p>A confusão comum é achar que JavaScript substitui os outros dois. Não substitui: ele age
<strong>sobre</strong> o que o HTML criou. Sem estrutura para manipular, não há o que fazer.</p>

<h2>Nem tudo precisa de JavaScript</h2>
<p>Iniciante costuma resolver com JS o que HTML e CSS já fazem sozinhos — e o resultado é mais
código, mais lento e menos acessível:</p>
<table>
  <tr><th>Quero</th><th>Não precisa de JS</th></tr>
  <tr><td>Menu que abre no hover</td><td><code>:hover</code> no CSS</td></tr>
  <tr><td>Campo obrigatório</td><td><code>required</code> no HTML</td></tr>
  <tr><td>Rolagem suave até uma seção</td><td><code>scroll-behavior: smooth</code></td></tr>
  <tr><td>Sanfona que abre e fecha</td><td><code>&lt;details&gt;</code> e <code>&lt;summary&gt;</code></td></tr>
</table>
<p>A regra prática: <strong>se HTML ou CSS resolvem, use-os</strong>. Sobra JavaScript para o que
realmente exige lógica — calcular, decidir, buscar dados, reagir a uma sequência de ações.</p>

<h2>Faça agora</h2>
<p>Abra um site que você usa e desligue o JavaScript nas configurações do navegador. Recarregue.
O que parou de funcionar? O que continuou? Isso mostra na prática o que é responsabilidade de cada
camada — e por que uma página que não faz nada sem JS exclui quem está numa conexão ruim.</p>
`,

  'ligando-o-js-ao-html-script-e-console': `
<h2>Onde colocar o script</h2>
<pre><code>&lt;!-- roda antes de a página existir: document.querySelector devolve null --&gt;
&lt;head&gt;
  &lt;script src="app.js"&gt;&lt;/script&gt;
&lt;/head&gt;

&lt;!-- funciona, e é a forma antiga --&gt;
&lt;body&gt;
  ...
  &lt;script src="app.js"&gt;&lt;/script&gt;
&lt;/body&gt;

&lt;!-- a forma de hoje: baixa junto e executa depois que o HTML terminou --&gt;
&lt;head&gt;
  &lt;script src="app.js" defer&gt;&lt;/script&gt;
&lt;/head&gt;</code></pre>
<p>O <code>defer</code> resolve o dilema: o arquivo começa a baixar cedo, mas só executa quando a
página está montada. É a origem do erro mais comum de quem começa —
<em>"Cannot read properties of null"</em> — que quase sempre significa que o script rodou antes de
o elemento existir.</p>

<h2>O console faz mais que log</h2>
<table>
  <tr><th>Comando</th><th>Serve para</th></tr>
  <tr><td><code>console.log(x)</code></td><td>ver um valor</td></tr>
  <tr><td><code>console.table(lista)</code></td><td>ver um array de objetos em tabela — muito melhor que log</td></tr>
  <tr><td><code>console.error(msg)</code></td><td>destacar em vermelho</td></tr>
  <tr><td><code>console.log({ nome, idade })</code></td><td>mostra o NOME junto do valor: <code>{nome: "Ana", idade: 16}</code></td></tr>
</table>
<p>O último truque economiza tempo real: com cinco <code>console.log</code> na tela, você não sabe
qual é qual. Envolvendo em chaves, cada um se identifica.</p>

<h2>Faça agora</h2>
<p>Abra o console (F12) em qualquer site e digite <code>document.title</code>. Depois
<code>document.title = "Mudei"</code> e olhe a aba. Você acabou de alterar a página de outra pessoa
— só na sua tela, e até recarregar. É o que o JavaScript faz o tempo todo.</p>
`,

  'variaveis-e-tipos-do-pseudocodigo-pro-js': `
<h2>let, const e o var que não se usa mais</h2>
<pre><code>const nome = "Ana"      // não vai ser trocada
let pontos = 0          // vai mudar ao longo do programa
var antigo = "..."      // forma antiga, evite</code></pre>
<p>A regra que os projetos seguem hoje: <strong>use <code>const</code> por padrão</strong> e troque
para <code>let</code> só quando precisar reatribuir. Isso deixa evidente, na leitura, o que muda e o
que não muda.</p>
<p>O <code>var</code> tem um comportamento que confunde — ele vaza do bloco em que foi declarado — e
por isso saiu de uso. Você vai encontrá-lo em código antigo; não precisa escrevê-lo.</p>

<h2>O erro que dá mais dor de cabeça em JavaScript</h2>
<pre><code>"5" == 5     // true  — converte antes de comparar
"5" === 5    // false — compara valor E tipo
0 == false   // true
0 === false  // false
null == undefined   // true</code></pre>
<p>O <code>==</code> converte os dois lados antes de comparar, e as regras dessa conversão têm casos
que ninguém decora. Isso produz bug silencioso: o programa não quebra, só decide errado.</p>
<p>A regra é simples e sem exceção prática: <strong>use sempre <code>===</code> e
<code>!==</code></strong>. Se precisar comparar tipos diferentes, converta você mesmo, de
propósito.</p>

<h2>De onde vem o texto que parece número</h2>
<pre><code>const idade = document.querySelector("#idade").value   // "16", com aspas
idade + 1        // "161"
Number(idade) + 1  // 17</code></pre>
<p>Tudo que vem de um campo de formulário chega como texto — igualzinho ao <code>input</code> do
Python e ao <code>leia</code> do pseudocódigo. É o mesmo conceito em outra roupa, e o conserto
também: converter na entrada.</p>

<h2>Faça agora</h2>
<p>No console, teste estas comparações e anote qual dá <code>true</code>:
<code>"" == 0</code>, <code>"" === 0</code>, <code>[] == false</code>, <code>"0" == false</code>.
Depois refaça todas com <code>===</code>. A diferença entre as duas listas é o motivo da regra.</p>
`,

  'funcoes-e-eventos-o-clique-que-faz-acontecer': `
<h2>addEventListener, e não onclick no HTML</h2>
<pre><code>&lt;!-- mistura comportamento com estrutura --&gt;
&lt;button onclick="calcular()"&gt;Calcular&lt;/button&gt;

&lt;!-- HTML limpo, comportamento no JS --&gt;
&lt;button id="btn-calcular"&gt;Calcular&lt;/button&gt;</code></pre>
<pre><code>document.querySelector("#btn-calcular")
        .addEventListener("click", calcular);</code></pre>
<p>Além de separar as camadas, o <code>addEventListener</code> permite mais de uma reação para o
mesmo evento — com <code>onclick</code>, a segunda apaga a primeira.</p>

<h2>Chamar a função, ou passar a função</h2>
<pre><code>botao.addEventListener("click", calcular)     // certo: passa a função
botao.addEventListener("click", calcular())   // errado: CHAMA agora e passa o resultado</code></pre>
<p>Os parênteses executam. Com eles, a função roda na hora em que a linha é lida — antes de qualquer
clique — e o que fica registrado é o retorno dela, geralmente <code>undefined</code>.</p>
<p>Sintoma típico: "a função executa sozinha quando a página abre, e o botão não faz nada". São os
dois parênteses.</p>

<h2>Quando precisa passar argumento</h2>
<pre><code>botao.addEventListener("click", () =&gt; remover(item.id));</code></pre>
<p>A função de seta embrulha a chamada: o que se registra é a seta, e ela é que chama
<code>remover</code> quando o clique acontece.</p>

<h2>O formulário que recarrega a página</h2>
<pre><code>form.addEventListener("submit", (evento) =&gt; {
  evento.preventDefault();   // sem isto, a página recarrega e você perde tudo
  // ... seu código
});</code></pre>
<p>O comportamento padrão do formulário é enviar e recarregar. Quando o seu cálculo aparece por um
instante e some, é isso — falta o <code>preventDefault</code>.</p>

<h2>Faça agora</h2>
<p>Monte um botão que conta cliques e mostra o total. Depois escreva
<code>addEventListener("click", contar())</code> com parênteses de propósito e recarregue: veja a
função executar sozinha e o botão parar de responder. Reconhecer esse sintoma economiza horas.</p>
`,

  'dom-mexendo-na-pagina-de-verdade': `
<h2>textContent e innerHTML: a diferença importa</h2>
<pre><code>const nome = "&lt;img src=x onerror=alert('invadido')&gt;";

elemento.innerHTML = nome;    // o navegador EXECUTA isso
elemento.textContent = nome;  // mostra como texto, literalmente</code></pre>
<p>O <code>innerHTML</code> interpreta o que recebe como HTML. Se o conteúdo veio de um campo que o
usuário preencheu, ele pode injetar código que roda na sua página, com acesso ao que a pessoa
digitou ali. Esse ataque tem nome — XSS — e é um dos mais comuns da web.</p>
<p>A regra: <strong>texto que veio do usuário vai sempre em <code>textContent</code></strong>. Use
<code>innerHTML</code> apenas com HTML que você mesmo escreveu.</p>

<h2>Escolhendo elementos</h2>
<table>
  <tr><th>Comando</th><th>Devolve</th></tr>
  <tr><td><code>querySelector(".item")</code></td><td>o primeiro que casar, ou <code>null</code></td></tr>
  <tr><td><code>querySelectorAll(".item")</code></td><td>todos, numa lista percorrível</td></tr>
  <tr><td><code>getElementById("x")</code></td><td>o do id, ou <code>null</code></td></tr>
</table>
<p>O <code>querySelector</code> aceita qualquer seletor de CSS — <code>"#menu .item:first-child"</code>
funciona. Como você já conhece seletores do CSS, não há sintaxe nova para aprender.</p>

<h2>Criar elemento sem montar string</h2>
<pre><code>// funciona, e é frágil: um erro de aspas quebra tudo
lista.innerHTML += "&lt;li class='item'&gt;" + nome + "&lt;/li&gt;";

// mais seguro e mais legível
const li = document.createElement("li");
li.className = "item";
li.textContent = nome;
lista.appendChild(li);</code></pre>
<p>Há outro motivo além da segurança: <code>innerHTML +=</code> reconstrói a lista inteira a cada
item, e apaga os eventos já registrados nos elementos que existiam.</p>

<h2>Faça agora</h2>
<p>Crie um campo de texto e um botão que acrescenta o que foi digitado numa lista. Faça primeiro com
<code>innerHTML</code> e digite <code>&lt;b&gt;teste&lt;/b&gt;</code>: vai aparecer em negrito. Troque
para <code>textContent</code> e repita: agora aparece a tag escrita. A segunda é a correta.</p>
`,

  'condicionais-e-lacos-dentro-da-pagina': `
<h2>O laço que trava a página</h2>
<pre><code>while (true) {
  // sem nada que mude a condição
}</code></pre>
<p>Em JavaScript isso é pior do que em pseudocódigo: o navegador congela a aba inteira, porque o JS
divide a mesma linha de execução com o desenho da tela. O botão não responde, a rolagem não mexe, e
só resta fechar a aba.</p>
<p>A mesma pergunta de sempre: o que aqui dentro vai fazer a condição virar falsa?</p>

<h2>As três formas de percorrer</h2>
<pre><code>// clássico: quando você precisa do índice
for (let i = 0; i &lt; itens.length; i++) { … }

// para cada valor — o mais legível
for (const item of itens) { … }

// método do array, quando você já vai transformar
itens.forEach(item =&gt; { … });</code></pre>
<p>Escolha o segundo por padrão. O primeiro só quando o índice importa de verdade — e aí lembre que
JavaScript conta do zero, e que <code>i &lt;= itens.length</code> estoura o último.</p>

<h2>Valores que valem falso</h2>
<pre><code>if (valor) { … }   // não é "se valor existe"</code></pre>
<p>Estes seis contam como falso: <code>false</code>, <code>0</code>, <code>""</code>,
<code>null</code>, <code>undefined</code>, <code>NaN</code>. Isso significa que o número zero e o
texto vazio caem no <code>else</code> — e é um bug comum em campo de quantidade, onde zero é
resposta válida.</p>
<pre><code>if (quantidade) { … }            // 0 cai no else
if (quantidade !== undefined) { … }  // diz o que se quer dizer</code></pre>

<h2>Faça agora</h2>
<p>No console, teste <code>if ("0") console.log("verdadeiro")</code> e depois
<code>if (0) console.log("verdadeiro")</code>. O texto "0" é verdadeiro, o número 0 é falso. Guarde
esse par: é a origem de muito comportamento estranho em formulário.</p>
`,

  'arrays-a-lista-que-vira-html': `
<h2>Os três métodos que substituem quase todo laço</h2>
<pre><code>const precos = [10, 25, 8, 40];

precos.map(p =&gt; p * 2)          // [20, 50, 16, 80]  — transforma cada um
precos.filter(p =&gt; p &gt; 10)      // [25, 40]          — seleciona alguns
precos.reduce((a, b) =&gt; a + b)  // 83                — reduz a um valor só</code></pre>
<table>
  <tr><th>Quero</th><th>Uso</th></tr>
  <tr><td>a mesma lista, transformada</td><td><code>map</code></td></tr>
  <tr><td>uma lista menor</td><td><code>filter</code></td></tr>
  <tr><td>um número só: total, média, maior</td><td><code>reduce</code></td></tr>
  <tr><td>fazer algo com cada um, sem gerar lista</td><td><code>forEach</code></td></tr>
</table>
<p><code>map</code> e <code>filter</code> devolvem uma lista <strong>nova</strong> — a original
continua intacta. É por isso que dá para encadear:
<code>precos.filter(p =&gt; p &gt; 10).map(p =&gt; p * 0.9)</code>.</p>

<h2>Da lista para a tela, em uma expressão</h2>
<pre><code>const itens = ["Pizza", "Refrigerante", "Sobremesa"];

lista.innerHTML = itens
  .map(item =&gt; \`&lt;li&gt;\${item}&lt;/li&gt;\`)
  .join("");</code></pre>
<p>O <code>join("")</code> é obrigatório: sem ele, o array vira texto com vírgulas entre os itens.</p>
<p>E vale o aviso da aula de DOM — isto só é seguro porque os itens vêm de uma lista que você
escreveu. Com texto digitado por usuário, monte com <code>createElement</code> e
<code>textContent</code>.</p>

<h2>O erro de esperar retorno do forEach</h2>
<pre><code>const dobro = precos.forEach(p =&gt; p * 2);   // undefined
const dobro = precos.map(p =&gt; p * 2);       // a lista nova</code></pre>
<p><code>forEach</code> percorre e não devolve nada. Quando o resultado sair <code>undefined</code>
sem motivo aparente, verifique se não era um <code>map</code>.</p>

<h2>Faça agora</h2>
<p>Com uma lista de preços, calcule o total com <code>reduce</code>, a lista dos que passam de 20
com <code>filter</code>, e a lista com 10% de desconto usando <code>map</code>. Depois faça o mesmo
total com um <code>for</code> clássico e compare as duas versões: qual você entende mais rápido
daqui a um mês?</p>
`,

  'formularios-e-validacao-com-js': `
<h2>Validar no navegador não é segurança</h2>
<p>Toda validação que você escreve em JavaScript roda no computador de quem usa — e quem usa pode
desligar o JavaScript, editar o código pelo console ou enviar os dados direto, sem passar pela sua
página.</p>
<p>Isso não torna a validação inútil: ela existe para <strong>ajudar quem preenche</strong>,
mostrando o erro na hora, sem esperar o servidor. Mas a validação que <em>protege</em> acontece no
servidor, e essa você vai escrever no curso de PHP.</p>
<blockquote>Regra que vale para sempre: nunca confie em dado que veio do navegador.</blockquote>

<h2>Aproveitar o que o HTML já valida</h2>
<pre><code>if (!form.checkValidity()) {
  form.reportValidity();   // mostra as mensagens do próprio navegador
  return;
}</code></pre>
<p>Se você já escreveu <code>required</code>, <code>type="email"</code> e <code>pattern</code> no
HTML, essas duas linhas aproveitam tudo. Só escreva validação manual para o que o HTML não cobre —
como "a data final precisa ser depois da inicial".</p>

<h2>A mensagem no lugar certo</h2>
<pre><code>function mostrarErro(campo, mensagem) {
  const alvo = document.querySelector(\`#erro-\${campo.id}\`);
  alvo.textContent = mensagem;
  campo.setAttribute("aria-invalid", "true");
  campo.setAttribute("aria-describedby", alvo.id);
}</code></pre>
<p>Três detalhes que fazem diferença para quem usa leitor de tela: a mensagem fica
<strong>ao lado do campo</strong>, e não num alerta no topo; <code>aria-invalid</code> marca o campo
como inválido; e <code>aria-describedby</code> liga a mensagem ao campo, para ela ser lida junto.</p>
<p>E nunca use <code>alert()</code> para erro de formulário: ele bloqueia a página, não diz qual
campo está errado e some quando a pessoa fecha.</p>

<h2>Faça agora</h2>
<p>Monte um formulário com validação em JS, preencha errado e veja a mensagem. Depois abra o console
e digite <code>document.querySelector("form").noValidate = true</code> — a validação some. Isso é
tudo que alguém precisa fazer para contorná-la, e é a razão de o servidor validar de novo.</p>
`,

  'projeto-parte-1-o-cardapio-aparece-na-tela': `
<h2>Separar dado de apresentação</h2>
<pre><code>// o dado, em um lugar só
const cardapio = [
  { id: 1, nome: "Pizza grande",  preco: 45.00 },
  { id: 2, nome: "Refrigerante",  preco:  8.00 },
  { id: 3, nome: "Sobremesa",     preco: 12.00 },
];

// a função que desenha, sem saber de onde veio o dado
function desenharCardapio(itens) { … }</code></pre>
<p>Com essa separação, trocar o cardápio é mexer numa lista — e trocar a aparência é mexer numa
função. Quando os dois estão embolados, qualquer mudança arrisca quebrar a outra parte.</p>
<p>É também o caminho natural para o passo seguinte: quando o cardápio vier de um banco de dados,
só a origem da lista muda; a função que desenha continua igual.</p>

<h2>Uma função, uma responsabilidade</h2>
<table>
  <tr><th>Função</th><th>Faz</th></tr>
  <tr><td><code>desenharCardapio()</code></td><td>mostra a lista na tela</td></tr>
  <tr><td><code>adicionarAoPedido(id)</code></td><td>acrescenta um item</td></tr>
  <tr><td><code>calcularTotal()</code></td><td>devolve o valor, sem mostrar nada</td></tr>
  <tr><td><code>atualizarTela()</code></td><td>redesenha o que mudou</td></tr>
</table>
<p>O mesmo sinal da aula de funções em Lógica: se você não consegue nomear a função sem usar "e",
ela faz coisa demais.</p>

<h2>Faça agora</h2>
<p>Antes de escrever qualquer linha, desenhe no papel: que dados o projeto guarda, que funções
existem e quem chama quem. Cinco minutos de rascunho evitam a reescrita do meio do caminho.</p>
`,

  'projeto-parte-2-pedido-total-e-troco': `
<h2>Dinheiro e a conta que não fecha</h2>
<pre><code>0.1 + 0.2        // 0.30000000000000004</code></pre>
<p>Isso não é bug do JavaScript: é como todo computador guarda número com casa decimal. Aparece na
hora de somar preços, e o total sai com doze casas.</p>
<p>Duas saídas. Para exibir, formate:</p>
<pre><code>total.toFixed(2)                               // "83.00"
total.toLocaleString("pt-BR", {
  style: "currency", currency: "BRL"
})                                             // "R$ 83,00"</code></pre>
<p>Para calcular com precisão, o jeito profissional é trabalhar em <strong>centavos</strong>, com
números inteiros, e dividir por 100 só na hora de mostrar. Sistema de comércio de verdade faz
assim.</p>

<h2>O troco e a validação que falta</h2>
<pre><code>const troco = pago - total;

if (pago &lt; total) {
  mostrarErro("Valor pago é menor que o total.");
  return;
}</code></pre>
<p>Sem essa verificação, o programa mostra troco negativo e ninguém percebe. É o "dado impossível"
da aula de Lógica: teste o seu projeto pagando menos que o total, pagando exatamente o total e
digitando letra no lugar de número.</p>

<h2>Antes de dar por pronto</h2>
<ul>
  <li>Pedido vazio: o total mostra R$ 0,00 ou dá erro?</li>
  <li>Adicionar o mesmo item duas vezes: soma quantidade ou duplica a linha?</li>
  <li>Remover o último item: a lista fica vazia sem quebrar?</li>
  <li>Recarregar a página: perde tudo? (a próxima aula resolve isso)</li>
</ul>

<h2>Faça agora</h2>
<p>Some no console <code>0.1 + 0.2</code> e depois <code>(0.1 * 100 + 0.2 * 100) / 100</code>.
A segunda dá 0.3 certinho. É a técnica dos centavos, em uma linha.</p>
`,
}

const NOVAS = [
  {
    curso: 'programacao-web-javascript',
    slug: 'objetos-dados-que-andam-juntos',
    titulo: 'Objetos: dados que andam juntos',
    min: 7, ordem: 8,
    descricao: 'Guardar informação com nome, e não em listas paralelas.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Criar e usar objetos</li>
  <li>Trabalhar com listas de objetos, que é o formato de todo dado real</li>
  <li>Evitar o erro de manter vetores paralelos</li>
</ul>

<h2>O problema dos vetores paralelos</h2>
<p>Na aula de vetores, em Lógica, guardamos nome num vetor e nota em outro, na mesma posição:</p>
<pre><code>const nomes = ["Ana", "Bruno", "Carla"];
const notas = [8.5, 5.0, 9.5];
// nomes[1] e notas[1] são da mesma pessoa — por convenção, e só</code></pre>
<p>Funciona até alguém ordenar um dos dois. Aí o Bruno fica com a nota da Carla, e nada acusa: os
dois vetores continuam válidos, só perderam a correspondência.</p>
<p>O objeto resolve juntando o que pertence junto:</p>
<pre><code>const aluno = { nome: "Ana", nota: 8.5, turma: "3A" };

aluno.nome        // "Ana"
aluno.nota = 9.0  // muda
aluno.turno = "manhã"   // acrescenta</code></pre>

<h2>Lista de objetos: o formato de todo dado real</h2>
<pre><code>const turma = [
  { nome: "Ana",   nota: 8.5 },
  { nome: "Bruno", nota: 5.0 },
  { nome: "Carla", nota: 9.5 },
];

turma.forEach(a =&gt; console.log(\`\${a.nome}: \${a.nota}\`));

const aprovados = turma.filter(a =&gt; a.nota &gt;= 6);
const media = turma.reduce((s, a) =&gt; s + a.nota, 0) / turma.length;</code></pre>
<p>Ordenar agora é seguro, porque cada objeto carrega os próprios dados:</p>
<pre><code>turma.sort((a, b) =&gt; b.nota - a.nota);   // do maior para o menor</code></pre>
<p>Esta é a forma em que os dados chegam quando vêm de um banco, de um arquivo ou de uma API. Ficar
à vontade com ela vale mais do que decorar métodos.</p>

<h2>Objeto dentro de objeto</h2>
<pre><code>const pedido = {
  cliente: { nome: "Ana", telefone: "33 99999-0000" },
  itens: [
    { nome: "Pizza", preco: 45, quantidade: 1 },
    { nome: "Refri", preco: 8,  quantidade: 2 },
  ],
};

pedido.cliente.nome        // "Ana"
pedido.itens[1].quantidade // 2
pedido.itens.length        // 2</code></pre>
<p>Leia da esquerda para a direita, um nível por vez. É a mesma ideia de pasta dentro de pasta.</p>

<h2>O erro do encadeamento</h2>
<pre><code>pedido.entrega.rua    // TypeError: Cannot read properties of undefined</code></pre>
<p>Se <code>entrega</code> não existe, ela vale <code>undefined</code> — e pedir <code>rua</code> de
<code>undefined</code> quebra o programa. É a mensagem de erro mais comum em JavaScript.</p>
<pre><code>pedido.entrega?.rua    // undefined, sem quebrar</code></pre>
<p>A interrogação para o encadeamento se o valor anterior não existir. Use quando o dado
<strong>pode</strong> faltar — vindo de formulário, de API, de armazenamento.</p>

<h2>Copiar objeto não é o que parece</h2>
<pre><code>const a = { nome: "Ana" };
const b = a;
b.nome = "Bruno";
console.log(a.nome);   // "Bruno" — mudou os dois!

const c = { ...a };    // cópia de verdade
c.nome = "Carla";
console.log(a.nome);   // continua "Bruno"</code></pre>
<p>Objeto guarda uma referência, não o conteúdo. <code>const b = a</code> cria outro nome para a
mesma coisa. Os três pontos criam um objeto novo com os mesmos campos — e é por isso que você vai
vê-los em quase todo código moderno.</p>

<h2>Faça agora</h2>
<p>Refaça o cardápio do projeto como lista de objetos, cada um com <code>id</code>,
<code>nome</code> e <code>preco</code>. Depois use <code>filter</code> para mostrar só os itens
abaixo de R$ 20 e <code>sort</code> para listar do mais barato ao mais caro — duas linhas que, com
vetores paralelos, seriam um problema.</p>
`,
    desafio: {
      titulo: 'A turma como lista de objetos',
      enunciado: `<p>Monte um array com cinco alunos, cada um um objeto com <code>nome</code>, <code>turma</code> e um array de três <code>notas</code>.</p>
<p>Usando os métodos de array, e sem escrever nenhum <code>for</code>:</p>
<ul>
  <li>Mostre nome e média de cada aluno</li>
  <li>Liste só os aprovados (média 6 ou mais)</li>
  <li>Calcule a média da turma</li>
  <li>Ordene do maior para o menor e mostre o primeiro colocado</li>
  <li>Mostre a turma inteira com <code>console.table</code></li>
</ul>
<p>Depois acrescente um aluno <strong>sem</strong> o campo <code>turma</code> e faça o programa
continuar funcionando, mostrando "turma não informada". A solução usa o encadeamento opcional ou um
valor padrão — as duas valem.</p>`,
    },
  },
  {
    curso: 'programacao-web-javascript',
    slug: 'depurando-no-navegador',
    titulo: 'Depurando no navegador',
    min: 6, ordem: 9,
    descricao: 'Parar o programa no meio e olhar por dentro, em vez de encher de console.log.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Ler a mensagem de erro do console e chegar à linha certa</li>
  <li>Parar a execução num ponto e inspecionar as variáveis</li>
  <li>Reconhecer os três erros que mais aparecem em JavaScript</li>
</ul>

<h2>A aba Console é a primeira parada</h2>
<p>Quando algo não funciona, F12 e Console, antes de qualquer coisa. Se houver erro, ele está lá em
vermelho — com o arquivo e a linha à direita, clicáveis.</p>
<p>Um detalhe que engana: a linha indicada é <strong>onde o erro estourou</strong>, não
necessariamente onde ele nasceu. Uma variável que ficou <code>undefined</code> na linha 10 só quebra
na 40, quando alguém tenta usá-la.</p>

<h2>Os três erros mais comuns, e o que cada um significa</h2>
<table>
  <tr><th>Mensagem</th><th>Quer dizer</th><th>Onde olhar</th></tr>
  <tr><td>Cannot read properties of null</td><td>o <code>querySelector</code> não achou o elemento</td><td>o seletor está errado, ou o script rodou antes do HTML (falta <code>defer</code>)</td></tr>
  <tr><td>… is not a function</td><td>você chamou algo que não é função</td><td>erro de digitação no nome, ou a variável foi sobrescrita</td></tr>
  <tr><td>… is not defined</td><td>a variável não existe ali</td><td>escrita diferente, ou declarada dentro de outro bloco</td></tr>
</table>
<p>Os três somam a maioria esmagadora dos travamentos de quem está começando. Reconhecer a mensagem
já entrega metade da solução.</p>

<h2>Parar o programa no meio</h2>
<p><code>console.log</code> resolve muita coisa, mas tem limite: você só vê o que pediu, e precisa
rodar de novo a cada dúvida nova. O ponto de parada resolve isso.</p>
<ol>
  <li>F12 → aba <strong>Sources</strong> (ou Depurador)</li>
  <li>Abra o seu arquivo <code>.js</code></li>
  <li>Clique no <strong>número da linha</strong> onde quer parar</li>
  <li>Recarregue ou dispare a ação</li>
</ol>
<p>O programa congela naquela linha. À direita aparecem todas as variáveis com os valores daquele
instante — e você pode passar o mouse sobre qualquer uma no código para ver o conteúdo.</p>
<table>
  <tr><th>Botão</th><th>Faz</th></tr>
  <tr><td>Continuar</td><td>segue até o próximo ponto de parada</td></tr>
  <tr><td>Passo a passo</td><td>executa a próxima linha e para de novo</td></tr>
  <tr><td>Entrar na função</td><td>segue para dentro da função chamada</td></tr>
</table>
<p>É o teste de mesa da aula de Lógica, feito pelo próprio navegador — com a diferença de que aqui
os valores são os reais, não os que você imaginou.</p>

<h2>Parar sem clicar</h2>
<pre><code>function calcularTotal(itens) {
  debugger;      // para aqui, se as ferramentas estiverem abertas
  …
}</code></pre>
<p>A palavra <code>debugger</code> no código faz o mesmo que o clique na margem. Útil dentro de
código que só roda em certa condição. Só não esqueça de apagar — em produção, ela trava a página de
quem tiver o F12 aberto.</p>

<h2>Ver o que está chegando</h2>
<p>Antes de suspeitar da sua lógica, confirme o que entrou:</p>
<pre><code>function calcular(valor) {
  console.log({ valor, tipo: typeof valor });
  …
}</code></pre>
<p>Metade dos bugs de JavaScript é dado que chegou diferente do esperado: o texto <code>"16"</code>
onde se esperava o número <code>16</code>, o <code>null</code> onde se esperava o elemento, a lista
vazia onde se esperava conteúdo. O <code>typeof</code> revela isso em uma linha.</p>

<h2>Faça agora</h2>
<p>Pegue um projeto seu e coloque um ponto de parada dentro da função que calcula alguma coisa.
Dispare a ação e percorra linha por linha, olhando os valores mudarem no painel da direita. Depois
compare com o tempo que você levaria fazendo o mesmo com <code>console.log</code>.</p>
`,
    desafio: {
      titulo: 'Três bugs, três causas',
      enunciado: `<p>Cada trecho abaixo quebra. Para cada um: <strong>qual mensagem</strong> o console mostra, <strong>por quê</strong>, e <strong>como corrigir</strong>.</p>
<pre><code>// A — o script está no &lt;head&gt;, sem defer
const botao = document.querySelector("#enviar");
botao.addEventListener("click", enviar);</code></pre>
<pre><code>// B
const precos = [10, 20, 30];
const total = precos.reduce((a, b) =&gt; a + b);
console.log(total.toFixed());
const media = total.calcular();</code></pre>
<pre><code>// C
function somar() {
  let resultado = 2 + 2;
}
somar();
console.log(resultado);</code></pre>
<p>Reproduza os três num arquivo, veja as mensagens de verdade no console e entregue-as copiadas —
não escritas de memória. Ler a mensagem exata é o hábito que o exercício treina.</p>`,
    },
  },
  {
    curso: 'programacao-web-javascript',
    slug: 'a-pagina-que-lembra',
    titulo: 'A página que lembra: localStorage',
    min: 6, ordem: 12,
    descricao: 'Guardar dados no navegador para não perder tudo ao recarregar.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Guardar e recuperar dados no navegador</li>
  <li>Salvar objetos e listas, não só texto</li>
  <li>Saber o que NÃO se guarda ali</li>
</ul>

<h2>O problema</h2>
<p>Seu projeto do cardápio funciona: adiciona itens, calcula o total, mostra o troco. Aí a pessoa
recarrega a página, e tudo some. Toda variável mora na memória, e a memória se apaga a cada
recarga.</p>
<p>O <code>localStorage</code> é uma gavetinha que o navegador guarda por site, e que sobrevive a
recarga, a fechar a aba e até a desligar o computador.</p>

<h2>Os quatro comandos</h2>
<pre><code>localStorage.setItem("nome", "Ana");    // guarda
localStorage.getItem("nome");           // lê: "Ana"
localStorage.removeItem("nome");        // apaga um
localStorage.clear();                   // apaga tudo do site</code></pre>
<p>Se a chave não existe, <code>getItem</code> devolve <code>null</code> — e não dá erro. Por isso
sempre se testa antes de usar.</p>

<h2>Só guarda texto</h2>
<pre><code>const pedido = [{ nome: "Pizza", preco: 45 }];

localStorage.setItem("pedido", pedido);
localStorage.getItem("pedido");    // "[object Object]" — o dado se perdeu</code></pre>
<p>A gaveta guarda texto e nada mais. Para objetos e listas, converte-se antes:</p>
<pre><code>// ao salvar: objeto vira texto
localStorage.setItem("pedido", JSON.stringify(pedido));

// ao ler: texto vira objeto
const salvo = JSON.parse(localStorage.getItem("pedido"));</code></pre>
<p>Esse par — <code>stringify</code> para guardar, <code>parse</code> para ler — é a forma padrão, e
o JSON vai reaparecer em toda comunicação com servidor daqui em diante.</p>

<h2>Ler com segurança</h2>
<pre><code>function carregarPedido() {
  const texto = localStorage.getItem("pedido");
  if (!texto) return [];          // primeira visita: lista vazia

  try {
    return JSON.parse(texto);
  } catch {
    localStorage.removeItem("pedido");   // dado corrompido: descarta
    return [];
  }
}</code></pre>
<p>Duas defesas em cinco linhas: a chave pode não existir, e o conteúdo pode estar corrompido — se
a página foi fechada no meio da gravação, por exemplo. Sem o <code>try</code>, o
<code>JSON.parse</code> quebra e a página inteira para de funcionar.</p>

<h2>O que NÃO se guarda ali</h2>
<table>
  <tr><th>Não guarde</th><th>Por quê</th></tr>
  <tr><td>Senha</td><td>qualquer script da página lê, e fica em texto puro no computador</td></tr>
  <tr><td>Dado de cartão</td><td>o mesmo, com consequência pior</td></tr>
  <tr><td>Dado pessoal de outra pessoa</td><td>fica no computador de quem usou, sem controle</td></tr>
  <tr><td>Coisa grande</td><td>o limite é de cerca de 5 MB por site</td></tr>
</table>
<p>Guarde preferência, rascunho, carrinho, tema escolhido — coisas que, se alguém ler, não causam
dano. O que é sensível fica no servidor.</p>

<h2>Faça agora</h2>
<p>Abra qualquer site que você usa, F12 → Application (ou Armazenamento) → Local Storage. Olhe o que
está guardado ali. Você vai encontrar preferências, identificadores e às vezes coisas que
surpreendem — e é exatamente por isso que senha não entra nessa lista.</p>
`,
    desafio: {
      titulo: 'O pedido que sobrevive à recarga',
      enunciado: `<p>Faça o projeto do cardápio guardar o pedido no <code>localStorage</code>.</p>
<ul>
  <li>Ao adicionar ou remover item, o pedido é salvo</li>
  <li>Ao abrir a página, o pedido é recuperado e a tela já aparece preenchida</li>
  <li>Um botão "Limpar pedido" apaga da tela e do armazenamento</li>
  <li>A leitura trata os dois casos: chave inexistente e conteúdo corrompido</li>
</ul>
<p>Teste assim: monte um pedido, recarregue — tem de continuar lá. Depois abra o F12 → Application,
edite o valor guardado à mão, deixando um texto inválido, e recarregue de novo. A página precisa
abrir vazia, não quebrar. É esse segundo teste que separa o código que funciona do código que
aguenta.</p>`,
    },
  },
]

await aplicar({ AMPLIACOES, NOVAS })
