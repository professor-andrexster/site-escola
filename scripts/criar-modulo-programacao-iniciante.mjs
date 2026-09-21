/**
 * Cria o módulo "Programação Iniciante" e o primeiro curso dele: Fluxogramas.
 *
 *   node scripts/criar-modulo-programacao-iniciante.mjs             simula
 *   node scripts/criar-modulo-programacao-iniciante.mjs --aplicar   grava como rascunho (publicado = 0)
 *   node scripts/criar-modulo-programacao-iniciante.mjs --publicar  liga módulo, curso e aulas
 *
 * Por que um módulo novo e não um curso dentro de "Lógica e Programação": oito
 * alunos já têm aula concluída lá, e um curso a mais empurraria o certificado
 * deles para longe. Mesmo motivo do módulo de Python.
 *
 * Posição: o módulo entra na ordem 6, logo antes de "Lógica e Programação",
 * porque fluxograma é o que vem antes do pseudocódigo. Na trilha Programação o
 * curso entra na posição 8, também antes de Lógica.
 *
 * Tudo nasce despublicado. O André revisa em /admin/cursos/gerenciar e, quando
 * aprovar, roda com --publicar. Idempotente: rodar duas vezes não duplica nada.
 *
 * Ferramenta ensinada: draw.io (diagrams.net). Gratuita, roda no navegador sem
 * conta e tem versão desktop de código aberto (v31.4.5 em 2026-09-08, conferido
 * em github.com/jgraph/drawio-desktop). Flowgorithm aparece na última aula como
 * extra: gratuito, só Windows, executa o fluxograma.
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

const MODULO = {
  slug: 'programacao-iniciante',
  nome: 'Programação Iniciante',
  nivel: 'Fácil',
  ordem: 6,
  carga: 6,
  descricao:
    'Antes de escrever código, você aprende a pensar como quem programa: desenhar o caminho de um problema até a solução. Começa com fluxogramas e termina pronto para a Lógica de Programação.',
}

const CURSO = {
  slug: 'fluxogramas',
  titulo: 'Fluxogramas: desenhando o raciocínio',
  categoria: 'Programação',
  carga: 6,
  descricao:
    'Seis aulas para aprender a desenhar o passo a passo de qualquer problema com os símbolos que programadores usam no mundo todo. Você monta seus fluxogramas no draw.io, um programa gratuito, e termina com um fluxograma de um problema seu.',
  ordemNaTrilha: 8,
}

const FORMATOS = '.png, .pdf, .drawio'

const AULAS = [
  {
    slug: 'o-que-e-um-fluxograma',
    titulo: 'O que é um fluxograma e por que programador desenha antes de escrever',
    min: 30,
    descricao: 'A ideia de algoritmo, o desenho que mostra o caminho e por que ele vem antes do código.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Explicar o que é um algoritmo com exemplo do seu dia</li>
  <li>Reconhecer um fluxograma e ler o que ele diz</li>
  <li>Entender por que desenhar o caminho antes de programar economiza tempo</li>
</ul>

<h2>Você já faz isso todo dia</h2>
<p>Pense em como você faz um miojo. Ferve a água, abre o pacote, coloca o macarrão, espera três
minutos, mistura o tempero, come. Isso é um <strong>algoritmo</strong>: uma sequência de passos,
em ordem, que resolve um problema. Receita de bolo, manual de montar guarda-roupa, instrução de
como chegar na casa de alguém. Tudo algoritmo.</p>
<p>Programar é escrever algoritmos que o computador consegue seguir. E o computador tem uma
característica que a gente não tem: ele não adivinha nada. Se um passo faltar ou vier fora de
ordem, ele trava ou faz besteira.</p>

<h2>O desenho que mostra o caminho</h2>
<p>Um <strong>fluxograma</strong> é o algoritmo desenhado. Cada passo vira uma caixa, e setas
ligam as caixas na ordem em que acontecem. Olhando o desenho, dá para ver de uma vez só o começo,
o fim e tudo o que acontece no meio.</p>
<p>O fluxograma do miojo fica assim, em texto:</p>
<pre><code>(Início)
   |
[Ferver a água]
   |
[Abrir o pacote]
   |
[Colocar o macarrão na água]
   |
[Esperar 3 minutos]
   |
[Misturar o tempero]
   |
(Fim)</code></pre>
<p>Parêntese é começo ou fim. Colchete é uma ação. A linha vertical é a seta. Na próxima aula você
aprende os símbolos de verdade; por agora, o que importa é enxergar a ordem.</p>

<h2>Por que desenhar antes de escrever código</h2>
<p>Programador experiente desenha o caminho antes de digitar por três motivos:</p>
<ul>
  <li><strong>Erro no papel é barato.</strong> Perceber que esqueceu um passo olhando o desenho leva
  dez segundos. Perceber depois de escrever cinquenta linhas de código leva uma tarde.</li>
  <li><strong>O desenho é a mesma coisa em qualquer linguagem.</strong> Um fluxograma bem feito vira
  Python, JavaScript, PHP ou Java. Só muda a tradução.</li>
  <li><strong>Outra pessoa entende.</strong> Mostrar um fluxograma para um colega ou cliente é bem
  mais fácil do que mostrar código.</li>
</ul>
<p>Em empresa de software, fluxograma aparece em reunião, em documentação e em entrevista de
emprego. Não é coisa de escola: é ferramenta de trabalho.</p>

<h2>Glossário desta aula</h2>
<ul>
  <li><strong>Algoritmo:</strong> sequência de passos, em ordem, que resolve um problema.</li>
  <li><strong>Fluxograma:</strong> desenho de um algoritmo usando caixas e setas.</li>
</ul>

<h2>Resumo</h2>
<p>Algoritmo é passo a passo. Fluxograma é o passo a passo desenhado. Desenhar antes de programar
mostra o erro cedo, serve para qualquer linguagem e ajuda outra pessoa a entender o que você
pensou.</p>
`,
    desafio: {
      titulo: 'Três algoritmos do seu dia',
      enunciado: `<p>Escreva, em texto mesmo (caderno ou bloco de notas), o passo a passo de <strong>três
tarefas</strong> que você faz na sua rotina. Exemplos: escovar os dentes, trocar a bateria do
celular por carregar, pegar o ônibus para a escola.</p>
<ul>
  <li>Cada tarefa precisa ter <strong>no mínimo cinco passos</strong>, numerados</li>
  <li>Cada passo é uma ação só. "Abrir a torneira e molhar a escova" são dois passos</li>
  <li>Marque onde começa e onde termina</li>
</ul>
<p>Teste: dê sua lista para alguém da casa seguir ao pé da letra, sem completar nada de cabeça.
Se a pessoa travar, faltou passo. Anote o que faltou e corrija.</p>
<p>Envie uma foto ou PDF do texto final, com as correções.</p>`,
    },
  },
  {
    slug: 'os-simbolos-do-fluxograma',
    titulo: 'Os símbolos: cada forma tem um significado',
    min: 30,
    descricao: 'Início e fim, ação, decisão, entrada e saída, seta. As regras para o desenho ser lido do mesmo jeito por todo mundo.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Usar os cinco símbolos básicos de fluxograma no lugar certo</li>
  <li>Seguir as regras que fazem o desenho ser lido por qualquer pessoa</li>
  <li>Ler um fluxograma pronto e dizer o que ele faz</li>
</ul>

<h2>Por que existe padrão</h2>
<p>Se cada pessoa desenhasse do seu jeito, ninguém entenderia o fluxograma de ninguém. Por isso
existe um conjunto de símbolos combinado no mundo inteiro (a norma se chama ISO 5807, e você não
precisa decorar o número). Com cinco formas você desenha quase tudo.</p>

<h2>Os cinco símbolos</h2>
<table>
  <tr><th>Forma</th><th>Nome</th><th>Para quê</th><th>Exemplo</th></tr>
  <tr><td>Oval (retângulo de cantos bem redondos)</td><td>Terminal</td><td>Marca o início e o fim</td><td><code>Início</code>, <code>Fim</code></td></tr>
  <tr><td>Retângulo</td><td>Processo</td><td>Uma ação, uma conta, uma mudança</td><td><code>soma = a + b</code></td></tr>
  <tr><td>Losango</td><td>Decisão</td><td>Uma pergunta de sim ou não. Sai por dois caminhos</td><td><code>idade &gt;= 18?</code></td></tr>
  <tr><td>Paralelogramo (retângulo inclinado)</td><td>Entrada / Saída</td><td>Pedir um dado ou mostrar um resultado</td><td><code>Ler nota</code>, <code>Mostrar média</code></td></tr>
  <tr><td>Seta</td><td>Fluxo</td><td>Liga um símbolo ao próximo, na direção da leitura</td><td></td></tr>
</table>

<h2>As regras de leitura</h2>
<ul>
  <li><strong>Um Início e um Fim.</strong> Todo fluxograma começa em um único oval e termina em um
  único oval. Se tem dois fins, algo está errado.</li>
  <li><strong>De cima para baixo, da esquerda para a direita.</strong> É a ordem natural de leitura.
  Seta subindo só quando o caminho volta (você vê isso na aula de repetição).</li>
  <li><strong>Decisão sempre sai por dois caminhos.</strong> Um marcado <em>Sim</em>, outro
  <em>Não</em>. Losango com uma saída só é pergunta sem resposta.</li>
  <li><strong>Uma ação por retângulo.</strong> "Ler nota e calcular média" são dois símbolos: um
  paralelogramo e um retângulo.</li>
  <li><strong>Texto curto.</strong> Dentro da caixa cabe uma frase. Explicação longa vai fora, em
  anotação.</li>
</ul>

<h2>Lendo um fluxograma pronto</h2>
<p>Leia este e responda mentalmente o que ele faz:</p>
<pre><code>(Início)
   |
/ Ler idade /
   |
&lt; idade &gt;= 16? &gt;
   |          \\
  Sim          Não
   |             \\
/ Mostrar "Pode tirar título" /   / Mostrar "Ainda não" /
   |                                   |
   +----------------+------------------+
                    |
                  (Fim)</code></pre>
<p>Resposta: pede a idade, e diz se a pessoa já pode tirar o título de eleitor. Os dois caminhos
da decisão se juntam de novo antes do Fim. Isso é comum e é correto: o fluxograma tem um único
Fim, e os caminhos convergem para ele.</p>

<h2>Glossário desta aula</h2>
<ul>
  <li><strong>Terminal:</strong> símbolo de início ou fim.</li>
  <li><strong>Processo:</strong> símbolo de ação.</li>
  <li><strong>Decisão:</strong> símbolo de pergunta com resposta sim ou não.</li>
  <li><strong>Entrada / Saída:</strong> símbolo para receber ou mostrar dado.</li>
</ul>

<h2>Resumo</h2>
<p>Oval começa e termina. Retângulo faz. Losango pergunta e sai por dois lados. Paralelogramo
lê ou mostra. Seta liga. Um Início, um Fim, leitura de cima para baixo.</p>
`,
    desafio: {
      titulo: 'Desenhando à mão os três algoritmos',
      enunciado: `<p>Pegue os três algoritmos que você escreveu no desafio anterior e transforme cada um em
fluxograma <strong>desenhado à mão</strong>, no caderno, usando os símbolos certos.</p>
<ul>
  <li>Um oval de Início e um de Fim em cada</li>
  <li>Cada ação em um retângulo, uma ação por retângulo</li>
  <li>Se em algum deles existe uma escolha ("se estiver chovendo, pego o guarda-chuva"), use um
  losango com os caminhos Sim e Não</li>
  <li>Setas ligando tudo, de cima para baixo</li>
</ul>
<p>Envie uma foto nítida dos três desenhos.</p>`,
    },
  },
  {
    slug: 'drawio-primeiro-fluxograma',
    titulo: 'draw.io na prática: o primeiro fluxograma no computador',
    min: 35,
    descricao: 'Abrir o draw.io sem instalar nada, montar um fluxograma de sequência, salvar e exportar em PNG.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Abrir o draw.io no navegador e criar um diagrama em branco</li>
  <li>Encontrar os símbolos de fluxograma e ligá-los com setas</li>
  <li>Salvar o arquivo editável e exportar uma imagem para entregar</li>
</ul>

<h2>Por que draw.io</h2>
<p>Existem dezenas de programas para desenhar fluxograma. O <strong>draw.io</strong> (também
chamado <strong>diagrams.net</strong>, é o mesmo programa) foi escolhido por quatro motivos:</p>
<ul>
  <li>É gratuito de verdade, sem versão paga escondida</li>
  <li>Roda no navegador, sem instalar e sem criar conta</li>
  <li>Tem versão para instalar no computador, de código aberto, para quem quer usar sem internet</li>
  <li>Empresas usam. O que você aprende aqui é o que vai usar em estágio</li>
</ul>
<p>Endereço: <strong>app.diagrams.net</strong>. Se o laboratório da escola bloquear, o endereço
alternativo é <strong>draw.io</strong>, que leva para o mesmo lugar.</p>

<h2>Passo a passo: primeiro diagrama</h2>
<ol>
  <li>Abra <strong>app.diagrams.net</strong>. Na primeira tela ele pergunta onde salvar. Escolha
  <strong>Dispositivo</strong> (o próprio computador). Assim o arquivo fica com você, sem depender de
  conta.</li>
  <li>Clique em <strong>Criar novo diagrama</strong>, escolha <strong>Diagrama em branco</strong> e
  confirme.</li>
  <li>Se a tela estiver em inglês, vá no menu <strong>Extras &gt; Idioma</strong> (ou
  <strong>Extras &gt; Language</strong>) e escolha Português (Brasil). Recarregue a página.</li>
</ol>

<h2>Onde estão os símbolos</h2>
<p>Na coluna da esquerda fica a biblioteca de formas. O grupo <strong>Geral</strong> já tem o que
você precisa: retângulo, retângulo arredondado (serve como Início e Fim), losango e paralelogramo.
Se quiser o conjunto completo, clique em <strong>+ Mais formas</strong> no fim da coluna e marque
<strong>Fluxograma</strong>.</p>
<p>Para colocar uma forma na tela: clique nela na coluna, ou arraste. Para escrever dentro: dê
dois cliques na forma e digite.</p>

<h2>Ligando com setas</h2>
<p>Passe o mouse sobre uma forma. Aparecem quatro setinhas azuis nas bordas. Clique na de baixo e
arraste até a forma seguinte. A seta gruda nas duas e acompanha se você mover as caixas. Esse
detalhe importa: seta desenhada solta, sem grudar, se perde quando você arruma o desenho.</p>

<h2>Monte este agora</h2>
<p>Reproduza o fluxograma do miojo da primeira aula, agora com os símbolos certos: oval de Início,
cinco retângulos de ação, oval de Fim, setas ligando de cima para baixo.</p>
<p>Dicas de organização:</p>
<ul>
  <li>Selecione tudo (<code>Ctrl+A</code>) e use <strong>Organizar &gt; Alinhar &gt; Centro</strong>
  para deixar as caixas na mesma linha vertical</li>
  <li><strong>Organizar &gt; Distribuir &gt; Vertical</strong> deixa o espaço entre elas igual</li>
</ul>

<h2>Salvar e exportar</h2>
<p>São duas coisas diferentes, e você vai precisar das duas:</p>
<ul>
  <li><strong>Salvar</strong> (<code>Ctrl+S</code>) gera um arquivo <code>.drawio</code>. Esse é o
  editável. Guarde em uma pasta sua, com nome que diga o que é: <code>miojo.drawio</code>.</li>
  <li><strong>Exportar</strong> gera uma imagem para mostrar ou entregar. Menu
  <strong>Arquivo &gt; Exportar como &gt; PNG</strong>, marque <em>Fundo transparente</em> se
  quiser, e baixe. O PNG ninguém edita; por isso o <code>.drawio</code> continua importante.</li>
</ul>

<h2>Glossário desta aula</h2>
<ul>
  <li><strong>Exportar:</strong> gerar uma cópia em outro formato (imagem, PDF) a partir do
  arquivo original.</li>
  <li><strong>PNG:</strong> formato de imagem sem perda de qualidade, bom para diagramas.</li>
</ul>

<h2>Resumo</h2>
<p>app.diagrams.net, salvar no Dispositivo, formas no grupo Geral, setas pelas setinhas azuis.
Salvar gera <code>.drawio</code> (editável); exportar gera PNG (para entregar).</p>
`,
    desafio: {
      titulo: 'Um dos três, agora no draw.io',
      enunciado: `<p>Escolha o algoritmo mais simples dos três que você desenhou à mão (o que só tem sequência,
sem decisão) e monte no draw.io.</p>
<ul>
  <li>Símbolos certos: oval, retângulo, seta</li>
  <li>Setas grudadas nas formas (teste: mova uma caixa e veja se a seta acompanha)</li>
  <li>Caixas alinhadas ao centro e com espaço igual entre elas</li>
</ul>
<p>Envie <strong>dois arquivos</strong>: o <code>.drawio</code> e o PNG exportado.</p>`,
    },
  },
  {
    slug: 'decisao-o-fluxo-que-escolhe',
    titulo: 'Decisão: o fluxo que escolhe um caminho',
    min: 35,
    descricao: 'O losango na prática. Perguntas de sim ou não, caminhos que se separam e se juntam, decisão dentro de decisão.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Transformar uma escolha do mundo real em pergunta de sim ou não</li>
  <li>Desenhar os dois caminhos de uma decisão e juntá-los antes do Fim</li>
  <li>Encadear decisões quando existem mais de duas respostas</li>
</ul>

<h2>A pergunta tem que ter só duas respostas</h2>
<p>O losango aceita uma pergunta cuja resposta é <strong>sim</strong> ou <strong>não</strong>.
Nada de "qual é a cor?". Se a pergunta original tem mais respostas, você a quebra em várias
perguntas de sim ou não, uma atrás da outra.</p>
<p>Perguntas boas: <code>idade &gt;= 18?</code>, <code>está chovendo?</code>,
<code>saldo &gt;= valor?</code>. Perguntas ruins: <code>qual a idade?</code>,
<code>como está o tempo?</code>.</p>

<h2>Os dois caminhos se juntam</h2>
<p>Depois da decisão, cada caminho faz o que tem que fazer e os dois voltam a se encontrar. É
assim que o fluxograma continua tendo um único Fim.</p>
<pre><code>(Início)
   |
/ Ler nota /
   |
&lt; nota &gt;= 6? &gt;
   |          \\
  Sim          Não
   |             \\
/ Mostrar "Aprovado" /   / Mostrar "Recuperação" /
   |                          |
   +------------+-------------+
                |
              (Fim)</code></pre>
<p>No draw.io, escreva <em>Sim</em> e <em>Não</em> em cima das setas: dê dois cliques na seta e
digite. Sem essas etiquetas, ninguém sabe qual caminho é qual.</p>

<h2>Caminho que não faz nada</h2>
<p>Às vezes um dos lados não tem ação. "Se estiver chovendo, pego o guarda-chuva" e, se não
estiver, sigo em frente. O caminho <em>Não</em> vai direto para o ponto de encontro, sem caixa no
meio. Isso é normal.</p>

<h2>Decisão dentro de decisão</h2>
<p>Quando existem três respostas possíveis, você encadeia. Exemplo: classificar a nota em
"Excelente" (9 ou mais), "Aprovado" (de 6 a 8,9) ou "Recuperação" (abaixo de 6).</p>
<pre><code>&lt; nota &gt;= 9? &gt;
   |           \\
  Sim           Não
   |              \\
/ "Excelente" /   &lt; nota &gt;= 6? &gt;
   |                |          \\
   |               Sim          Não
   |                |             \\
   |         / "Aprovado" /   / "Recuperação" /
   |                |             |
   +--------+-------+-------------+
            |
          (Fim)</code></pre>
<p>Repare na <strong>ordem das perguntas</strong>. Se você perguntar <code>nota &gt;= 6?</code>
primeiro, quem tirou 9,5 responde Sim e vira "Aprovado", nunca chega em "Excelente". Da
condição mais exigente para a menos exigente. Esse erro de ordem é um dos mais comuns em
programação, e no fluxograma ele fica visível.</p>

<h2>Glossário desta aula</h2>
<ul>
  <li><strong>Condição:</strong> a pergunta de sim ou não dentro do losango.</li>
  <li><strong>Ponto de encontro:</strong> onde os caminhos de uma decisão voltam a ser um só.</li>
</ul>

<h2>Resumo</h2>
<p>Losango só aceita pergunta de sim ou não. Dois caminhos, etiquetados, que se juntam antes do
Fim. Mais de duas respostas: encadeie decisões, da condição mais exigente para a menos.</p>
`,
    desafio: {
      titulo: 'Caixa eletrônico',
      enunciado: `<p>Desenhe no draw.io o fluxograma de um saque em caixa eletrônico:</p>
<ol>
  <li>Ler a senha. Se estiver errada, mostrar "Senha incorreta" e terminar</li>
  <li>Ler o valor do saque</li>
  <li>Se o valor for maior que o saldo, mostrar "Saldo insuficiente" e terminar</li>
  <li>Se o valor não for múltiplo de 20, mostrar "Só notas de 20" e terminar</li>
  <li>Descontar o valor do saldo, entregar o dinheiro, mostrar o novo saldo</li>
</ol>
<p>Regras: um Início, um Fim, todas as setas de decisão etiquetadas com Sim e Não. Repare que os
"terminar" cedo precisam chegar no mesmo Fim de quem sacou.</p>
<p>Envie o <code>.drawio</code> e o PNG.</p>`,
    },
  },
  {
    slug: 'repeticao-o-fluxo-que-volta',
    titulo: 'Repetição: o fluxo que volta',
    min: 35,
    descricao: 'Seta que sobe. Repetir até uma condição mandar parar, contar quantas vezes, e o erro do laço que nunca termina.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Desenhar um caminho que volta para repetir passos</li>
  <li>Usar um contador para repetir um número certo de vezes</li>
  <li>Identificar no desenho quando a repetição nunca vai parar</li>
</ul>

<h2>A única seta que sobe</h2>
<p>Até agora todas as setas desciam. Repetição é o momento em que uma seta <strong>volta</strong>
para um ponto anterior. Programador chama isso de <strong>laço</strong> (em inglês, <em>loop</em>).</p>
<p>Exemplo: pedir a senha até acertar.</p>
<pre><code>(Início)
   |
   +-------------------+
   |                   |
/ Ler senha /          |
   |                   |
&lt; senha correta? &gt;    |
   |          \\        |
  Sim          Não ----+
   |
/ Mostrar "Entrou" /
   |
 (Fim)</code></pre>
<p>Enquanto a resposta for Não, o caminho sobe e o "Ler senha" acontece de novo. Só quando a
resposta é Sim o fluxo desce. A decisão é o <strong>portão</strong> do laço.</p>

<h2>Repetir um número certo de vezes</h2>
<p>Para fazer algo cinco vezes, use um <strong>contador</strong>: uma variável que começa em 1 e
sobe 1 a cada volta. A decisão pergunta se ele passou do limite.</p>
<pre><code>(Início)
   |
[contador = 1]
   |
   +---------------------------+
   |                           |
&lt; contador &lt;= 5? &gt;            |
   |          \\                |
  Sim          Não             |
   |             \\             |
/ Mostrar contador /   (Fim)   |
   |                           |
[contador = contador + 1] -----+</code></pre>
<p>Leia: começa em 1; enquanto for menor ou igual a 5, mostra e soma 1; quando chegar em 6, sai.
Isso mostra 1, 2, 3, 4, 5. A tabuada, a lista de chamada, a média de várias notas: tudo é esse
desenho com outra ação no meio.</p>

<h2>O laço que nunca termina</h2>
<p>Tire o retângulo <code>contador = contador + 1</code> do desenho acima. O contador fica em 1
para sempre, a pergunta responde Sim para sempre, e o fluxo nunca sai. Isso é o <strong>laço
infinito</strong>, e é o travamento de programa mais clássico que existe.</p>
<p>A regra para nunca cair nele: em todo laço, aponte no desenho <strong>qual caixa faz a
condição virar Não</strong>. Se nenhuma faz, o laço é infinito. No fluxograma isso é fácil de
conferir; no código, é onde as pessoas passam horas.</p>

<h2>Anotações no draw.io</h2>
<p>Seta que sobe pode cruzar outras. Para o desenho ficar legível, arraste o meio da seta para o
lado: ela ganha uma dobra e passa por fora. Se ainda assim ficar confuso, coloque um texto
"volta para Ler senha" junto da seta (dois cliques nela).</p>

<h2>Glossário desta aula</h2>
<ul>
  <li><strong>Laço:</strong> trecho do fluxograma que se repete enquanto uma condição for
  verdadeira.</li>
  <li><strong>Contador:</strong> variável que conta as voltas do laço.</li>
  <li><strong>Laço infinito:</strong> laço cuja condição nunca vira Não.</li>
</ul>

<h2>Resumo</h2>
<p>Repetição é seta que volta. A decisão é o portão: Sim repete, Não sai. Contador começa,
compara e soma. Todo laço precisa de uma caixa que faça a condição virar Não.</p>
`,
    desafio: {
      titulo: 'Tabuada e média da turma',
      enunciado: `<p>Dois fluxogramas no draw.io:</p>
<ol>
  <li><strong>Tabuada.</strong> Lê um número e mostra a tabuada dele de 1 a 10, no formato
  <code>7 x 3 = 21</code>. Use um contador.</li>
  <li><strong>Média da turma.</strong> Lê a nota de cada aluno até a pessoa digitar
  <code>-1</code>. No fim, mostra quantas notas foram digitadas e a média. Dica: você precisa de
  três variáveis, uma para a nota, uma para a soma e uma para a contagem.</li>
</ol>
<p>Em cada um, marque com um texto ao lado do desenho <strong>qual caixa faz o laço parar</strong>.</p>
<p>Envie os dois <code>.drawio</code> e os dois PNG.</p>`,
    },
  },
  {
    slug: 'do-fluxograma-ao-pseudocodigo',
    titulo: 'Do fluxograma ao pseudocódigo, e o desenho que roda sozinho',
    min: 35,
    descricao: 'Traduzir cada símbolo para uma linha de pseudocódigo. E o Flowgorithm, que executa o fluxograma na tela.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Traduzir um fluxograma para pseudocódigo, símbolo por símbolo</li>
  <li>Fazer o caminho inverso: ler pseudocódigo e desenhar</li>
  <li>Conhecer o Flowgorithm e ver um fluxograma sendo executado</li>
</ul>

<h2>Pseudocódigo é o fluxograma escrito</h2>
<p><strong>Pseudocódigo</strong> é código de mentira: escrito em português, com a estrutura de um
programa, mas sem as regras chatas de nenhuma linguagem. É a ponte entre o desenho e o código de
verdade, e é o que o curso de Lógica de Programação usa o tempo todo.</p>
<p>Cada símbolo tem uma tradução direta:</p>
<table>
  <tr><th>Símbolo</th><th>Pseudocódigo</th></tr>
  <tr><td>Oval Início / Fim</td><td><code>início</code> / <code>fim</code></td></tr>
  <tr><td>Paralelogramo de entrada</td><td><code>leia nota</code></td></tr>
  <tr><td>Paralelogramo de saída</td><td><code>escreva "Aprovado"</code></td></tr>
  <tr><td>Retângulo</td><td><code>media = (n1 + n2) / 2</code></td></tr>
  <tr><td>Losango com dois caminhos</td><td><code>se ... então ... senão ... fim se</code></td></tr>
  <tr><td>Laço (seta que volta)</td><td><code>enquanto ... faça ... fim enquanto</code></td></tr>
</table>

<h2>Exemplo completo</h2>
<p>O fluxograma da média com aprovação vira:</p>
<pre><code>início
  leia n1
  leia n2
  media = (n1 + n2) / 2
  se media &gt;= 6 então
    escreva "Aprovado"
  senão
    escreva "Recuperação"
  fim se
fim</code></pre>
<p>E o laço da senha:</p>
<pre><code>início
  leia senha
  enquanto senha &lt;&gt; "1234" faça
    escreva "Senha incorreta"
    leia senha
  fim enquanto
  escreva "Entrou"
fim</code></pre>
<p>Repare no recuo (a indentação): o que está dentro do <code>se</code> ou do
<code>enquanto</code> fica deslocado para a direita. No fluxograma, isso é o que está entre o
losango e o ponto de encontro. Mesma coisa, formas diferentes.</p>

<h2>O caminho inverso</h2>
<p>Ler pseudocódigo e desenhar o fluxograma é o exercício que mais treina a leitura de código.
Regra prática: cada linha vira um símbolo; <code>se</code> vira losango; <code>enquanto</code>
vira losango com seta voltando; <code>fim se</code> e <code>fim enquanto</code> viram o ponto de
encontro.</p>

<h2>Flowgorithm: o fluxograma que roda</h2>
<p>O draw.io desenha. O <strong>Flowgorithm</strong> desenha <em>e executa</em>: você monta o
fluxograma com os mesmos símbolos, aperta Play, e ele pede as entradas, faz as contas e mostra as
saídas na tela. Se você fez um laço infinito, ele trava na sua frente, o que é a melhor forma de
entender o que é um laço infinito.</p>
<ul>
  <li>Gratuito, feito para ensino, interface em português</li>
  <li>Só para Windows (no laboratório da escola funciona; em Linux precisa de um programa extra
  chamado Mono, e no celular não roda)</li>
  <li>Site: <strong>flowgorithm.org</strong>, menu <em>Download</em></li>
  <li>Bônus: ele traduz o fluxograma para Python, JavaScript, Java, PHP e outras linguagens. Você
  vê como o mesmo desenho vira código em cada uma.</li>
</ul>
<p>Por que não usamos ele desde o começo: ele só aceita fluxograma de programa. O draw.io serve
para qualquer processo (o miojo, o atendimento de uma loja, o fluxo de um aplicativo), e essa
liberdade é o que você mais vai usar fora da programação. Os dois se completam.</p>

<h2>Glossário desta aula</h2>
<ul>
  <li><strong>Pseudocódigo:</strong> algoritmo escrito em português estruturado, sem as regras de
  uma linguagem real.</li>
  <li><strong>Indentação:</strong> recuo à direita que mostra o que está dentro de um bloco.</li>
</ul>

<h2>Resumo</h2>
<p>Cada símbolo tem uma linha de pseudocódigo. Losango é <code>se</code>, seta que volta é
<code>enquanto</code>, ponto de encontro é <code>fim se</code> ou <code>fim enquanto</code>.
Flowgorithm executa o desenho e traduz para linguagens reais. Você está pronto para a Lógica de
Programação.</p>
`,
    desafio: {
      titulo: 'Tradução nos dois sentidos',
      enunciado: `<p>Duas partes:</p>
<ol>
  <li><strong>Do desenho para o texto.</strong> Pegue o fluxograma do caixa eletrônico (desafio
  da aula 4) e escreva o pseudocódigo dele, com indentação.</li>
  <li><strong>Do texto para o desenho.</strong> Desenhe no draw.io o fluxograma deste
  pseudocódigo:
<pre><code>início
  leia idade
  leia tem_documento
  se idade &gt;= 18 então
    se tem_documento = "sim" então
      escreva "Pode entrar"
    senão
      escreva "Volte com documento"
    fim se
  senão
    escreva "Não pode entrar"
  fim se
fim</code></pre>
  </li>
</ol>
<p>Extra, para quem tiver Windows: monte o fluxograma da tabuada no Flowgorithm, execute e tire
um print da saída.</p>
<p>Envie o pseudocódigo em PDF ou foto, o <code>.drawio</code> e o PNG da parte 2, e o print do
extra se fizer.</p>`,
    },
  },
]

const DESAFIO_DO_MODULO = {
  titulo: 'O fluxograma de um problema seu',
  enunciado: `
<p>O projeto do módulo é um fluxograma de <strong>um problema real</strong>, seu, da sua casa ou
da escola. Não é exercício de livro: é algo que, se fosse programado, alguém usaria.</p>
<p>Ideias: controle de presença de uma turma; caixa da cantina; empréstimo de livro na biblioteca;
divisão de tarefas da casa; fila de atendimento de uma loja; cálculo de quanto falta para
comprar algo que você quer.</p>

<h3>O que entregar</h3>
<ul>
  <li><strong>Um fluxograma no draw.io</strong>, com o <code>.drawio</code> e o PNG exportado</li>
  <li><strong>Pelo menos duas decisões e um laço.</strong> Problema real quase sempre tem</li>
  <li><strong>Símbolos certos</strong>: um Início, um Fim, setas etiquetadas com Sim e Não,
  entrada e saída em paralelogramo</li>
  <li><strong>O pseudocódigo</strong> do mesmo fluxograma, em PDF ou foto, com indentação</li>
  <li><strong>Um parágrafo</strong> no início do PDF dizendo quem usaria isso e para quê</li>
</ul>

<h3>Como será avaliado</h3>
<table>
  <tr><th>Critério</th><th>O que se espera</th></tr>
  <tr><td>Resolve algo real</td><td>Dá para explicar em uma frase quem usa e para quê</td></tr>
  <tr><td>Está certo</td><td>Seguindo o desenho ao pé da letra, chega no resultado esperado</td></tr>
  <tr><td>Símbolos</td><td>Cada forma no lugar certo, setas etiquetadas, um Início e um Fim</td></tr>
  <tr><td>Laço termina</td><td>Existe uma caixa que faz a condição do laço virar Não</td></tr>
  <tr><td>Legibilidade</td><td>Caixas alinhadas, texto curto, setas que não se cruzam sem
  necessidade</td></tr>
  <tr><td>Tradução</td><td>O pseudocódigo bate com o desenho, símbolo por símbolo</td></tr>
</table>

<h3>Como enviar</h3>
<p>Um único <code>.zip</code> com o <code>.drawio</code>, o PNG e o PDF do pseudocódigo. Ou os
três arquivos separados.</p>
`,
  instrucoes: 'Envie o .drawio, o PNG exportado e o PDF com o pseudocódigo (juntos em um .zip ou separados).',
  formatos: '.zip, .drawio, .png, .pdf',
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
  const [existente] = await c.query('SELECT id FROM modulos WHERE slug = ?', [MODULO.slug])
  let moduloId = existente?.id

  if (!moduloId) {
    acao(`abrir espaço: módulos de ordem >= ${MODULO.ordem} vão uma casa para frente`)
    if (APLICAR) await c.query('UPDATE modulos SET ordem = ordem + 1 WHERE ordem >= ?', [MODULO.ordem])
    acao(`criar módulo "${MODULO.nome}" (${MODULO.nivel}, ${MODULO.carga}h) na ordem ${MODULO.ordem}, publicado=${PUB}`)
    if (APLICAR) {
      await c.query(
        `INSERT INTO modulos (id, nome, slug, descricao, nivel, ordem, carga_horaria, publicado, criado_em, atualizado_em)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [MODULO.nome, MODULO.slug, MODULO.descricao, MODULO.nivel, MODULO.ordem, MODULO.carga, PUB]
      )
      moduloId = (await c.query('SELECT id FROM modulos WHERE slug = ?', [MODULO.slug]))[0].id
    }
  } else {
    acao(`módulo já existe, atualizando${PUBLICAR ? ' e publicando' : ''}`)
    if (APLICAR) {
      await c.query(
        `UPDATE modulos SET nome=?, descricao=?, nivel=?, carga_horaria=?, publicado=IF(?, 1, publicado), atualizado_em=NOW() WHERE id=?`,
        [MODULO.nome, MODULO.descricao, MODULO.nivel, MODULO.carga, PUB, moduloId])
    }
  }

  const [trilha] = await c.query("SELECT id FROM trilhas WHERE slug = 'programacao'")
  const [cursoExistente] = await c.query('SELECT id FROM cursos WHERE slug = ?', [CURSO.slug])
  let cursoId = cursoExistente?.id

  if (!cursoId) {
    acao(`empurrar a trilha: quem está em ${CURSO.ordemNaTrilha} ou depois anda uma casa`)
    if (APLICAR && trilha) {
      await c.query('UPDATE cursos SET ordem_na_trilha = ordem_na_trilha + 1 WHERE trilha_id = ? AND ordem_na_trilha >= ?',
        [trilha.id, CURSO.ordemNaTrilha])
    }
    acao(`criar curso "${CURSO.titulo}" na trilha Programação, posição ${CURSO.ordemNaTrilha}, publicado=${PUB}`)
    if (APLICAR) {
      await c.query(
        `INSERT INTO cursos (id, titulo, slug, descricao, categoria, nivel, autor_nome, publicado,
                             ordem, carga_horaria, modulo_id, ordem_no_modulo, trilha_id, ordem_na_trilha,
                             created_at, updated_at, criado_em, atualizado_em)
         VALUES (UUID(), ?, ?, ?, ?, 'Fácil', 'André Gomes', ?, 19, ?, ?, 1, ?, ?, NOW(), NOW(), NOW(), NOW())`,
        [CURSO.titulo, CURSO.slug, CURSO.descricao, CURSO.categoria, PUB, CURSO.carga, moduloId, trilha?.id ?? null, CURSO.ordemNaTrilha]
      )
      cursoId = (await c.query('SELECT id FROM cursos WHERE slug = ?', [CURSO.slug]))[0].id
    }
  } else {
    acao(`curso já existe, atualizando${PUBLICAR ? ' e publicando' : ''}`)
    if (APLICAR) {
      await c.query(
        `UPDATE cursos SET titulo=?, descricao=?, carga_horaria=?, modulo_id=?, publicado=IF(?, 1, publicado), atualizado_em=NOW() WHERE id=?`,
        [CURSO.titulo, CURSO.descricao, CURSO.carga, moduloId, PUB, cursoId])
    }
  }

  for (const [i, aula] of AULAS.entries()) {
    const [ja] = APLICAR ? await c.query('SELECT id FROM aulas WHERE slug = ? AND curso_id = ?', [aula.slug, cursoId]) : []
    acao(`aula ${i + 1}: ${aula.titulo}${ja ? ' (atualiza)' : ''}`)
    if (!APLICAR) continue

    if (ja) {
      await c.query(
        `UPDATE aulas SET titulo=?, descricao=?, conteudo=?, ordem=?, duracao_estimada_min=?, publicado=IF(?, 1, publicado), updated_at=NOW() WHERE id=?`,
        [aula.titulo, aula.descricao, aula.conteudo.trim(), i + 1, aula.min, PUB, ja.id])
    } else {
      await c.query(
        `INSERT INTO aulas (id, curso_id, titulo, slug, descricao, ordem, duracao_estimada_min, publicado, conteudo, created_at, updated_at)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [cursoId, aula.titulo, aula.slug, aula.descricao, i + 1, aula.min, PUB, aula.conteudo.trim()]
      )
    }
    const [aulaId] = await c.query('SELECT id FROM aulas WHERE slug = ? AND curso_id = ?', [aula.slug, cursoId])

    const [desafioJa] = await c.query('SELECT id FROM curso_desafios WHERE aula_id = ?', [aulaId.id])
    if (desafioJa) {
      await c.query('UPDATE curso_desafios SET titulo=?, enunciado=?, ordem=?, formatos_aceitos=? WHERE id=?',
        [aula.desafio.titulo, aula.desafio.enunciado.trim(), i + 1, FORMATOS, desafioJa.id])
    } else {
      await c.query(
        `INSERT INTO curso_desafios (id, curso_id, aula_id, titulo, enunciado, tipo, ordem, vale_certificado, formatos_aceitos, created_at)
         VALUES (UUID(), ?, ?, ?, ?, 'pratico', ?, 0, ?, NOW())`,
        [cursoId, aulaId.id, aula.desafio.titulo, aula.desafio.enunciado.trim(), i + 1, FORMATOS]
      )
    }
  }

  acao(`projeto do módulo: ${DESAFIO_DO_MODULO.titulo}`)
  if (APLICAR) {
    const [ja] = await c.query('SELECT id FROM curso_desafios WHERE modulo_id = ?', [moduloId])
    if (ja) {
      await c.query('UPDATE curso_desafios SET titulo=?, enunciado=?, instrucoes_envio=?, formatos_aceitos=? WHERE id=?',
        [DESAFIO_DO_MODULO.titulo, DESAFIO_DO_MODULO.enunciado.trim(), DESAFIO_DO_MODULO.instrucoes, DESAFIO_DO_MODULO.formatos, ja.id])
    } else {
      await c.query(
        `INSERT INTO curso_desafios (id, modulo_id, titulo, enunciado, tipo, ordem, vale_certificado, instrucoes_envio, formatos_aceitos, created_at)
         VALUES (UUID(), ?, ?, ?, 'projeto', 99, 1, ?, ?, NOW())`,
        [moduloId, DESAFIO_DO_MODULO.titulo, DESAFIO_DO_MODULO.enunciado.trim(), DESAFIO_DO_MODULO.instrucoes, DESAFIO_DO_MODULO.formatos]
      )
    }
  }

  if (!APLICAR) console.log('\n(simulação: passe --aplicar para gravar como rascunho, --publicar para ligar)')
  else console.log(`\nmódulo, curso, ${AULAS.length} aulas e ${AULAS.length + 1} desafios no lugar (publicado=${PUB})`)
} finally {
  c.release()
  await pool.end()
}
