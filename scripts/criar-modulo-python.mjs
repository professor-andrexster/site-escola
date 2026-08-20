/**
 * Cria o módulo "Python na Prática".
 *
 *   node scripts/criar-modulo-python.mjs            simula
 *   node scripts/criar-modulo-python.mjs --aplicar  grava
 *
 * Python ganha MÓDULO PRÓPRIO em vez de entrar no de Lógica e Programação. O
 * motivo é concreto: oito alunos já têm aula concluída ali, e acrescentar um
 * terceiro curso ao módulo empurraria para longe o certificado que eles estão
 * perseguindo. Mudar a régua no meio da prova não se faz.
 *
 * Na trilha, Python entra depois de JavaScript e antes de PHP: o aluno fecha o
 * caminho web (HTML, CSS, Lógica, JS) e só então amplia para outras linguagens.
 *
 * Idempotente: rodar duas vezes não duplica nada.
 */
import { readFileSync } from 'node:fs'
import mariadb from '../node_modules/mariadb/promise.js'

const APLICAR = process.argv.includes('--aplicar')

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, '')] })
)

const MODULO = {
  slug: 'python-na-pratica',
  nome: 'Python na Prática',
  nivel: 'Médio',
  ordem: 7,
  carga: 15,
  descricao:
    'A linguagem que se lê quase como português. Você aplica a lógica que já aprendeu num programa que roda de verdade — e termina automatizando uma tarefa chata que hoje você faz na mão.',
}

const CURSO = {
  slug: 'python-do-zero',
  titulo: 'Python: da Lógica ao Programa',
  categoria: 'Programação',
  carga: 15,
  descricao:
    'Sete aulas para sair do pseudocódigo e escrever programa que roda. Variáveis, decisões, repetição, listas, funções e arquivos — terminando num programa que resolve um problema seu.',
  ordemNaTrilha: 6,
}

const AULAS = [
  {
    slug: 'python-primeiros-passos',
    titulo: 'Python: a primeira linha que roda',
    min: 45,
    descricao: 'Por que Python, onde escrever, e os três comandos que abrem tudo.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Rodar seu primeiro programa em Python</li>
  <li>Guardar informação em variáveis e entender os tipos básicos</li>
  <li>Conversar com quem usa o programa: mostrar e perguntar</li>
</ul>

<h2>Por que Python</h2>
<p>Compare o mesmo "mostre uma mensagem" em três linguagens:</p>
<pre><code>// Java
System.out.println("Olá");

// JavaScript
console.log("Olá");

# Python
print("Olá")</code></pre>
<p>Python tira do caminho quase tudo que não é o problema: sem ponto e vírgula, sem chaves, sem
declarar tipo. Sobra o raciocínio — que é o que você treinou em Lógica de Programação e agora vai
escrever de um jeito que a máquina executa.</p>
<p>Não é linguagem "de brinquedo": Instagram, Spotify e boa parte da inteligência artificial do
mundo rodam em Python.</p>

<h2>Onde escrever</h2>
<p>Para começar, nada precisa ser instalado. Abra <strong>replit.com</strong> ou
<strong>colab.research.google.com</strong>, crie um arquivo Python e escreva. Se preferir no seu
computador, instale o Python do site oficial e use o VS Code.</p>

<h2>Mostrar, guardar, perguntar</h2>
<pre><code>print("Olá, mundo")

nome = "Ana"
idade = 16
altura = 1.62
estuda = True

print("Nome:", nome)
print("Idade:", idade)</code></pre>
<p>Repare que você não disse a Python que <code>idade</code> é um número — ele descobre pelo valor.
Os quatro tipos que aparecem aí resolvem quase tudo no começo:</p>
<table>
  <tr><th>Tipo</th><th>É</th><th>Exemplo</th></tr>
  <tr><td><code>str</code></td><td>texto</td><td><code>"Ana"</code></td></tr>
  <tr><td><code>int</code></td><td>número inteiro</td><td><code>16</code></td></tr>
  <tr><td><code>float</code></td><td>número com vírgula</td><td><code>1.62</code></td></tr>
  <tr><td><code>bool</code></td><td>verdadeiro ou falso</td><td><code>True</code></td></tr>
</table>

<h2>Perguntando ao usuário</h2>
<pre><code>nome = input("Qual é o seu nome? ")
print("Prazer,", nome)</code></pre>
<p>Aqui mora a primeira armadilha da linguagem: <strong><code>input</code> devolve sempre
texto</strong>, mesmo quando a pessoa digita um número.</p>
<pre><code>idade = input("Sua idade: ")
print(idade + 1)      # erro: não dá para somar texto com número

idade = int(input("Sua idade: "))
print(idade + 1)      # 17 — agora sim</code></pre>
<p>Guarde esse <code>int(...)</code>. Ele vai aparecer em todo programa que pergunta número.</p>

<h2>Escrevendo texto com valores dentro</h2>
<pre><code>nome = "Ana"
nota = 8.5
print(f"{nome} tirou {nota} na prova.")</code></pre>
<p>O <code>f</code> antes das aspas libera as chaves. É a forma mais legível de montar frase com
valor no meio, e é assim que você vai escrever daqui para frente.</p>
`,
    desafio: {
      titulo: 'Sua ficha em Python',
      enunciado: `<p>Escreva um programa que pergunte e depois apresente:</p>
<ul>
  <li>Nome, idade e a série em que você estuda</li>
  <li>Mostre tudo numa frase montada com <code>f"..."</code></li>
  <li>Calcule e mostre em que ano você nasceu, a partir da idade</li>
</ul>
<p>Teste digitando a idade e confira: se der erro de soma, faltou o <code>int(...)</code>.</p>`,
    },
  },
  {
    slug: 'python-decisoes',
    titulo: 'Decisões: if, elif e else',
    min: 45,
    descricao: 'Fazer o programa escolher — e a indentação, que em Python é sintaxe.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Fazer o programa tomar caminhos diferentes conforme a situação</li>
  <li>Combinar condições com <code>and</code>, <code>or</code> e <code>not</code></li>
  <li>Entender por que a indentação em Python não é enfeite</li>
</ul>

<h2>A decisão mais simples</h2>
<pre><code>nota = float(input("Nota: "))

if nota >= 6:
    print("Aprovado")
else:
    print("Recuperação")</code></pre>
<p>Duas coisas importam nessa forma: os <strong>dois pontos</strong> no fim da linha e o
<strong>recuo</strong> das linhas de dentro.</p>

<h2>A indentação é sintaxe</h2>
<p>Em quase toda linguagem o recuo é estética, e chaves marcam o bloco. Em Python o recuo
<strong>é</strong> o bloco. Compare:</p>
<pre><code>if nota >= 6:
    print("Aprovado")
    print("Parabéns")      # dentro do if — só aparece se passou

if nota >= 6:
    print("Aprovado")
print("Parabéns")          # fora do if — aparece sempre</code></pre>
<p>Mesmo texto, resultado diferente. Use sempre 4 espaços, e não misture espaço com tabulação:
para você parece igual, para o Python não.</p>

<h2>Mais de dois caminhos</h2>
<pre><code>nota = float(input("Nota: "))

if nota >= 9:
    print("Excelente")
elif nota >= 6:
    print("Aprovado")
elif nota >= 4:
    print("Recuperação")
else:
    print("Reprovado")</code></pre>
<p>O Python testa de cima para baixo e <strong>para na primeira condição verdadeira</strong>. Por
isso a ordem importa: se <code>nota >= 6</code> viesse primeiro, quem tirou 9,5 nunca veria
"Excelente".</p>

<h2>Comparações e combinações</h2>
<table>
  <tr><th>Escreve</th><th>Significa</th></tr>
  <tr><td><code>==</code></td><td>é igual a</td></tr>
  <tr><td><code>!=</code></td><td>é diferente de</td></tr>
  <tr><td><code>&gt;=</code> <code>&lt;=</code></td><td>maior ou igual, menor ou igual</td></tr>
  <tr><td><code>and</code></td><td>as duas condições</td></tr>
  <tr><td><code>or</code></td><td>pelo menos uma</td></tr>
  <tr><td><code>not</code></td><td>o contrário</td></tr>
</table>
<p>Cuidado com o erro clássico: <code>=</code> guarda valor, <code>==</code> compara. Escrever
<code>if idade = 18</code> é erro de sintaxe, e é bom que seja.</p>
<pre><code>idade = int(input("Idade: "))
tem_documento = input("Tem documento? (s/n) ") == "s"

if idade >= 18 and tem_documento:
    print("Pode entrar")
else:
    print("Não pode entrar")</code></pre>
`,
    desafio: {
      titulo: 'Calculadora de situação escolar',
      enunciado: `<p>Escreva um programa que peça <strong>três notas</strong> e a <strong>frequência</strong> (em %), e diga a situação do aluno:</p>
<ul>
  <li>Média 6 ou mais <strong>e</strong> frequência 75% ou mais → Aprovado</li>
  <li>Média entre 4 e 6, com frequência suficiente → Recuperação</li>
  <li>Frequência abaixo de 75% → Reprovado por falta, mesmo com média boa</li>
  <li>Nos demais casos → Reprovado</li>
</ul>
<p>Teste com média 9 e frequência 50%: seu programa precisa reprovar por falta. Se ele aprovar, a ordem dos <code>if</code> está errada.</p>`,
    },
  },
  {
    slug: 'python-repeticao',
    titulo: 'Repetição: for e while',
    min: 45,
    descricao: 'Mandar o computador fazer mil vezes o que você faria uma.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Repetir um trecho um número conhecido de vezes com <code>for</code></li>
  <li>Repetir enquanto uma condição for verdadeira com <code>while</code></li>
  <li>Escolher entre os dois sem hesitar</li>
</ul>

<h2>Quando você sabe quantas vezes: for</h2>
<pre><code>for i in range(5):
    print("Repetição número", i)</code></pre>
<p>Isso imprime de 0 a 4 — <code>range(5)</code> dá cinco números <strong>começando do
zero</strong>. Contar do zero incomoda no início e depois vira natural.</p>
<pre><code>range(5)         # 0, 1, 2, 3, 4
range(1, 6)      # 1, 2, 3, 4, 5
range(0, 21, 5)  # 0, 5, 10, 15, 20</code></pre>

<h2>Percorrendo o que já existe</h2>
<pre><code>alunos = ["Ana", "Bruno", "Carla"]

for aluno in alunos:
    print("Presente:", aluno)</code></pre>
<p>Esta é a forma mais usada de <code>for</code> em Python, e a mais legível: você lê "para cada
aluno na lista de alunos". Não precisa de índice, nem de contador, nem saber o tamanho.</p>

<h2>Quando você não sabe quantas vezes: while</h2>
<pre><code>senha = ""

while senha != "abracadabra":
    senha = input("Senha: ")

print("Entrou!")</code></pre>
<p>Pode ser uma tentativa ou vinte — quem decide é quem digita. É para isso que serve o
<code>while</code>.</p>

<h2>O laço infinito</h2>
<p>Vai acontecer com você, e é bom que aconteça cedo:</p>
<pre><code>contador = 0
while contador &lt; 5:
    print(contador)
    # esqueceu de somar 1 — contador nunca chega a 5</code></pre>
<p>O programa trava imprimindo <code>0</code> para sempre. <strong>Ctrl+C</strong> interrompe.
A regra que evita isso: em todo <code>while</code>, pergunte-se "o que aqui dentro vai fazer essa
condição virar falsa?". Se não houver resposta, o laço é infinito.</p>

<h2>Somando enquanto repete</h2>
<pre><code>total = 0

for i in range(3):
    nota = float(input(f"Nota {i + 1}: "))
    total = total + nota

print("Média:", total / 3)</code></pre>
<p>O padrão "variável que acumula fora do laço, soma dentro" resolve metade dos exercícios de
repetição que você vai encontrar.</p>
`,
    desafio: {
      titulo: 'Tabuada e contagem',
      enunciado: `<p>Faça dois programas.</p>
<p><strong>Programa 1:</strong> pergunta um número e mostra a tabuada dele de 1 a 10, uma linha por
resultado, no formato <code>7 x 3 = 21</code>.</p>
<p><strong>Programa 2:</strong> vai lendo números que a pessoa digita, um por vez, até ela digitar
<code>0</code>. No fim mostra quantos números foram digitados, a soma e o maior deles.</p>
<p>Pense antes: qual dos dois pede <code>for</code> e qual pede <code>while</code>? Escolher errado
funciona, mas fica bem mais difícil.</p>`,
    },
  },
  {
    slug: 'python-listas-e-dicionarios',
    titulo: 'Listas e dicionários',
    min: 45,
    descricao: 'Guardar muitos valores — em ordem, ou com nome.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Guardar vários valores numa lista e percorrê-los</li>
  <li>Guardar informação com etiqueta num dicionário</li>
  <li>Escolher entre lista e dicionário conforme o problema</li>
</ul>

<h2>Lista: valores em ordem</h2>
<pre><code>notas = [7.5, 8.0, 6.5, 9.0]

print(notas[0])        # 7.5 — o primeiro é o zero
print(len(notas))      # 4
print(sum(notas))      # 31.0
print(max(notas))      # 9.0
print(sum(notas) / len(notas))   # a média</code></pre>
<p>Repare que <code>sum</code>, <code>len</code> e <code>max</code> já vêm prontos. Boa parte de
aprender Python é descobrir que aquilo que você ia escrever já existe.</p>

<pre><code>alunos = ["Ana", "Bruno"]
alunos.append("Carla")      # entra no fim
alunos.remove("Bruno")      # sai da lista
print(alunos)               # ['Ana', 'Carla']</code></pre>

<h2>Dicionário: valores com nome</h2>
<p>Lista é boa quando a ordem importa e os itens são do mesmo tipo. Quando cada valor significa uma
coisa diferente, a lista atrapalha:</p>
<pre><code>aluno = ["Ana", 16, "3º A"]
print(aluno[1])       # 16 — mas 1 era a idade mesmo? ou a série?</code></pre>
<p>O dicionário resolve dando nome a cada valor:</p>
<pre><code>aluno = {"nome": "Ana", "idade": 16, "turma": "3º A"}

print(aluno["nome"])       # Ana
aluno["idade"] = 17        # muda
aluno["turno"] = "manhã"   # acrescenta</code></pre>
<p>O código passa a se explicar sozinho. <code>aluno["idade"]</code> não precisa de comentário;
<code>aluno[1]</code> precisa.</p>

<h2>Juntando os dois</h2>
<p>É a estrutura mais comum de todas — uma lista de dicionários:</p>
<pre><code>turma = [
    {"nome": "Ana", "nota": 8.5},
    {"nome": "Bruno", "nota": 5.0},
    {"nome": "Carla", "nota": 9.5},
]

for aluno in turma:
    situacao = "aprovado" if aluno["nota"] >= 6 else "recuperação"
    print(f'{aluno["nome"]}: {situacao}')</code></pre>
<p>É assim que dado do mundo real chega até você — de planilha, de arquivo, da internet. Ficar à
vontade com essa forma vale mais do que decorar comando.</p>
`,
    desafio: {
      titulo: 'Boletim da turma',
      enunciado: `<p>Crie uma lista de dicionários com <strong>cinco alunos</strong>, cada um com nome e três notas.</p>
<p>Seu programa deve mostrar:</p>
<ul>
  <li>A média de cada aluno, com a situação (aprovado, recuperação ou reprovado)</li>
  <li>A média da turma inteira</li>
  <li>O nome de quem tirou a maior média</li>
  <li>Quantos alunos foram aprovados</li>
</ul>
<p>Use <code>sum</code> e <code>len</code> para as médias em vez de somar na mão.</p>`,
    },
  },
  {
    slug: 'python-funcoes',
    titulo: 'Funções: parar de repetir código',
    min: 40,
    descricao: 'Dar nome a um pedaço de programa e reaproveitá-lo.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Criar funções com parâmetros e retorno</li>
  <li>Entender por que a variável de dentro não existe fora</li>
  <li>Quebrar um programa grande em pedaços que cabem na cabeça</li>
</ul>

<h2>O problema que a função resolve</h2>
<p>Quando o mesmo cálculo aparece em três lugares, três coisas acontecem: você digita três vezes,
erra numa delas, e no dia da mudança arruma só duas.</p>
<pre><code>def calcular_media(a, b, c):
    return (a + b + c) / 3

media_ana = calcular_media(8, 7, 9)
media_bruno = calcular_media(5, 6, 4)

print(media_ana, media_bruno)</code></pre>
<p><code>def</code> cria a função. O que vem nos parênteses são os <strong>parâmetros</strong> — a
informação que ela precisa receber. <code>return</code> é o resultado que ela devolve.</p>

<h2>Devolver ou mostrar</h2>
<p>Confusão frequente no começo:</p>
<pre><code>def media_errada(a, b, c):
    print((a + b + c) / 3)      # mostra, mas não devolve

def media_certa(a, b, c):
    return (a + b + c) / 3      # devolve, e quem chamou decide o que fazer

x = media_errada(8, 7, 9)   # x fica None — não dá para usar depois
y = media_certa(8, 7, 9)    # y = 8.0 — dá para comparar, somar, guardar</code></pre>
<p>Regra prática: função <strong>calcula e devolve</strong>; quem chamou decide se imprime, guarda
ou compara. Isso a torna reaproveitável.</p>

<h2>O que nasce dentro, morre dentro</h2>
<pre><code>def somar(a, b):
    resultado = a + b
    return resultado

print(somar(2, 3))     # 5
print(resultado)       # erro: 'resultado' não existe aqui fora</code></pre>
<p>Isso é bom, não é limitação: você pode usar <code>total</code> dentro de cinco funções
diferentes sem que uma atrapalhe a outra.</p>

<h2>Um programa inteiro em funções</h2>
<pre><code>def ler_notas():
    return [float(input(f"Nota {i + 1}: ")) for i in range(3)]

def media(notas):
    return sum(notas) / len(notas)

def situacao(m):
    if m >= 6:
        return "Aprovado"
    if m >= 4:
        return "Recuperação"
    return "Reprovado"

notas = ler_notas()
m = media(notas)
print(f"Média {m:.1f} — {situacao(m)}")</code></pre>
<p>As últimas três linhas contam a história do programa: lê, calcula, decide. O detalhe de cada
etapa fica guardado na função, e você só volta lá se precisar.</p>
<p>(<code>{m:.1f}</code> mostra o número com uma casa decimal — 7.666666 vira 7.7.)</p>
`,
    desafio: {
      titulo: 'Refazer o boletim com funções',
      enunciado: `<p>Pegue o boletim da aula anterior e reescreva usando funções. Pelo menos estas:</p>
<ul>
  <li><code>media(notas)</code> — recebe uma lista e devolve a média</li>
  <li><code>situacao(media)</code> — recebe a média e devolve o texto da situação</li>
  <li><code>melhor_aluno(turma)</code> — recebe a lista de alunos e devolve o nome de quem foi melhor</li>
</ul>
<p>Nenhuma delas deve usar <code>print</code>: elas calculam e devolvem. O <code>print</code> fica
só na parte final do programa.</p>`,
    },
  },
  {
    slug: 'python-arquivos',
    titulo: 'Arquivos: dados que sobrevivem ao programa',
    min: 40,
    descricao: 'Ler e gravar arquivo — inclusive planilha em CSV.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Gravar e ler arquivo de texto</li>
  <li>Ler uma planilha exportada em CSV</li>
  <li>Entender por que o programa "esquece" tudo ao fechar</li>
</ul>

<h2>Por que gravar</h2>
<p>Tudo que seus programas fizeram até aqui morreu quando eles terminaram. Variável mora na memória,
e memória se apaga. Para o dado sobreviver, precisa ir para o disco.</p>

<h2>Gravando</h2>
<pre><code>with open("alunos.txt", "w", encoding="utf-8") as arquivo:
    arquivo.write("Ana\\n")
    arquivo.write("Bruno\\n")</code></pre>
<p>Três detalhes que evitam dor de cabeça:</p>
<ul>
  <li><code>"w"</code> <strong>apaga o que existia</strong> e escreve do zero. Para acrescentar ao
    fim, use <code>"a"</code></li>
  <li><code>\\n</code> é a quebra de linha; sem ela tudo sai grudado</li>
  <li><code>encoding="utf-8"</code> faz acento funcionar — sem isso, "João" vira "JoÃ£o"</li>
</ul>
<p>O <code>with</code> fecha o arquivo sozinho ao terminar o bloco, mesmo se der erro no meio. Use
sempre.</p>

<h2>Lendo</h2>
<pre><code>with open("alunos.txt", "r", encoding="utf-8") as arquivo:
    for linha in arquivo:
        print(linha.strip())</code></pre>
<p><code>.strip()</code> tira o espaço e a quebra de linha das pontas. Sem ele você acaba comparando
<code>"Ana\\n"</code> com <code>"Ana"</code> e não entendendo por que dá diferente.</p>

<h2>CSV: a planilha como texto</h2>
<p>Toda planilha exporta para CSV, e CSV é só texto com vírgulas. É a ponte mais comum entre Excel e
Python:</p>
<pre><code>import csv

with open("notas.csv", "r", encoding="utf-8") as arquivo:
    leitor = csv.DictReader(arquivo)
    for linha in leitor:
        print(linha["nome"], linha["nota"])</code></pre>
<p>O <code>DictReader</code> usa a primeira linha do arquivo como nome das colunas e entrega cada
linha como dicionário — a mesma estrutura da aula de listas e dicionários.</p>
<p>Uma armadilha: tudo que vem do CSV é <strong>texto</strong>, como no <code>input</code>. Para
contar, converta: <code>float(linha["nota"])</code>.</p>

<h2>Quando o arquivo não existe</h2>
<pre><code>try:
    with open("notas.csv", "r", encoding="utf-8") as arquivo:
        print(arquivo.read())
except FileNotFoundError:
    print("Arquivo não encontrado. Confira o nome e a pasta.")</code></pre>
<p>Programa que quebra com um erro vermelho na cara do usuário é programa inacabado. Antecipar o que
pode dar errado é parte de escrevê-lo.</p>
`,
    desafio: {
      titulo: 'Do CSV para o relatório',
      enunciado: `<p>Crie um arquivo <code>notas.csv</code> com as colunas <code>nome,nota1,nota2,nota3</code> e pelo menos seis alunos — dá para montar no Excel e exportar.</p>
<p>Escreva um programa que:</p>
<ul>
  <li>Leia o CSV com <code>DictReader</code></li>
  <li>Calcule a média de cada aluno</li>
  <li>Grave um <code>relatorio.txt</code> com uma linha por aluno: nome, média e situação</li>
  <li>Mostre no fim do arquivo quantos foram aprovados e a média da turma</li>
  <li>Trate o caso de o CSV não existir, com mensagem clara</li>
</ul>`,
    },
  },
  {
    slug: 'python-automatizando',
    titulo: 'Automatizando algo seu',
    min: 40,
    descricao: 'Juntar tudo num programa que resolve um problema de verdade.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Reconhecer, no seu dia, tarefa que um programa faria melhor</li>
  <li>Organizar um programa completo em funções</li>
  <li>Escrever um programa que outra pessoa consiga usar</li>
</ul>

<h2>O que vale automatizar</h2>
<p>A pergunta certa não é "o que dá para fazer em Python", é "o que eu faço na mão, sempre igual,
que me dá preguiça". Três características denunciam uma boa candidata:</p>
<ul>
  <li><strong>Repetitiva</strong> — os mesmos passos, muitas vezes</li>
  <li><strong>Com regra clara</strong> — dá para explicar a outra pessoa sem "depende"</li>
  <li><strong>Chata o bastante</strong> para você errar quando está com pressa</li>
</ul>
<p>Exemplos reais que alunos daqui já fizeram: sortear equipes da turma sem repetir ninguém, somar a
lista de presença do mês, renomear cem fotos de uma vez, gerar o cartaz da rifa com os números.</p>

<h2>Um exemplo inteiro</h2>
<pre><code>import random

def ler_nomes(caminho):
    with open(caminho, "r", encoding="utf-8") as arquivo:
        return [linha.strip() for linha in arquivo if linha.strip()]

def sortear_equipes(nomes, tamanho):
    embaralhados = nomes[:]          # cópia, para não bagunçar a lista original
    random.shuffle(embaralhados)
    return [embaralhados[i:i + tamanho] for i in range(0, len(embaralhados), tamanho)]

def mostrar(equipes):
    for numero, equipe in enumerate(equipes, start=1):
        print(f"Equipe {numero}: {', '.join(equipe)}")

try:
    nomes = ler_nomes("turma.txt")
    if len(nomes) &lt; 2:
        print("Preciso de pelo menos dois nomes no arquivo.")
    else:
        mostrar(sortear_equipes(nomes, 4))
except FileNotFoundError:
    print("Não achei turma.txt — coloque o arquivo na mesma pasta do programa.")</code></pre>
<p>Está tudo aqui: arquivo, lista, função, laço, condição e tratamento de erro. Sessenta linhas
resolvendo o que na mão leva quinze minutos e sai errado.</p>

<h2>O que separa programa de exercício</h2>
<table>
  <tr><th>Exercício</th><th>Programa</th></tr>
  <tr><td>Só você sabe usar</td><td>Diz o que espera receber</td></tr>
  <tr><td>Quebra com entrada estranha</td><td>Avisa em vez de quebrar</td></tr>
  <tr><td>Tudo solto no arquivo</td><td>Dividido em funções com nome</td></tr>
  <tr><td>Valores fixos no meio do código</td><td>Valores que dá para mudar num lugar só</td></tr>
</table>
<p>É essa diferença que o projeto do módulo vai cobrar.</p>
`,
    desafio: {
      titulo: 'Escolha o que automatizar',
      enunciado: `<p>Antes de programar, escreva num documento:</p>
<ul>
  <li><strong>Que tarefa</strong> você faz na mão e vai automatizar</li>
  <li><strong>O que entra</strong> — digitado, ou lido de um arquivo?</li>
  <li><strong>O que sai</strong> — mostrado na tela, ou gravado?</li>
  <li><strong>Que regra</strong> o programa aplica, escrita em português</li>
  <li><strong>O que pode dar errado</strong> e como o programa vai avisar</li>
</ul>
<p>Esse plano é o rascunho do projeto do módulo. Programar com ele pronto é bem mais rápido que
programar descobrindo.</p>`,
    },
  },
]

const DESAFIO_DO_MODULO = {
  titulo: 'Um programa em Python que resolve um problema seu',
  enunciado: `
<p>O projeto do módulo é um programa que <strong>você</strong> vai usar — não um exercício.</p>

<h3>O que entregar</h3>
<ul>
  <li><strong>Um programa em Python</strong> que automatiza uma tarefa real, sua ou da escola</li>
  <li><strong>Organizado em funções</strong>, pelo menos três, cada uma com uma responsabilidade</li>
  <li><strong>Lendo ou gravando arquivo</strong> — o dado precisa sobreviver ao programa</li>
  <li><strong>Tratando o que pode dar errado</strong>: arquivo que não existe, número digitado como texto, lista vazia</li>
  <li><strong>No GitHub</strong>, com README explicando o que faz, como rodar e o que precisa estar na pasta</li>
</ul>

<h3>Como será avaliado</h3>
<table>
  <tr><th>Critério</th><th>O que se espera</th></tr>
  <tr><td>Resolve algo real</td><td>Dá para explicar em uma frase quem usa e para quê</td></tr>
  <tr><td>Roda</td><td>Outra pessoa consegue executar seguindo o README</td></tr>
  <tr><td>Não quebra</td><td>Entrada estranha gera aviso, não erro vermelho</td></tr>
  <tr><td>Organização</td><td>Funções com nome que diz o que fazem</td></tr>
  <tr><td>Legibilidade</td><td>Nome de variável em português claro, sem <code>x</code> e <code>a1</code></td></tr>
</table>

<h3>Como enviar</h3>
<p>Mande o <strong>endereço do repositório no GitHub</strong>. Se o programa usa arquivo de exemplo,
deixe um no repositório para quem for testar.</p>
`,
  instrucoes: 'Envie o endereço do repositório no GitHub, com README e arquivo de exemplo.',
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

try {
  const [existente] = await c.query('SELECT id FROM modulos WHERE slug = ?', [MODULO.slug])
  let moduloId = existente?.id

  if (!moduloId) {
    acao(`abrir espaço: módulos de ordem >= ${MODULO.ordem} vão uma casa para frente`)
    if (APLICAR) await c.query('UPDATE modulos SET ordem = ordem + 1 WHERE ordem >= ?', [MODULO.ordem])
    acao(`criar módulo "${MODULO.nome}" (${MODULO.nivel}, ${MODULO.carga}h) na ordem ${MODULO.ordem}`)
    if (APLICAR) {
      await c.query(
        `INSERT INTO modulos (id, nome, slug, descricao, nivel, ordem, carga_horaria, publicado, criado_em, atualizado_em)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
        [MODULO.nome, MODULO.slug, MODULO.descricao, MODULO.nivel, MODULO.ordem, MODULO.carga]
      )
      moduloId = (await c.query('SELECT id FROM modulos WHERE slug = ?', [MODULO.slug]))[0].id
    }
  } else {
    acao(`módulo já existe — atualizando`)
    if (APLICAR) {
      await c.query('UPDATE modulos SET nome=?, descricao=?, nivel=?, carga_horaria=?, atualizado_em=NOW() WHERE id=?',
        [MODULO.nome, MODULO.descricao, MODULO.nivel, MODULO.carga, moduloId])
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
    acao(`criar curso "${CURSO.titulo}" — trilha Programação, posição ${CURSO.ordemNaTrilha}`)
    if (APLICAR) {
      await c.query(
        `INSERT INTO cursos (id, titulo, slug, descricao, categoria, nivel, autor_nome, publicado,
                             ordem, carga_horaria, modulo_id, ordem_no_modulo, trilha_id, ordem_na_trilha,
                             created_at, updated_at, criado_em, atualizado_em)
         VALUES (UUID(), ?, ?, ?, ?, 'Médio', 'André Gomes', 1, 101, ?, ?, 1, ?, ?, NOW(), NOW(), NOW(), NOW())`,
        [CURSO.titulo, CURSO.slug, CURSO.descricao, CURSO.categoria, CURSO.carga, moduloId, trilha?.id ?? null, CURSO.ordemNaTrilha]
      )
      cursoId = (await c.query('SELECT id FROM cursos WHERE slug = ?', [CURSO.slug]))[0].id
    }
  } else {
    acao(`curso já existe — atualizando`)
    if (APLICAR) {
      await c.query('UPDATE cursos SET titulo=?, descricao=?, carga_horaria=?, modulo_id=?, atualizado_em=NOW() WHERE id=?',
        [CURSO.titulo, CURSO.descricao, CURSO.carga, moduloId, cursoId])
    }
  }

  for (const [i, aula] of AULAS.entries()) {
    const [ja] = APLICAR ? await c.query('SELECT id FROM aulas WHERE slug = ? AND curso_id = ?', [aula.slug, cursoId]) : []
    acao(`aula ${i + 1}: ${aula.titulo}${ja ? ' (atualiza)' : ''}`)
    if (!APLICAR) continue

    if (ja) {
      await c.query('UPDATE aulas SET titulo=?, descricao=?, conteudo=?, ordem=?, duracao_estimada_min=?, publicado=1, updated_at=NOW() WHERE id=?',
        [aula.titulo, aula.descricao, aula.conteudo.trim(), i + 1, aula.min, ja.id])
    } else {
      await c.query(
        `INSERT INTO aulas (id, curso_id, titulo, slug, descricao, ordem, duracao_estimada_min, publicado, conteudo, created_at, updated_at)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, 1, ?, NOW(), NOW())`,
        [cursoId, aula.titulo, aula.slug, aula.descricao, i + 1, aula.min, aula.conteudo.trim()]
      )
    }
    const [aulaId] = await c.query('SELECT id FROM aulas WHERE slug = ? AND curso_id = ?', [aula.slug, cursoId])

    const [desafioJa] = await c.query('SELECT id FROM curso_desafios WHERE aula_id = ?', [aulaId.id])
    if (desafioJa) {
      await c.query('UPDATE curso_desafios SET titulo=?, enunciado=?, ordem=? WHERE id=?',
        [aula.desafio.titulo, aula.desafio.enunciado.trim(), i + 1, desafioJa.id])
    } else {
      await c.query(
        `INSERT INTO curso_desafios (id, curso_id, aula_id, titulo, enunciado, tipo, ordem, vale_certificado, created_at)
         VALUES (UUID(), ?, ?, ?, ?, 'pratico', ?, 0, NOW())`,
        [cursoId, aulaId.id, aula.desafio.titulo, aula.desafio.enunciado.trim(), i + 1]
      )
    }
  }

  acao(`projeto do módulo: ${DESAFIO_DO_MODULO.titulo}`)
  if (APLICAR) {
    const [ja] = await c.query('SELECT id FROM curso_desafios WHERE modulo_id = ?', [moduloId])
    if (ja) {
      await c.query('UPDATE curso_desafios SET titulo=?, enunciado=?, instrucoes_envio=? WHERE id=?',
        [DESAFIO_DO_MODULO.titulo, DESAFIO_DO_MODULO.enunciado.trim(), DESAFIO_DO_MODULO.instrucoes, ja.id])
    } else {
      await c.query(
        `INSERT INTO curso_desafios (id, modulo_id, titulo, enunciado, tipo, ordem, vale_certificado, instrucoes_envio, created_at)
         VALUES (UUID(), ?, ?, ?, 'projeto', 99, 1, ?, NOW())`,
        [moduloId, DESAFIO_DO_MODULO.titulo, DESAFIO_DO_MODULO.enunciado.trim(), DESAFIO_DO_MODULO.instrucoes]
      )
    }
  }

  if (!APLICAR) console.log('\n(simulação — passe --aplicar para gravar)')
  else console.log(`\nmódulo, curso, ${AULAS.length} aulas e ${AULAS.length + 1} desafios no lugar`)
} finally {
  c.release()
  await pool.end()
}
