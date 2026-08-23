/**
 * Amplia o curso de Lógica de Programação.
 *
 *   node scripts/conteudo-logica.mjs --aplicar
 *
 * Mesmo padrão do módulo de HTML e CSS, e mesmo tom do que já existia aqui:
 * pseudocódigo em português, exemplo da vida de Carlos Chagas, e o erro comum
 * explicado ANTES de o aluno cair nele.
 *
 * O curso NÃO foi dividido em partes. Em HTML e CSS a divisão resolvia um
 * problema real — dois cursos que andavam juntos e precisavam de entregas
 * intermediárias. Aqui as dez aulas já formam uma sequência coesa, e quebrá-la
 * em três cursos criaria burocracia sem ganho para quem estuda.
 */
import { aplicar } from './lib-conteudo.mjs'

const AMPLIACOES = {
  'algoritmo-e-pensamento-computacional': `
<h2>O computador não entende "mais ou menos"</h2>
<p>Peça a um colega para fazer um sanduíche e ele resolve os detalhes sozinho. Peça ao computador e
ele faz exatamente o que está escrito — inclusive passar manteiga no saco do pão, se você não disse
para tirar o pão do saco.</p>
<p>É o exercício clássico do "sanduíche": escreva o passo a passo e peça para alguém executar ao pé
da letra, sem usar bom senso. O que você descobre é que instruções óbvias para gente são ambíguas
para máquina — e é essa diferença que o pensamento computacional treina.</p>

<h2>As quatro peças do pensamento computacional</h2>
<table>
  <tr><th>Peça</th><th>É</th><th>Exemplo do dia</th></tr>
  <tr><td>Decomposição</td><td>quebrar o problema grande em pequenos</td><td>organizar a festa = convites + comida + som</td></tr>
  <tr><td>Reconhecimento de padrão</td><td>ver o que se repete</td><td>toda semana o cardápio muda igual</td></tr>
  <tr><td>Abstração</td><td>ignorar o que não importa agora</td><td>para calcular a média, a cor da caneta não conta</td></tr>
  <tr><td>Algoritmo</td><td>o passo a passo final</td><td>a receita escrita</td></tr>
</table>
<p>Repare que só a última é o que costuma se chamar de "programar". As três primeiras acontecem
antes, no papel — e é lá que se ganha ou se perde o tempo.</p>

<h2>Faça agora</h2>
<p>Escreva o algoritmo de uma coisa que você faz todo dia — ir da sua casa até a escola, por
exemplo. Depois entregue a alguém e peça que execute <strong>ao pé da letra</strong>, sem consertar
nada mentalmente. Anote em que passo a pessoa travou. Aquele passo é o que você achava óbvio e não
era.</p>
`,

  'variaveis-e-tipos-de-dados': `
<h2>O nome da variável é para você, não para a máquina</h2>
<pre><code>x &lt;- 7.5
y &lt;- 8.0
z &lt;- (x + y) / 2

nota1 &lt;- 7.5
nota2 &lt;- 8.0
media &lt;- (nota1 + nota2) / 2</code></pre>
<p>Os dois trechos fazem a mesma coisa. O primeiro você entende hoje e esquece amanhã; o segundo se
explica sozinho. Como o computador não liga para o nome, ele existe só para quem lê — e quem lê é
você daqui a duas semanas.</p>
<p>Três regras que resolvem: use palavra inteira em vez de letra solta, escreva o que a variável
guarda e não o tipo dela (<code>idade</code>, não <code>numeroIdade</code>), e não tenha medo de
nome comprido — <code>totalDeAlunosAprovados</code> é melhor que <code>tot</code>.</p>

<h2>O erro de trocar o tipo no meio do caminho</h2>
<pre><code>idade &lt;- "16"     // isto é TEXTO, não número
proximoAno &lt;- idade + 1</code></pre>
<p>Dependendo da linguagem, isso dá erro ou produz <code>"161"</code> — o texto "16" colado com o
texto "1". As aspas mudam tudo: <code>16</code> é número, <code>"16"</code> é texto que por acaso
parece número.</p>
<p>Esse detalhe volta em toda linguagem que você aprender, sempre no mesmo lugar: quando o dado vem
de fora, digitado por alguém ou lido de um arquivo, ele chega como texto.</p>

<h2>Faça agora</h2>
<p>Declare quatro variáveis com os quatro tipos — texto, inteiro, real e lógico — descrevendo você.
Depois releia os nomes que escolheu: alguém que não conhece o programa entenderia o que cada uma
guarda?</p>
`,

  'entrada-e-saida-leia-escreva': `
<h2>Perguntar sem dizer o que se quer</h2>
<pre><code>leia(nota)                        // a tela fica parada, e a pessoa não sabe o que fazer

escreva("Digite a primeira nota: ")
leia(nota)                        // agora sim</code></pre>
<p>Todo <code>leia</code> precisa de um <code>escreva</code> antes. Parece óbvio quando escrito
assim, e é o erro que mais aparece nos primeiros programas — porque quem escreveu sabe o que o
programa está esperando, e só quem usa é que não sabe.</p>

<h2>A mensagem que evita a pergunta</h2>
<table>
  <tr><th>Pedido</th><th>Problema</th></tr>
  <tr><td><code>escreva("Data:")</code></td><td>dia/mês/ano? mês/dia/ano? com barra ou traço?</td></tr>
  <tr><td><code>escreva("Data (dd/mm/aaaa): ")</code></td><td>não sobra dúvida</td></tr>
  <tr><td><code>escreva("Valor:")</code></td><td>com vírgula ou com ponto?</td></tr>
  <tr><td><code>escreva("Valor em reais, use vírgula (ex: 12,50): ")</code></td><td>resolvido</td></tr>
</table>
<p>Cada dúvida que a mensagem não tira vira um dado errado que o programa vai receber — e uma
verificação que você vai ter de escrever depois.</p>

<h2>Faça agora</h2>
<p>Escreva um programa que pede nome, idade e cidade, e devolve uma frase montada com os três.
Depois peça para alguém usar <strong>sem você explicar nada</strong>. Se a pessoa perguntar
qualquer coisa, a resposta dela é o que faltava na sua mensagem.</p>
`,

  'operadores-aritmeticos-relacionais-logicos': `
<h2>Divisão inteira e resto: os dois que resolvem muita coisa</h2>
<pre><code>17 / 5      // 3.4  — divisão normal
17 \\ 5      // 3    — quantas vezes cabe
17 % 5      // 2    — o que sobra</code></pre>
<p>O resto parece curiosidade de matemática e é uma das ferramentas mais usadas em programação:</p>
<table>
  <tr><th>Quero saber</th><th>Escrevo</th></tr>
  <tr><td>o número é par?</td><td><code>numero % 2 = 0</code></td></tr>
  <tr><td>é múltiplo de 3?</td><td><code>numero % 3 = 0</code></td></tr>
  <tr><td>quantos minutos sobram de 200 segundos?</td><td><code>200 % 60</code></td></tr>
  <tr><td>alternar entre duas cores numa lista</td><td><code>posicao % 2</code></td></tr>
</table>

<h2>A ordem das contas</h2>
<pre><code>2 + 3 * 4        // 14, não 20 — multiplicação primeiro
(2 + 3) * 4      // 20</code></pre>
<p>A mesma ordem da matemática da escola: potência, depois multiplicação e divisão, depois soma e
subtração. Na dúvida, use parênteses — eles não custam nada e deixam claro para quem lê o que você
quis dizer.</p>

<h2>O erro de escrever a condição como se fala</h2>
<pre><code>se idade &gt; 12 e &lt; 18 entao        // errado: falta repetir a variável
se idade &gt; 12 e idade &lt; 18 entao  // certo</code></pre>
<p>Em português "entre 12 e 18" se diz de um jeito; para o computador, cada comparação precisa dos
dois lados. Esse é o erro de sintaxe mais comum em condição composta, e vale para toda linguagem.</p>

<h2>Faça agora</h2>
<p>Escreva um programa que lê um número de segundos e mostra quantos minutos e quantos segundos
sobram — 200 segundos viram 3 minutos e 20 segundos. Você vai precisar da divisão inteira e do
resto na mesma conta.</p>
`,

  'condicionais-se-senao': `
<h2>A ordem dos testes decide o resultado</h2>
<pre><code>se media &gt;= 6 entao
   escreva("Aprovado")
senao se media &gt;= 9 entao
   escreva("Excelente")      // nunca acontece
fimse</code></pre>
<p>Quem tirou 9,5 entra no primeiro <code>se</code> e sai — o segundo nem é avaliado. Encadeamento
para na primeira condição verdadeira, então o teste <strong>mais restrito vem primeiro</strong>.</p>
<p>É um erro que não dá mensagem nenhuma: o programa roda, não acusa nada, e simplesmente ignora um
dos casos. Só aparece quando alguém repara que "Excelente" nunca sai.</p>

<h2>Condição que já é verdadeiro ou falso</h2>
<pre><code>se maiorDeIdade = VERDADEIRO entao   // funciona, e é redundante
se maiorDeIdade entao                // o mesmo, mais limpo
se nao maiorDeIdade entao            // o contrário</code></pre>
<p>Uma variável lógica já é a resposta da pergunta. Comparar com VERDADEIRO é como perguntar "é
verdade que é verdade?".</p>

<h2>O aninhamento que ninguém lê</h2>
<pre><code>se tem_documento entao
   se idade &gt;= 18 entao
      se pagou entao
         escreva("Pode entrar")
      fimse
   fimse
fimse

se tem_documento e idade &gt;= 18 e pagou entao
   escreva("Pode entrar")
fimse</code></pre>
<p>Os dois fazem o mesmo. Quando os "se" só se aprofundam, sem <code>senao</code> no meio, eles
viram uma condição composta — e a segunda forma se lê numa passada.</p>

<h2>Faça agora</h2>
<p>Escreva o programa da situação escolar: lê três notas e a frequência, e diz se o aluno está
aprovado, de recuperação ou reprovado — lembrando que frequência abaixo de 75% reprova mesmo com
média alta. Teste com média 9 e frequência 50%: se der aprovado, a ordem dos testes está errada.</p>
`,

  'laco-enquanto': `
<h2>O laço que não termina</h2>
<pre><code>contador &lt;- 0
enquanto contador &lt; 5 faca
   escreva(contador)
fimenquanto           // esqueceu de somar 1: imprime 0 para sempre</code></pre>
<p>Vai acontecer com você, e é bom que aconteça cedo. A pergunta que evita: <strong>o que aqui
dentro vai fazer a condição virar falsa?</strong> Se não houver resposta, o laço é infinito.</p>
<p>Todo <code>enquanto</code> tem três partes, e faltar qualquer uma quebra:</p>
<ol>
  <li>a variável começa com um valor, <strong>antes</strong> do laço</li>
  <li>a condição testa essa variável</li>
  <li>alguma coisa <strong>dentro</strong> do laço muda a variável</li>
</ol>

<h2>Ler até a pessoa mandar parar</h2>
<pre><code>total &lt;- 0
escreva("Digite um valor (0 para terminar): ")
leia(valor)

enquanto valor &lt;&gt; 0 faca
   total &lt;- total + valor
   escreva("Digite outro (0 para terminar): ")
   leia(valor)
fimenquanto

escreva("Total: ", total)</code></pre>
<p>Repare que o <code>leia</code> aparece duas vezes: uma antes do laço e outra no fim dele. Sem a
primeira, a condição testaria uma variável que ainda não tem valor. Esse arranjo tem nome —
sentinela — e é o jeito padrão de ler até um valor de parada.</p>

<h2>Faça agora</h2>
<p>Escreva o programa da senha: pede a senha e repete enquanto estiver errada, contando as
tentativas. Depois acrescente um limite de três tentativas — agora a condição tem duas partes, e
você vai precisar do <code>e</code>.</p>
`,

  'laco-para': `
<h2>Quando usar cada um</h2>
<table>
  <tr><th>Situação</th><th>Laço</th></tr>
  <tr><td>Sei quantas vezes: 10 alunos, 12 meses</td><td><code>para</code></td></tr>
  <tr><td>Não sei: até acertar a senha, até digitar 0</td><td><code>enquanto</code></td></tr>
  <tr><td>Percorrer um vetor inteiro</td><td><code>para</code></td></tr>
  <tr><td>Repetir um menu até escolherem "sair"</td><td><code>enquanto</code></td></tr>
</table>
<p>Os dois resolvem qualquer caso, mas escolher errado dá trabalho: um <code>enquanto</code> para
contar até 10 exige três linhas extras que o <code>para</code> já traz prontas.</p>

<h2>O erro de contar do zero ou do um</h2>
<pre><code>para i de 1 ate 10 faca     // executa 10 vezes: 1,2,...,10
para i de 0 ate 10 faca     // executa 11 vezes: 0,1,...,10</code></pre>
<p>Chama-se erro de um a mais, e é campeão de bug em toda linguagem. Quando o resultado der uma
volta a mais ou a menos do que você esperava, olhe primeiro os limites do <code>para</code>.</p>

<h2>Laço dentro de laço</h2>
<pre><code>para tabuada de 1 ate 10 faca
   escreva("Tabuada do ", tabuada)
   para numero de 1 ate 10 faca
      escreva(tabuada, " x ", numero, " = ", tabuada * numero)
   fimpara
fimpara</code></pre>
<p>O de dentro roda inteiro a cada volta do de fora: 10 vezes 10 dá 100 linhas. É assim que se
percorre tabela, matriz e qualquer coisa com linha e coluna — e é também como um programa fica lento
sem ninguém perceber, quando os dois laços crescem juntos.</p>

<h2>Faça agora</h2>
<p>Escreva um programa que lê 5 números e mostra a soma, a média, o maior e o menor. O maior e o
menor exigem uma decisão: com que valor você começa a variável do maior? Pense antes de escrever —
começar com zero dá errado se todos os números forem negativos.</p>
`,

  'vetores-e-listas': `
<h2>Por que vetor, e não trinta variáveis</h2>
<pre><code>nota1 &lt;- 7.5
nota2 &lt;- 8.0
// ... e mais 28 linhas

notas: vetor[1..30] de real</code></pre>
<p>Com trinta variáveis separadas, calcular a média exige escrever os trinta nomes numa conta só —
e mudar para trinta e cinco alunos significa reescrever o programa. Com vetor, o mesmo laço serve
para qualquer tamanho.</p>

<h2>O índice é o endereço, não o valor</h2>
<pre><code>notas[3] &lt;- 9.0        // guarda 9.0 na terceira gaveta
escreva(notas[3])      // mostra 9.0</code></pre>
<p>A confusão comum é misturar os dois: <code>notas[3]</code> é <em>onde</em>, e o 9.0 é <em>o
quê</em>. Quando o programa mostrar um número estranho, verifique se você não imprimiu o índice no
lugar do conteúdo.</p>

<h2>Sair do vetor</h2>
<pre><code>notas: vetor[1..30] de real
notas[31] &lt;- 8.0      // não existe</code></pre>
<p>Dependendo da linguagem, isso dá erro na hora ou — pior — grava numa área de memória que era de
outra coisa, e o problema aparece bem longe dali. É o tipo de erro que consome uma tarde.</p>
<p>A defesa é sempre percorrer com <code>para i de 1 ate tamanho</code>, nunca com um número
escrito à mão.</p>

<h2>O padrão que resolve quase tudo</h2>
<pre><code>soma &lt;- 0
maior &lt;- notas[1]

para i de 1 ate 30 faca
   soma &lt;- soma + notas[i]
   se notas[i] &gt; maior entao
      maior &lt;- notas[i]
   fimse
fimpara

media &lt;- soma / 30</code></pre>
<p>Acumular fora, percorrer dentro, comparar com o melhor até agora. Este esqueleto resolve soma,
média, maior, menor, contagem e busca — muda só o que vai dentro do laço.</p>

<h2>Faça agora</h2>
<p>Leia as notas de 5 alunos num vetor e mostre a média da turma, quantos ficaram acima dela e o
nome — em outro vetor — de quem tirou a maior. Dois vetores lado a lado, mesma posição para o mesmo
aluno: é assim que se guarda dado relacionado antes de existir estrutura melhor.</p>
`,

  'funcoes-e-modularizacao': `
<h2>Devolver não é o mesmo que escrever</h2>
<pre><code>funcao mediaErrada(a, b, c)
   escreva((a + b + c) / 3)      // mostra, mas não devolve
fimfuncao

funcao media(a, b, c)
   retorne (a + b + c) / 3       // devolve; quem chamou decide o que fazer
fimfuncao</code></pre>
<p>A primeira só serve para mostrar na tela. Com a segunda você pode guardar, comparar, somar a
outra coisa ou mostrar — e é isso que a torna reaproveitável.</p>
<p>A regra: a função <strong>calcula e devolve</strong>; quem chamou decide o destino.</p>

<h2>O que nasce dentro, morre dentro</h2>
<pre><code>funcao somar(a, b)
   resultado &lt;- a + b
   retorne resultado
fimfuncao

escreva(resultado)     // erro: aqui fora não existe</code></pre>
<p>Isso é proteção, não limitação: você pode usar <code>total</code> dentro de cinco funções
diferentes sem que uma atrapalhe a outra. Cada função tem seu próprio espaço.</p>

<h2>Uma função, uma responsabilidade</h2>
<pre><code>// faz coisa demais
funcao processarTudo(notas)
   // lê, calcula, decide a situação, imprime o boletim e grava o arquivo

// cada uma faz uma coisa
funcao calcularMedia(notas)
funcao situacao(media)
funcao imprimirBoletim(nome, media, situacao)</code></pre>
<p>Um sinal prático de que a função cresceu demais: você não consegue dar um nome que descreva o que
ela faz sem usar "e". "Calcula a média <em>e</em> imprime" são duas funções.</p>

<h2>Faça agora</h2>
<p>Volte a um programa que você já escreveu neste curso e transforme dois pedaços dele em funções.
Depois leia o programa principal: ele deve contar a história do que acontece — lê, calcula, decide,
mostra — com o detalhe guardado dentro de cada função.</p>
`,

  'do-problema-ao-programa': `
<h2>A ordem que economiza tempo</h2>
<ol>
  <li><strong>Entender</strong> — o que entra, o que sai, que regra transforma um no outro</li>
  <li><strong>Rascunhar</strong> — no papel, em português, sem sintaxe</li>
  <li><strong>Testar no papel</strong> — o teste de mesa, com números de verdade</li>
  <li><strong>Escrever</strong> — só agora</li>
  <li><strong>Testar de novo</strong> — inclusive com dado estranho</li>
</ol>
<p>Quem começa pelo passo 4 costuma voltar ao 1 três vezes. A hora gasta no papel se paga na
primeira travada que não acontece.</p>

<h2>Os dados que quebram o programa</h2>
<p>Programa que funciona só com o dado bonitinho não está pronto. Teste sempre com:</p>
<table>
  <tr><th>Caso</th><th>Exemplo</th></tr>
  <tr><td>O normal</td><td>três notas entre 0 e 10</td></tr>
  <tr><td>O limite</td><td>nota exatamente 6, exatamente 0, exatamente 10</td></tr>
  <tr><td>O vazio</td><td>nenhum aluno na lista</td></tr>
  <tr><td>O impossível</td><td>nota 15, idade negativa, texto onde se esperava número</td></tr>
</table>
<p>Os três últimos são os que quebram. O de limite é o mais traiçoeiro: média exatamente 6 aprova ou
recupera? A regra tem de dizer, e o seu <code>&gt;=</code> ou <code>&gt;</code> tem de concordar
com ela.</p>

<h2>Um problema completo, do começo ao fim</h2>
<p><em>"Fazer o boletim de uma turma: ler o nome e três notas de cada aluno, calcular a média,
dizer a situação e mostrar quantos foram aprovados."</em></p>
<pre><code>ENTRADA: quantidade de alunos; para cada um, nome e três notas
SAÍDA:   nome, média e situação de cada um; total de aprovados
REGRA:   média &gt;= 6 aprova; entre 4 e 6 recupera; abaixo reprova

RASCUNHO
  pergunte quantos alunos
  aprovados &lt;- 0
  repita para cada aluno
     leia nome e as três notas
     media &lt;- soma / 3
     decida a situação
     se aprovado, some 1 em aprovados
     mostre nome, média e situação
  mostre aprovados</code></pre>
<p>O rascunho não é código, e é isso que o torna útil: dá para discutir, corrigir e reordenar em um
minuto. Escrito em pseudocódigo já formatado, mexer custa dez vezes mais.</p>

<h2>Faça agora</h2>
<p>Pegue um problema do seu dia — dividir a conta do lanche, sortear a ordem das apresentações,
calcular quanto falta para a média passar — e escreva só as três primeiras linhas: ENTRADA, SAÍDA e
REGRA. Se você não conseguir escrever as três com clareza, o problema ainda não está entendido, e
programar agora seria começar pelo fim.</p>
`,
}

const NOVAS = [
  {
    curso: 'logica-de-programacao',
    slug: 'teste-de-mesa',
    titulo: 'Teste de mesa: rodar o programa no papel',
    min: 6, ordem: 11,
    descricao: 'A técnica que acha o erro antes de o computador reclamar.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Executar um algoritmo no papel, passo a passo</li>
  <li>Montar a tabela de acompanhamento das variáveis</li>
  <li>Achar erro de lógica que o computador não acusa</li>
</ul>

<h2>O erro que não dá mensagem</h2>
<p>Existem dois tipos de erro. O de <strong>sintaxe</strong> o computador aponta: falta um
<code>fimse</code>, sobra um parêntese. O de <strong>lógica</strong> ele não aponta — o programa
roda, não reclama, e devolve a resposta errada.</p>
<p>Esse segundo é o que o teste de mesa pega. E ele é feito no papel, de propósito: no papel você é
obrigado a executar uma linha por vez, sem pular, que é justamente o que a máquina faz.</p>

<h2>Como se faz</h2>
<p>Uma tabela com uma coluna por variável e uma linha por passo. Vamos testar este trecho, que
deveria somar os números de 1 a 5:</p>
<pre><code>soma &lt;- 0
para i de 1 ate 5 faca
   soma &lt;- soma + i
fimpara
escreva(soma)</code></pre>
<table>
  <tr><th>Passo</th><th>i</th><th>soma</th><th>Observação</th></tr>
  <tr><td>início</td><td>—</td><td>0</td><td>antes do laço</td></tr>
  <tr><td>1ª volta</td><td>1</td><td>1</td><td>0 + 1</td></tr>
  <tr><td>2ª volta</td><td>2</td><td>3</td><td>1 + 2</td></tr>
  <tr><td>3ª volta</td><td>3</td><td>6</td><td>3 + 3</td></tr>
  <tr><td>4ª volta</td><td>4</td><td>10</td><td>6 + 4</td></tr>
  <tr><td>5ª volta</td><td>5</td><td>15</td><td>10 + 5</td></tr>
  <tr><td>fim</td><td>—</td><td>15</td><td>escreve 15</td></tr>
</table>
<p>Confere. Agora veja o mesmo trecho com um erro de uma letra:</p>
<pre><code>soma &lt;- 0
para i de 1 ate 5 faca
   soma &lt;- soma + 1        // "1" no lugar de "i"
fimpara</code></pre>
<p>A tabela dá 1, 2, 3, 4, 5 — o programa escreve 5 em vez de 15. Nenhum computador acusaria isso:
a linha está perfeitamente válida. O teste de mesa acha em trinta segundos.</p>

<h2>Onde ele vale mais a pena</h2>
<ul>
  <li><strong>Laços</strong> — é onde mora quase todo erro de lógica</li>
  <li><strong>Condições encadeadas</strong> — para ver qual caminho cada valor toma</li>
  <li><strong>Acumuladores e contadores</strong> — começar em zero ou em um muda o resultado</li>
  <li><strong>Antes de digitar</strong> — o algoritmo rascunhado, testado no papel, chega ao teclado
    já limpo</li>
</ul>

<h2>Escolher os valores do teste</h2>
<p>Não teste com o caso mais bonito. Escolha:</p>
<table>
  <tr><th>Valor</th><th>Por quê</th></tr>
  <tr><td>o típico</td><td>confirma que a ideia funciona</td></tr>
  <tr><td>o primeiro e o último</td><td>é onde o laço erra por um</td></tr>
  <tr><td>o vazio, o zero</td><td>divisão por zero, lista sem elemento</td></tr>
  <tr><td>o negativo</td><td>quebra quem assumiu que todo número é positivo</td></tr>
</table>

<h2>Faça agora</h2>
<p>Pegue o programa do maior e do menor que você escreveu na aula de laços e faça o teste de mesa
com estes cinco números: <code>-3, -7, -1, -9, -5</code>. Se a variável do maior começou em zero, a
tabela vai mostrar o programa respondendo "0" — um número que nem estava na lista.</p>
`,
    desafio: {
      titulo: 'Ache o erro sem rodar o programa',
      enunciado: `<p>Monte a tabela de teste de mesa para este trecho, que deveria contar quantos números da lista são pares:</p>
<pre><code>numeros &lt;- [4, 7, 2, 9, 6]
pares &lt;- 0
para i de 1 ate 5 faca
   se numeros[i] % 2 = 0 entao
      pares &lt;- 1
   fimse
fimpara
escreva(pares)</code></pre>
<ul>
  <li>Faça a tabela com uma coluna por variável e uma linha por volta</li>
  <li>Diga o que o programa escreve</li>
  <li>Diga o que ele <strong>deveria</strong> escrever</li>
  <li>Aponte a linha errada e escreva a correção</li>
</ul>
<p>Entregue a tabela inteira, não só a resposta. O que se avalia aqui é o percurso, não o resultado
— num programa maior, é o percurso que você vai ter de fazer sozinho.</p>`,
    },
  },
  {
    curso: 'logica-de-programacao',
    slug: 'achando-o-erro',
    titulo: 'Achando o erro sem sair chutando',
    min: 6, ordem: 12,
    descricao: 'O método para depurar quando o programa não faz o que deveria.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Separar os tipos de erro e saber o que cada um pede</li>
  <li>Isolar o problema em vez de mexer no que estiver mais perto</li>
  <li>Ler mensagem de erro de verdade</li>
</ul>

<h2>Os três tipos, e o que fazer com cada um</h2>
<table>
  <tr><th>Tipo</th><th>Como se manifesta</th><th>O que fazer</th></tr>
  <tr><td>Sintaxe</td><td>o programa nem roda</td><td>ler a mensagem: ela diz a linha</td></tr>
  <tr><td>Execução</td><td>roda e para no meio</td><td>ver o que o dado tinha naquele ponto</td></tr>
  <tr><td>Lógica</td><td>roda até o fim e erra a resposta</td><td>teste de mesa</td></tr>
</table>
<p>O terceiro é o mais caro, porque nada avisa. Um programa que devolve a média errada parece
funcionar — e passa despercebido até alguém conferir na mão.</p>

<h2>Ler a mensagem, de verdade</h2>
<p>Mensagem de erro assusta porque é longa e está em inglês. Mas ela costuma dizer três coisas, e
todas úteis: <strong>o que</strong> aconteceu, <strong>onde</strong> (arquivo e linha), e às vezes
<strong>o caminho</strong> que o programa percorreu até ali.</p>
<p>O hábito que separa quem resolve rápido de quem trava: <strong>leia a linha indicada antes de
mexer em qualquer coisa</strong>. E vale saber que o erro costuma estar na linha indicada
<em>ou na anterior</em> — um parêntese que não fechou só é percebido na linha seguinte.</p>

<h2>Isolar em vez de chutar</h2>
<p>Quando um programa de 80 linhas está errado, mexer aqui e ali é o caminho mais lento. O método é
o mesmo de eletricista procurando o fio partido: cortar o problema pela metade.</p>
<ol>
  <li>Escolha um ponto no meio do programa</li>
  <li>Coloque um <code>escreva</code> mostrando as variáveis importantes ali</li>
  <li>Rode. Os valores estão certos naquele ponto?</li>
  <li>Se estão, o erro está depois. Se não estão, está antes</li>
  <li>Repita na metade que sobrou</li>
</ol>
<p>Em cinco rodadas você reduz 80 linhas a duas ou três. É muito mais rápido do que reler tudo, e
não depende de sorte.</p>

<h2>O <code>escreva</code> como ferramenta</h2>
<pre><code>escreva("DEBUG: antes do laço, soma =", soma)
para i de 1 ate n faca
   escreva("DEBUG: volta", i, "valor", vetor[i], "soma", soma)
   soma &lt;- soma + vetor[i]
fimpara
escreva("DEBUG: depois do laço, soma =", soma)</code></pre>
<p>Marcar com "DEBUG" serve para você achar e apagar tudo depois. Programa entregue com mensagem de
depuração aparecendo para o usuário é um clássico — e passa a impressão exata de trabalho
inacabado.</p>

<h2>Quando nada funciona</h2>
<p>Três coisas que resolvem mais do que parecem:</p>
<ul>
  <li><strong>Explique o programa em voz alta</strong>, linha por linha, para alguém — ou para a
    parede. Na metade da explicação você costuma achar. Tem nome e tudo: depuração do patinho de
    borracha</li>
  <li><strong>Levante e volte em vinte minutos.</strong> Você para de ler o que quis escrever e
    passa a ler o que escreveu</li>
  <li><strong>Reescreva o trecho do zero</strong>, sem olhar. Em dez linhas, costuma ser mais
    rápido que caçar o erro</li>
</ul>

<h2>Faça agora</h2>
<p>Pegue o último programa seu que deu errado — ou quebre um de propósito, trocando um sinal.
Aplique o método de cortar pela metade e conte quantas rodadas você levou para achar. Comparar esse
número com o tempo que você costuma levar lendo tudo é o argumento a favor do método.</p>
`,
    desafio: {
      titulo: 'Três programas quebrados',
      enunciado: `<p>Cada trecho abaixo tem um erro. Para cada um, diga <strong>qual é o tipo</strong> (sintaxe, execução ou lógica), <strong>qual é a linha</strong> e <strong>qual é a correção</strong>.</p>
<pre><code>// A
media &lt;- (nota1 + nota2 / 2
escreva(media)</code></pre>
<pre><code>// B
soma &lt;- 0
para i de 1 ate 10 faca
   soma &lt;- soma + i
escreva(soma)</code></pre>
<pre><code>// C
total &lt;- 0
quantidade &lt;- 0
para i de 1 ate n faca
   total &lt;- total + valores[i]
fimpara
media &lt;- total / quantidade
escreva(media)</code></pre>
<p>O C é o mais interessante: ele não tem erro de escrita nenhum, e mesmo assim quebra. Diga por
quê, e diga também o que aconteceria se <code>quantidade</code> valesse 1.</p>`,
    },
  },
  {
    curso: 'logica-de-programacao',
    slug: 'buscar-e-ordenar',
    titulo: 'Buscar e ordenar',
    min: 7, ordem: 13,
    descricao: 'Os dois problemas que todo programador resolve — e por que o jeito importa.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Escrever busca sequencial e entender seu limite</li>
  <li>Entender a busca binária e o que ela exige</li>
  <li>Ordenar um vetor e perceber por que a forma escolhida importa</li>
</ul>

<h2>Buscar: olhar um por um</h2>
<pre><code>funcao buscar(vetor, tamanho, procurado)
   para i de 1 ate tamanho faca
      se vetor[i] = procurado entao
         retorne i          // achou: devolve a posição
      fimse
   fimpara
   retorne -1                // não achou
fimfuncao</code></pre>
<p>Duas decisões pequenas e importantes. O <code>retorne</code> dentro do laço sai na hora — não faz
sentido continuar depois de achar. E devolver <code>-1</code> quando não acha é uma convenção: como
posição nunca é negativa, esse valor não se confunde com resposta válida.</p>
<p>No pior caso — o item não está lá — a busca olha o vetor inteiro. Com 30 alunos, 30 comparações.
Com 30 mil, 30 mil.</p>

<h2>Buscar em lista ordenada: cortar pela metade</h2>
<p>Você procura "Silva" na lista de chamada. Ninguém começa pelo primeiro nome: abre no meio, vê que
"Silva" vem depois, e ignora a primeira metade de uma vez.</p>
<pre><code>inicio &lt;- 1
fim &lt;- tamanho

enquanto inicio &lt;= fim faca
   meio &lt;- (inicio + fim) \\ 2

   se vetor[meio] = procurado entao
      retorne meio
   senao se vetor[meio] &lt; procurado entao
      inicio &lt;- meio + 1     // está na metade de cima
   senao
      fim &lt;- meio - 1        // está na metade de baixo
   fimse
fimenquanto

retorne -1</code></pre>
<p>A diferença é grande:</p>
<table>
  <tr><th>Itens</th><th>Um por um</th><th>Pela metade</th></tr>
  <tr><td>30</td><td>até 30</td><td>até 5</td></tr>
  <tr><td>1.000</td><td>até 1.000</td><td>até 10</td></tr>
  <tr><td>1.000.000</td><td>até 1.000.000</td><td>até 20</td></tr>
</table>
<p>Mas há um preço, e ele é o ponto da aula: <strong>a busca binária só funciona em lista
ordenada</strong>. Se a lista não está ordenada, você precisa ordenar antes — e ordenar custa.</p>

<h2>Ordenar: o método da bolha</h2>
<pre><code>para i de 1 ate tamanho - 1 faca
   para j de 1 ate tamanho - i faca
      se vetor[j] &gt; vetor[j + 1] entao
         temporario &lt;- vetor[j]
         vetor[j] &lt;- vetor[j + 1]
         vetor[j + 1] &lt;- temporario
      fimse
   fimpara
fimpara</code></pre>
<p>Compara cada par vizinho e troca se estiverem fora de ordem. A cada passada, o maior valor "sobe"
até o fim — daí o nome.</p>
<p>Repare na troca: são três linhas e uma variável temporária. Trocar direto —
<code>a &lt;- b</code> e depois <code>b &lt;- a</code> — perde o valor de <code>a</code> na primeira
linha. É o erro clássico, e o jeito de lembrar é pensar em dois copos cheios: para trocar o
conteúdo, você precisa de um terceiro copo.</p>

<h2>O que isso ensina além do código</h2>
<p>A bolha é lenta: com 1.000 itens faz cerca de um milhão de comparações. Existem formas bem mais
rápidas, e você vai vê-las adiante. O que interessa agora é a ideia que fica:</p>
<blockquote>Dois programas que dão a mesma resposta podem levar tempos completamente diferentes — e
a diferença aparece quando o dado cresce.</blockquote>
<p>É por isso que "funciona" não é o fim da conversa. Funciona com quantos? É a pergunta que separa
um exercício de um sistema.</p>

<h2>Faça agora</h2>
<p>Escreva a busca sequencial e conte quantas comparações ela faz procurando o último item de uma
lista de 10. Depois ordene a lista e conte de novo, agora com a busca binária. Os dois números lado
a lado explicam a aula inteira.</p>
`,
    desafio: {
      titulo: 'Buscar, ordenar e contar as comparações',
      enunciado: `<p>Trabalhe com uma lista de 10 números fora de ordem, escolhidos por você.</p>
<ul>
  <li>Escreva a <strong>busca sequencial</strong> e faça o programa contar quantas comparações ele fez</li>
  <li>Escreva a <strong>ordenação pelo método da bolha</strong> e conte as trocas realizadas</li>
  <li>Com a lista já ordenada, escreva a <strong>busca binária</strong> e conte as comparações</li>
  <li>Procure três valores: o primeiro da lista, o último, e um que não existe</li>
</ul>
<p>Entregue a tabela com os números que você obteve nos três casos, e responda: em que situação a
busca sequencial ganhou da binária? Existe uma — e achá-la é o objetivo do exercício.</p>`,
    },
  },
]

await aplicar({ AMPLIACOES, NOVAS })
