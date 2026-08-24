/**
 * Amplia Excel do Zero ao PROCV e Pacote Office.
 *
 *   node scripts/conteudo-excel.mjs --aplicar
 *
 * O levantamento de cobertura mostrou dois temas AUSENTES — importar dados de
 * fora e a integração entre Excel, Word e PowerPoint — e um terceiro que
 * aparecia de passagem em seis aulas sem nunca ter uma própria: a referência
 * absoluta, que é o conceito que mais trava quem aprende Excel.
 */
import { aplicar } from './lib-conteudo.mjs'

const AMPLIACOES = {
  'aula-1-fundamentos': `
<h2>Os atalhos que mudam o ritmo</h2>
<table>
  <tr><th>Atalho</th><th>Faz</th></tr>
  <tr><td><code>Ctrl + setas</code></td><td>pula para o fim do bloco de dados — em planilha de 5.000 linhas, é instantâneo</td></tr>
  <tr><td><code>Ctrl + Shift + setas</code></td><td>seleciona até o fim do bloco</td></tr>
  <tr><td><code>Ctrl + ;</code></td><td>insere a data de hoje</td></tr>
  <tr><td><code>Alt + =</code></td><td>soma automática</td></tr>
  <tr><td><code>Ctrl + D</code></td><td>copia a célula de cima</td></tr>
  <tr><td><code>F2</code></td><td>edita a célula sem apagar o que tem</td></tr>
  <tr><td><code>Ctrl + Z</code></td><td>desfaz — e no Excel ele guarda muitos passos</td></tr>
</table>
<p>O primeiro par é o que mais economiza tempo: quem arrasta a barra de rolagem até a linha 5.000
gasta minutos por dia no que leva um segundo.</p>

<h2>Célula, linha, coluna e o endereço</h2>
<p>Coluna é letra, linha é número, e o endereço junta os dois: <code>B7</code> é a coluna B, linha 7.
Parece óbvio e vale fixar, porque toda fórmula é conversa sobre endereços.</p>
<p>Um detalhe que confunde: <code>B7</code> e <code>7B</code> não são a mesma coisa — o segundo não
existe. Letra sempre primeiro.</p>

<h2>O que o Excel entende como número</h2>
<pre>digitado          o Excel entende
1.500             mil e quinhentos (se o separador for ponto)
1,5               um e meio
01/08/2026        data — e faz conta com ela
00123             texto, e perde os zeros se for número
(100)             menos cem, em formato contábil</pre>
<p>Número alinha à direita sozinho; texto, à esquerda. Esse alinhamento automático é o jeito mais
rápido de descobrir que aquele "número" que não soma é, na verdade, texto.</p>

<h2>Faça agora</h2>
<p>Digite <code>123</code> numa célula e <code>'123</code> (com apóstrofo) em outra. Olhe o
alinhamento e tente somar as duas com <code>=A1+A2</code>. O que acontece é o motivo de metade dos
"minha soma não funciona".</p>
`,

  'aula-2-formulas-basicas': `
<h2>Toda fórmula começa com igual</h2>
<p>Sem o <code>=</code>, o Excel trata como texto. É o erro mais comum do primeiro dia, e o sintoma é
claro: aparece <code>2+2</code> na célula em vez de <code>4</code>.</p>

<h2>Somar sem digitar célula por célula</h2>
<pre>=A1+A2+A3+A4+A5        funciona, e quebra ao inserir linha
=SOMA(A1:A5)           o intervalo acompanha</pre>
<p>Os dois pontos significam "até". <code>A1:A5</code> é da A1 até a A5, e o intervalo se ajusta
quando você insere ou apaga linha no meio — a soma manual, não.</p>

<h2>A ordem das operações</h2>
<pre>=2+3*4        14, não 20 — multiplicação primeiro
=(2+3)*4      20</pre>
<p>A mesma regra da matemática, e o mesmo conselho: use parênteses quando houver dúvida. Eles não
custam nada e deixam claro o que você quis dizer.</p>

<h2>Ver a fórmula em vez do resultado</h2>
<p><code>Ctrl + \`</code> (a tecla da crase, ao lado do 1) alterna a planilha inteira entre mostrar
resultados e mostrar fórmulas. É a ferramenta mais rápida para conferir uma planilha que alguém
entregou — e para achar aquela célula em que o valor foi digitado à mão no meio de uma coluna de
fórmulas.</p>
<p>Esse caso, aliás, é o defeito mais perigoso em planilha: uma célula com número fixo onde deveria
haver fórmula. Ela não acusa erro, e o total fica errado para sempre.</p>

<h2>Faça agora</h2>
<p>Monte uma coluna de cinco valores com a soma embaixo. Depois substitua o valor de uma célula do
meio por outro e veja a soma acompanhar. Por fim, aperte <code>Ctrl + \`</code> e veja a planilha
inteira por dentro.</p>
`,

  'aula-7-procv': `
<h2>Por que ele erra tanto</h2>
<p>O PROCV tem quatro exigências que, se qualquer uma falhar, produzem <code>#N/D</code>:</p>
<table>
  <tr><th>Exigência</th><th>Se falhar</th></tr>
  <tr><td>O que se procura tem de estar na <strong>primeira coluna</strong> do intervalo</td><td>#N/D, mesmo o valor existindo</td></tr>
  <tr><td>O último argumento deve ser <code>FALSO</code></td><td>traz resultado errado sem avisar</td></tr>
  <tr><td>O intervalo precisa estar travado com <code>$</code></td><td>funciona na primeira linha e falha ao arrastar</td></tr>
  <tr><td>Os tipos têm de bater</td><td>número procurado numa coluna de texto não casa</td></tr>
</table>
<p>O segundo é o mais traiçoeiro: com <code>VERDADEIRO</code> ou omitido, o PROCV faz busca
aproximada e devolve o valor mais próximo — sem qualquer aviso. Numa tabela de preços, isso é
cobrar o valor errado e nunca perceber.</p>
<p>Grave a forma completa e não abra exceção:</p>
<pre>=PROCV(valor; $A$2:$D$100; 3; FALSO)</pre>

<h2>O #N/D que não é erro</h2>
<p>Às vezes o valor realmente não existe — e aí o <code>#N/D</code> está certo. O que atrapalha é a
tela cheia deles.</p>
<pre>=SEERRO(PROCV(A2; $F$2:$G$50; 2; FALSO); "não encontrado")</pre>
<p>Use com cuidado: o <code>SEERRO</code> esconde <strong>qualquer</strong> erro, inclusive o de
fórmula mal escrita. Só aplique depois de confirmar que a fórmula está certa — senão você desliga o
alarme em vez de apagar o incêndio.</p>

<h2>Faça agora</h2>
<p>Monte uma tabela de preços e use PROCV para trazer o valor de um produto. Depois arraste a fórmula
para baixo <strong>sem</strong> o cifrão no intervalo e veja o resultado quebrar a partir da segunda
linha. Coloque o cifrão e arraste de novo.</p>
`,

  'aula-15-tabela-dinamica': `
<h2>O que a tabela dinâmica dispensa</h2>
<p>Aquela sequência de SOMASE, CONT.SE e filtros manuais que você faria para responder "quanto cada
turma gastou por mês" — a tabela dinâmica faz arrastando campos.</p>
<p>E, diferente das fórmulas, ela se refaz inteira ao mudar a pergunta: basta arrastar o campo para
outro lugar.</p>

<h2>Os quatro lugares</h2>
<table>
  <tr><th>Área</th><th>Recebe</th><th>Exemplo</th></tr>
  <tr><td>Linhas</td><td>o que vira cada linha</td><td>turma</td></tr>
  <tr><td>Colunas</td><td>o que vira cada coluna</td><td>mês</td></tr>
  <tr><td>Valores</td><td>o que é somado ou contado</td><td>valor gasto</td></tr>
  <tr><td>Filtros</td><td>o recorte de tudo</td><td>ano</td></tr>
</table>
<p>A regra que evita frustração: <strong>uma coisa por vez em Valores</strong>. Empilhar cinco campos
ali produz uma tabela que ninguém lê.</p>

<h2>O que a origem precisa ter</h2>
<p>Tabela dinâmica exige dados organizados em formato de lista:</p>
<ul>
  <li>Uma linha de cabeçalho, com nome em toda coluna</li>
  <li>Nenhuma linha em branco no meio</li>
  <li>Nenhuma célula mesclada</li>
  <li>Um registro por linha</li>
</ul>
<p>Célula mesclada é a causa mais comum de a tabela dinâmica recusar os dados — e ela costuma estar
lá porque alguém quis deixar o cabeçalho bonito.</p>

<h2>Ela não atualiza sozinha</h2>
<p>Ao mudar os dados de origem, a tabela dinâmica continua mostrando o resultado antigo até você
clicar em Atualizar. É uma armadilha silenciosa: a planilha mostra número desatualizado e ninguém
percebe.</p>

<h2>Faça agora</h2>
<p>Com uma lista de gastos por turma e mês, monte a tabela dinâmica. Depois mude um valor na origem e
repare que o resumo não muda — até você atualizar.</p>
`,

  'word-estilos-documentos-longos': `
<h2>Estilo não é formatação manual</h2>
<p>Selecionar o título e clicar em negrito e tamanho 16 <em>parece</em> a mesma coisa que aplicar o
estilo Título 1. Não é, e a diferença aparece em quatro lugares:</p>
<ul>
  <li><strong>Sumário automático</strong> — só funciona com estilos</li>
  <li><strong>Mudança global</strong> — trocar a fonte de todos os títulos é uma alteração, não
    trinta</li>
  <li><strong>Painel de navegação</strong> — permite pular entre seções</li>
  <li><strong>Acessibilidade</strong> — leitor de tela lista os títulos, como no HTML</li>
</ul>
<p>É exatamente o mesmo princípio do <code>&lt;h1&gt;</code> e <code>&lt;h2&gt;</code> que aparece no
curso de HTML: <strong>marcar pelo significado, não pela aparência</strong>. A ferramenta muda; a
ideia é a mesma.</p>

<h2>Sumário que se atualiza</h2>
<p>Com os títulos em estilo, o sumário é Referências → Sumário → Automático. Depois, um clique em
Atualizar refaz página e numeração.</p>
<p>Sumário digitado à mão dá certo até a primeira revisão que empurra tudo uma página — e aí toda a
numeração está errada, sem avisar.</p>

<h2>Quebra de página, não Enter repetido</h2>
<pre>ruim      apertar Enter até o texto cair na próxima página
certo     Ctrl + Enter</pre>
<p>Com Enter, qualquer alteração acima desmonta o documento inteiro. A quebra de página fica ancorada
onde você quis.</p>

<h2>Faça agora</h2>
<p>Pegue um trabalho seu com títulos formatados à mão. Aplique os estilos Título 1 e Título 2,
insira o sumário automático e depois mude a cor de todos os títulos alterando o estilo, em um lugar
só. Cronometre — e compare com o tempo de fazer um por um.</p>
`,

  'powerpoint-estrutura-eficaz': `
<h2>Slide não é documento</h2>
<p>O erro que domina as apresentações escolares: o slide com o texto inteiro, e a pessoa lendo. Se
tudo está escrito, você não é necessário — bastaria enviar o arquivo.</p>
<table>
  <tr><th>No slide</th><th>Com você</th></tr>
  <tr><td>a ideia, em poucas palavras</td><td>a explicação</td></tr>
  <tr><td>o gráfico, o número</td><td>o que ele significa</td></tr>
  <tr><td>a imagem</td><td>a história dela</td></tr>
</table>
<p>Uma referência prática: se o slide tem mais de trinta palavras, provavelmente é anotação, não
slide.</p>

<h2>Uma ideia por slide</h2>
<p>Slide com quatro assuntos divide a atenção — a plateia lê um enquanto você fala de outro, e perde
os dois. Prefira quatro slides simples a um cheio.</p>

<h2>A estrutura que funciona</h2>
<ol>
  <li><strong>Abertura</strong> — o problema ou a pergunta que a apresentação responde</li>
  <li><strong>Contexto</strong> — o mínimo necessário</li>
  <li><strong>Desenvolvimento</strong> — uma ideia por slide</li>
  <li><strong>Fecho</strong> — a mensagem que deve sobrar</li>
</ol>
<p>Comece pela pergunta, não pela definição. "O que fazer com 400 kg de lixo eletrônico que a escola
guarda?" prende bem mais que "Lixo eletrônico é todo resíduo de equipamento...".</p>

<h2>Faça agora</h2>
<p>Pegue uma apresentação sua e conte as palavras do slide mais cheio. Reescreva-o com no máximo
quinze, passando o resto para a sua fala. Depois apresente os dois para alguém e pergunte qual foi
mais fácil de acompanhar.</p>
`,
}

const NOVAS = [
  {
    curso: 'excel-do-zero',
    slug: 'excel-referencia-absoluta',
    titulo: 'O cifrão: quando a fórmula se muda de lugar',
    min: 7, ordem: 3,
    descricao: 'Referência relativa e absoluta — o conceito que mais trava quem aprende Excel.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Entender por que a fórmula muda ao ser arrastada</li>
  <li>Travar linha, coluna ou as duas com o cifrão</li>
  <li>Reconhecer quando cada tipo é necessário</li>
</ul>

<h2>A fórmula anda junto</h2>
<p>Escreva <code>=A1*2</code> em <code>B1</code> e arraste para baixo. Em <code>B2</code> ela virou
<code>=A2*2</code>, em <code>B3</code>, <code>=A3*2</code>. O Excel não copiou o texto — ele copiou a
<em>relação</em>: "a célula uma coluna à esquerda, na mesma linha".</p>
<p>Isso se chama referência <strong>relativa</strong>, é o padrão, e é o que faz o Excel funcionar:
você escreve a fórmula uma vez e ela vale para mil linhas.</p>

<h2>Quando a relação atrapalha</h2>
<p>Agora imagine uma tabela de preços com o desconto guardado numa única célula, <code>E1</code>:</p>
<pre>     A            B          C
1    Produto      Preço      Com desconto        E1 = 0,10
2    Caderno      15,00      =B2*(1-E1)
3    Caneta        3,00      =B3*(1-E2)   ← E2 está vazia!
4    Mochila     120,00      =B4*(1-E3)   ← E3 também</pre>
<p>Ao arrastar, o <code>E1</code> andou junto e virou <code>E2</code>, <code>E3</code> — que estão
vazias. O resultado: da segunda linha em diante, desconto zero. E o pior é que <strong>não aparece
erro nenhum</strong>: a conta é feita, e sai errada.</p>

<h2>O cifrão trava</h2>
<pre>=B2*(1-$E$1)</pre>
<p>O <code>$</code> antes da letra trava a coluna; antes do número, trava a linha. Com os dois,
aquela referência aponta para <code>E1</code> não importa para onde a fórmula vá.</p>
<table>
  <tr><th>Escrito</th><th>Ao arrastar</th><th>Chama-se</th></tr>
  <tr><td><code>E1</code></td><td>muda coluna e linha</td><td>relativa</td></tr>
  <tr><td><code>$E$1</code></td><td>não muda nada</td><td>absoluta</td></tr>
  <tr><td><code>$E1</code></td><td>muda só a linha</td><td>mista (coluna travada)</td></tr>
  <tr><td><code>E$1</code></td><td>muda só a coluna</td><td>mista (linha travada)</td></tr>
</table>
<p>Atalho: com o cursor sobre a referência na barra de fórmulas, a tecla <strong>F4</strong>
alterna entre os quatro. Apertar quatro vezes volta ao começo.</p>

<h2>Onde a mista aparece</h2>
<p>A referência mista parece exótica até você montar uma tabuada — que é o exemplo clássico e o mais
esclarecedor:</p>
<pre>         B      C      D      E
1              1      2      3        ← multiplicadores na linha 1
2    1    =$A2*B$1
3    2
4    3
     ↑
  multiplicandos na coluna A</pre>
<p>Uma única fórmula preenche a grade inteira: <code>$A2</code> trava a coluna A (o número da linha
continua andando) e <code>B$1</code> trava a linha 1 (a letra continua andando). Arraste para os dois
lados e a tabuada aparece.</p>
<p>Se você entendeu esse exemplo, entendeu o cifrão. Ele é o teste definitivo.</p>

<h2>A pergunta que decide</h2>
<p>Ao escrever qualquer fórmula que será arrastada, pergunte de cada referência:
<strong>essa célula deve acompanhar, ou deve ficar parada?</strong></p>
<ul>
  <li>Dado da própria linha (o preço daquele produto) → <strong>relativa</strong></li>
  <li>Valor único usado por todos (taxa, desconto, meta) → <strong>absoluta</strong></li>
  <li>Tabela de busca no PROCV → <strong>absoluta</strong>, sempre</li>
</ul>

<h2>Faça agora</h2>
<p>Monte a tabela de preços com desconto numa célula só. Arraste primeiro <strong>sem</strong> o
cifrão e olhe os resultados a partir da segunda linha — repare que não há erro visível, só valores
errados. Depois ponha <code>$E$1</code> e arraste de novo.</p>
`,
    desafio: {
      titulo: 'A tabuada em uma fórmula só',
      enunciado: `<p>Monte uma tabuada completa de 1 a 10, em grade, usando <strong>uma única fórmula</strong> escrita uma vez e arrastada para os dois lados.</p>
<ul>
  <li>Multiplicandos de 1 a 10 na coluna A</li>
  <li>Multiplicadores de 1 a 10 na linha 1</li>
  <li>A fórmula na célula B2, arrastada para preencher toda a grade</li>
</ul>
<p>Depois, na mesma planilha, monte uma tabela de produtos com preço, e três colunas de desconto —
5%, 10% e 15% — com as taxas em <strong>uma linha de cabeçalho</strong>. Preencha as três colunas
também com uma fórmula só, arrastada.</p>
<p>Nas duas, explique num comentário <strong>qual referência você travou e por quê</strong>. Se
alguma célula precisou de fórmula diferente das outras, o travamento está errado — refaça.</p>`,
    },
  },
  {
    curso: 'excel-do-zero',
    slug: 'excel-erros',
    titulo: 'Quando a fórmula dá erro',
    min: 6, ordem: 9,
    descricao: 'O que cada mensagem de erro está dizendo, e o que fazer com ela.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Reconhecer os erros do Excel e a causa de cada um</li>
  <li>Usar as ferramentas de rastreamento de fórmula</li>
  <li>Saber quando esconder o erro e quando não</li>
</ul>

<h2>O catálogo</h2>
<table>
  <tr><th>Erro</th><th>Diz</th><th>Causa comum</th></tr>
  <tr><td><code>#####</code></td><td>não cabe</td><td>coluna estreita — só alargar</td></tr>
  <tr><td><code>#DIV/0!</code></td><td>divisão por zero</td><td>o divisor está vazio ou é zero</td></tr>
  <tr><td><code>#VALOR!</code></td><td>tipo errado</td><td>tentou somar texto com número</td></tr>
  <tr><td><code>#REF!</code></td><td>a referência sumiu</td><td>a célula usada foi apagada</td></tr>
  <tr><td><code>#NOME?</code></td><td>não conheço esse nome</td><td>erro de digitação no nome da função</td></tr>
  <tr><td><code>#N/D</code></td><td>não encontrei</td><td>PROCV sem correspondência</td></tr>
  <tr><td><code>#NULO!</code></td><td>intervalos não se cruzam</td><td>espaço no lugar de <code>;</code></td></tr>
</table>
<p>Os dois primeiros são inofensivos e se resolvem sozinhos. O <code>#REF!</code> é o mais grave:
significa que alguém apagou uma linha ou coluna de que a fórmula dependia — e não há como o Excel
adivinhar o que era. Aí o desfazer é o melhor amigo, se for logo.</p>

<h2>#VALOR!: quase sempre é texto disfarçado</h2>
<p>Número copiado de site ou de PDF costuma vir como texto — às vezes com espaço invisível junto.
A soma ignora, ou a fórmula dá <code>#VALOR!</code>.</p>
<p>Como confirmar: número alinha à direita sozinho, texto à esquerda. Se a coluna de "valores" está
toda à esquerda, é isso.</p>
<pre>=VALOR(ARRUMAR(A2))     tira espaços e converte para número</pre>

<h2>As ferramentas de rastreamento</h2>
<p>Na aba Fórmulas, três recursos que quase ninguém usa e que resolvem em segundos:</p>
<ul>
  <li><strong>Rastrear Precedentes</strong> — desenha setas mostrando de quais células esta fórmula
    depende</li>
  <li><strong>Rastrear Dependentes</strong> — mostra quem depende desta. Use <em>antes</em> de apagar
    qualquer coisa</li>
  <li><strong>Avaliar Fórmula</strong> — executa a fórmula passo a passo, mostrando o resultado
    parcial de cada pedaço</li>
</ul>
<p>O "Avaliar Fórmula" é o teste de mesa do Excel: numa fórmula aninhada com quatro funções, ele
mostra exatamente em qual pedaço o resultado saiu do esperado.</p>

<h2>Esconder erro é decisão, não hábito</h2>
<pre>=SEERRO(PROCV(...); "não encontrado")</pre>
<p>Serve quando o erro é <strong>esperado</strong> — o cadastro que ainda não existe, a linha em
branco. Nesse caso, mostrar "não encontrado" é melhor que uma tela de <code>#N/D</code>.</p>
<p>O problema é usá-lo antes de conferir: o <code>SEERRO</code> engole qualquer erro, inclusive a
fórmula escrita errada. A planilha fica limpa, e errada. É o mesmo caso do <code>except: pass</code>
em Python — desligar o alarme não apaga o incêndio.</p>

<h2>O erro que o Excel não mostra</h2>
<p>Pior que qualquer mensagem: o valor digitado à mão no meio de uma coluna de fórmulas. Não acusa
nada, e o total fica errado para sempre.</p>
<p>Como caçar: <code>Ctrl + \`</code> mostra as fórmulas da planilha inteira. A célula que aparece só
com um número, no meio de fórmulas, é a suspeita.</p>

<h2>Faça agora</h2>
<p>Provoque os erros de propósito numa planilha de teste: divida por uma célula vazia, some texto com
número, escreva <code>=SOMATORIO(A1:A5)</code>, e apague uma coluna usada por uma fórmula. Anote a
mensagem de cada um. Reconhecê-las de cara é o que economiza tempo depois.</p>
`,
    desafio: {
      titulo: 'Conserte a planilha quebrada',
      enunciado: `<p>Monte uma planilha de controle — notas, gastos, estoque — e depois <strong>quebre-a de propósito</strong>, criando pelo menos cinco erros diferentes:</p>
<ul>
  <li>Um <code>#DIV/0!</code></li>
  <li>Um <code>#VALOR!</code> por número que é texto</li>
  <li>Um <code>#REF!</code> apagando uma coluna</li>
  <li>Um <code>#NOME?</code> por função digitada errada</li>
  <li>Um <code>#N/D</code> num PROCV</li>
  <li>E o pior de todos: um valor digitado à mão no meio de uma coluna de fórmulas</li>
</ul>
<p>Troque a planilha com um colega e conserte a dele. Para cada erro, anote: qual era a mensagem,
qual a causa, e como você corrigiu.</p>
<p>O sexto item é o teste de verdade — <strong>ele não dá mensagem nenhuma</strong>. Quem achar
esse achou porque procurou, e a ferramenta para procurar está na aula.</p>`,
    },
  },
  {
    curso: 'excel-do-zero',
    slug: 'excel-dados-de-fora',
    titulo: 'Trazendo dados de fora',
    min: 7, ordem: 12,
    descricao: 'Importar CSV, limpar o que veio bagunçado e separar o que veio grudado.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Importar um arquivo CSV sem embaralhar os dados</li>
  <li>Limpar dado que veio de outro sistema</li>
  <li>Separar informação que veio numa coluna só</li>
</ul>

<h2>De onde vêm os dados reais</h2>
<p>Na prática, quase nenhuma planilha começa vazia: os dados vêm de um sistema, de um formulário, de
um relatório em PDF. E chegam bagunçados — é a regra, não a exceção.</p>
<p>Saber limpar vale mais do que saber fórmula: o tempo de quem trabalha com dados é gasto quase todo
nessa parte.</p>

<h2>Abrir CSV sem estragar</h2>
<p>Dar duplo clique num CSV costuma dar errado: o Excel adivinha o separador e a codificação, e
adivinha mal. O resultado são acentos quebrados, tudo numa coluna só, ou datas viradas.</p>
<p>O caminho certo é <strong>Dados → Obter Dados → De Texto/CSV</strong>. Ali você escolhe:</p>
<ul>
  <li><strong>Origem do arquivo</strong> — UTF-8 resolve o acento</li>
  <li><strong>Delimitador</strong> — vírgula ou ponto e vírgula. No Brasil costuma ser ponto e vírgula,
    porque a vírgula já é o separador decimal</li>
  <li><strong>Tipo de cada coluna</strong> — e aqui está o detalhe que salva</li>
</ul>

<h2>O CPF que perde o zero</h2>
<p>Uma coluna de CPF, matrícula ou CEP importada como número perde o zero à esquerda:
<code>01234567</code> vira <code>1234567</code>. E não há como recuperar depois — a informação se
perdeu na importação.</p>
<p>Por isso, na tela de importação, marque essas colunas como <strong>Texto</strong>. É a mesma regra
que aparece no curso de banco de dados: se não se faz conta com ele, não é número.</p>

<h2>Limpar o que veio sujo</h2>
<table>
  <tr><th>Problema</th><th>Solução</th></tr>
  <tr><td>Espaço sobrando nas pontas</td><td><code>=ARRUMAR(A2)</code></td></tr>
  <tr><td>Tudo maiúsculo ou tudo minúsculo</td><td><code>=PRI.MAIÚSCULA(A2)</code></td></tr>
  <tr><td>Número que é texto</td><td><code>=VALOR(A2)</code></td></tr>
  <tr><td>Caracteres estranhos</td><td><code>=TIRAR(A2)</code></td></tr>
  <tr><td>Linhas repetidas</td><td>Dados → Remover Duplicatas</td></tr>
</table>
<p>Essas funções não alteram a coluna original: elas criam o resultado ao lado. Depois de conferir,
copie e cole como <strong>valores</strong> por cima — senão você fica com uma coluna que depende da
outra para sempre.</p>

<h2>Separar o que veio grudado</h2>
<p>Nome completo numa coluna só, e você precisa de nome e sobrenome separados:</p>
<ul>
  <li><strong>Dados → Texto para Colunas</strong> — separa por espaço, vírgula ou o que você indicar</li>
  <li><strong>Preenchimento Relâmpago</strong> (Ctrl+E) — digite o resultado desejado na primeira
    linha e ele deduz o padrão para o resto</li>
</ul>
<p>O Ctrl+E parece mágica e funciona surpreendentemente bem: escreva "Ana" ao lado de "Ana Maria
Silva", aperte, e ele preenche a coluna inteira. Confira o resultado — em nomes com "de", "dos" e
sobrenome composto, ele às vezes erra o padrão.</p>

<h2>Antes de usar, confira</h2>
<ol>
  <li>O número de linhas bate com o do arquivo original?</li>
  <li>Os acentos estão certos?</li>
  <li>As datas estão como data, ou viraram texto?</li>
  <li>Os valores com centavos mantiveram os centavos?</li>
  <li>Alguma coluna que devia ser texto virou número?</li>
</ol>
<p>Cinco checagens de um minuto. Descobrir na semana seguinte que faltavam 200 linhas é bem pior.</p>

<h2>Faça agora</h2>
<p>Crie um CSV no bloco de notas com cinco linhas, incluindo um nome com acento e um código com zero
à esquerda. Abra por duplo clique e depois pela importação, marcando a coluna do código como texto.
Compare os dois resultados.</p>
`,
    desafio: {
      titulo: 'Da bagunça ao relatório',
      enunciado: `<p>Prepare um arquivo CSV sujo de propósito — ou peça a alguém que prepare — com pelo menos 20 linhas e todos estes problemas:</p>
<ul>
  <li>Nomes com espaço sobrando e maiúsculas inconsistentes</li>
  <li>Uma coluna de matrícula com zero à esquerda</li>
  <li>Valores com vírgula decimal</li>
  <li>Datas em formatos diferentes na mesma coluna</li>
  <li>Duas linhas duplicadas</li>
  <li>Nome completo numa coluna só</li>
</ul>
<p>Importe, limpe e entregue uma planilha pronta: nomes padronizados, matrículas com o zero
preservado, valores somáveis, datas reconhecidas como data, sem duplicatas, e nome e sobrenome em
colunas separadas.</p>
<p>Documente <strong>cada passo</strong> que você usou. Esse registro é o que permite repetir o
processo no mês seguinte em cinco minutos, em vez de uma hora — e é assim que se trabalha com dado
que chega todo mês.</p>`,
    },
  },
  {
    curso: 'pacote-office',
    slug: 'office-integracao',
    titulo: 'Do Excel para o Word e o PowerPoint',
    min: 6, ordem: 4,
    descricao: 'Levar tabela e gráfico de um programa para o outro sem retrabalho.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Levar tabela e gráfico do Excel para o Word e o PowerPoint</li>
  <li>Escolher entre colar fixo e colar vinculado</li>
  <li>Evitar o retrabalho de refazer tudo quando o dado muda</li>
</ul>

<h2>As três formas de colar</h2>
<table>
  <tr><th>Forma</th><th>O que acontece</th><th>Quando usar</th></tr>
  <tr><td>Colar normal</td><td>vira tabela do Word, editável ali</td><td>dado que não muda mais</td></tr>
  <tr><td>Colar como imagem</td><td>vira figura; não edita, não desconfigura</td><td>documento que será impresso ou virará PDF</td></tr>
  <tr><td>Colar vinculado</td><td>continua ligado ao Excel; atualiza junto</td><td>relatório que se refaz todo mês</td></tr>
</table>
<p>O vinculado é o que quase ninguém conhece e o que mais economiza tempo — mas ele traz uma
condição: o arquivo do Excel <strong>precisa continuar existindo, no mesmo lugar</strong>. Se você
mandar só o Word por e-mail, o vínculo quebra.</p>

<h2>A regra prática</h2>
<ul>
  <li>Vai enviar para alguém? <strong>Imagem</strong> ou colar normal</li>
  <li>É seu, e o dado muda? <strong>Vinculado</strong></li>
  <li>Precisa editar o texto da tabela no Word? <strong>Colar normal</strong></li>
</ul>

<h2>O gráfico no PowerPoint</h2>
<p>Gráfico colado como imagem fica com resolução ruim ao projetar. Gráfico colado normalmente
mantém a qualidade e ainda permite ajustar cor e tamanho da fonte para a projeção — que precisa ser
bem maior que a da tela.</p>
<p>Uma regra de sala: o que você lê confortavelmente no monitor a 50 cm costuma ser ilegível para
quem está na última carteira. Aumente o texto do gráfico antes de apresentar.</p>

<h2>Mala direta: a que dispensa o trabalho manual</h2>
<p>Emitir 40 certificados, um por aluno, é o exemplo perfeito. Em vez de editar 40 vezes:</p>
<ol>
  <li>No Excel, uma planilha com uma coluna por informação — nome, turma, carga horária</li>
  <li>No Word, o modelo do certificado com os campos marcados</li>
  <li>Correspondências → Selecionar Destinatários → Usar Lista Existente</li>
  <li>Inserir Campo de Mesclagem onde vai cada dado</li>
  <li>Concluir e Mesclar → gera os 40 documentos</li>
</ol>
<p>Vale para certificado, declaração, etiqueta e carta. O trabalho de montar o modelo é feito uma
vez; a emissão passa a ser um clique — e é exatamente o mesmo raciocínio de automação que aparece no
curso de Python.</p>

<h2>Faça agora</h2>
<p>Monte uma tabela pequena no Excel e cole no Word das três formas. Depois mude um valor no Excel e
veja quais versões acompanharam. A diferença fica clara em dez segundos.</p>
`,
    desafio: {
      titulo: 'O relatório que se atualiza',
      enunciado: `<p>Monte um relatório integrado, usando os três programas.</p>
<ul>
  <li><strong>No Excel</strong>: uma planilha de dados — gastos, notas, presenças — com totais calculados por fórmula e um gráfico</li>
  <li><strong>No Word</strong>: um relatório com títulos em estilo, sumário automático, e a tabela e o gráfico <strong>colados vinculados</strong></li>
  <li><strong>No PowerPoint</strong>: três slides apresentando as conclusões, com o gráfico e no máximo 30 palavras por slide</li>
</ul>
<p>Depois de tudo pronto, <strong>mude três valores na planilha</strong> e atualize os vínculos.
Registre o que mudou sozinho e o que você teve de refazer à mão.</p>
<p>Faça também a mala direta: gere um certificado personalizado para cinco pessoas a partir de uma
lista no Excel. Entregue os cinco arquivos e o modelo.</p>`,
    },
  },
  {
    curso: 'pacote-office',
    slug: 'office-trabalho-em-grupo',
    titulo: 'Trabalhando junto no mesmo documento',
    min: 6, ordem: 7,
    descricao: 'Comentários, controle de alterações e o fim do "trabalho_final_v7_agora_vai".',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Revisar documento com controle de alterações e comentários</li>
  <li>Trabalhar em grupo sem sobrescrever o trabalho de ninguém</li>
  <li>Entender o que é histórico de versões</li>
</ul>

<h2>O problema do trabalho em grupo</h2>
<p>A cena conhecida: quatro pessoas, quatro arquivos, cada uma editando o seu. Na véspera, alguém
junta tudo à mão — e algum pedaço se perde no caminho.</p>
<p>Isso acontece porque o arquivo é passado adiante como cópia. As ferramentas resolvem de dois
jeitos, e vale conhecer os dois.</p>

<h2>Controle de alterações: revisar sem apagar</h2>
<p>Em Revisão → Controlar Alterações, tudo que você mexer fica marcado: o que foi acrescentado
aparece sublinhado, o que foi tirado aparece riscado, com o nome de quem fez.</p>
<p>Quem recebe decide item por item — aceitar ou recusar. Nada é alterado às escondidas.</p>
<p>É a ferramenta certa quando alguém <strong>revisa</strong> o texto de outra pessoa: o professor
corrigindo o trabalho, o colega revisando o relatório. Sem ela, a pessoa recebe o texto mudado e não
sabe o que mudou.</p>

<h2>Comentário: sugerir sem alterar</h2>
<p>O comentário fica na margem, ligado ao trecho, e não toca no texto. Serve para o que é opinião:
"esta parte ficou confusa", "falta a fonte aqui".</p>
<p>A diferença entre os dois é simples: <strong>alteração muda o texto; comentário fala sobre
ele</strong>. Use comentário quando a decisão for do autor.</p>

<h2>Um arquivo, várias pessoas</h2>
<p>Com o documento na nuvem — OneDrive ou Google Drive — todos editam o mesmo arquivo ao mesmo tempo,
e cada um vê o cursor do outro. Acaba a etapa de juntar.</p>
<p>E existe o <strong>histórico de versões</strong>: dá para ver como o documento estava ontem e
voltar. Isso resolve o medo que faz as pessoas criarem cópias — "e se alguém apagar tudo?". Se
apagar, você volta.</p>
<p>É a mesma ideia do Git, que aparece no curso de programação: em vez de guardar cópias com nomes
diferentes, o sistema guarda o histórico.</p>

<h2>Combinar antes evita conflito</h2>
<p>Mesmo com todo mundo no mesmo arquivo, algumas combinações ajudam:</p>
<ul>
  <li><strong>Quem escreve o quê</strong> — dividido por seção, não por "todo mundo escreve junto"</li>
  <li><strong>Quem revisa no fim</strong> — uma pessoa dá a passada final, para o texto ter uma voz só</li>
  <li><strong>Prazo interno</strong>, um ou dois dias antes do real</li>
  <li><strong>Onde mora o arquivo</strong> — um lugar, e todo mundo sabe qual</li>
</ul>

<h2>Faça agora</h2>
<p>Escreva um parágrafo, ative o controle de alterações e peça a alguém que edite. Depois abra e veja
cada mudança marcada, aceitando umas e recusando outras. É a ferramenta que todo trabalho em grupo
deveria usar e quase ninguém usa.</p>
`,
    desafio: {
      titulo: 'Um trabalho em grupo sem versões perdidas',
      enunciado: `<p>Em grupo de três ou quatro pessoas, produzam um documento de pelo menos três páginas usando as ferramentas de colaboração — sem passar arquivo por WhatsApp.</p>
<ul>
  <li>Documento único na nuvem, com todos editando</li>
  <li>Divisão combinada por seção, registrada no início do documento</li>
  <li>Títulos em estilo, com sumário automático</li>
  <li>Cada integrante revisa a seção de outro usando <strong>controle de alterações</strong></li>
  <li>Cada integrante deixa pelo menos dois <strong>comentários</strong> — dúvida ou sugestão, não correção</li>
  <li>Uma pessoa faz a revisão final, aceitando e recusando as alterações</li>
</ul>
<p>Entreguem o documento e, junto, uma resposta do grupo:</p>
<ul>
  <li>Quantas versões diferentes do arquivo existiram? (a resposta certa é uma)</li>
  <li>Alguém sobrescreveu o trabalho de alguém? Como foi resolvido?</li>
  <li>O histórico de versões precisou ser usado?</li>
</ul>`,
    },
  },
]

await aplicar({ AMPLIACOES, NOVAS })
