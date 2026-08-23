/**
 * Amplia o curso Python: da Lógica ao Programa.
 *
 *   node scripts/conteudo-python.mjs --aplicar
 *
 * Mesmo padrão dos anteriores. As três aulas novas cobrem o que faltava: texto
 * (que é metade do trabalho de automação), erros e `try`, e as bibliotecas que
 * já vêm prontas — que é justamente o que faz Python valer a pena.
 */
import { aplicar } from './lib-conteudo.mjs'

const AMPLIACOES = {
  'python-primeiros-passos': `
<h2>Os erros que aparecem no primeiro dia</h2>
<table>
  <tr><th>Mensagem</th><th>Quer dizer</th></tr>
  <tr><td><code>IndentationError</code></td><td>o recuo está errado — sobrou ou faltou espaço</td></tr>
  <tr><td><code>TabError</code></td><td>você misturou tabulação com espaço</td></tr>
  <tr><td><code>SyntaxError: invalid syntax</code></td><td>quase sempre falta o <code>:</code> no fim do <code>if</code>, do <code>for</code> ou do <code>def</code></td></tr>
  <tr><td><code>NameError</code></td><td>a variável não existe — costuma ser erro de digitação</td></tr>
  <tr><td><code>TypeError</code></td><td>misturou tipos: somar texto com número</td></tr>
</table>
<p>O <code>TabError</code> é o mais irritante porque na tela está tudo igual: espaço e tabulação
parecem a mesma coisa e não são. Configure o editor para inserir espaços quando você aperta Tab, e o
problema desaparece de vez.</p>

<h2>Testar sem criar arquivo</h2>
<p>Digitando <code>python</code> no terminal, você entra num modo em que cada linha executa na hora:</p>
<pre><code>&gt;&gt;&gt; 2 + 2
4
&gt;&gt;&gt; nome = "Ana"
&gt;&gt;&gt; nome.upper()
'ANA'</code></pre>
<p>É o lugar certo para tirar dúvida rápida — "o que esse comando devolve mesmo?" — sem abrir
projeto. Sai com <code>exit()</code>.</p>

<h2>Comentário serve para o porquê</h2>
<pre><code># soma 1 na idade          &lt;- inútil: o código já diz isso
idade = idade + 1

# a matrícula do ano seguinte usa a idade que o aluno TERÁ em março
idade = idade + 1</code></pre>
<p>O código já explica o <em>que</em> ele faz. O comentário existe para o <em>porquê</em> — a regra
de negócio, a decisão estranha, o caso especial que você descobriu na marra.</p>

<h2>Faça agora</h2>
<p>Provoque três erros de propósito: tire o <code>:</code> de um <code>if</code>, recue uma linha a
mais, e some <code>"5" + 5</code>. Leia as três mensagens inteiras. Elas dizem o arquivo, a linha e
o tipo — e reconhecê-las de cara é o que separa travar dez minutos de resolver em dez segundos.</p>
`,

  'python-decisoes': `
<h2>Comparação encadeada, que só Python tem</h2>
<pre><code># em quase toda linguagem
if idade &gt; 12 and idade &lt; 18:

# em Python, escreve-se como em matemática
if 12 &lt; idade &lt; 18:</code></pre>
<p>Funciona exatamente como se lê. É um dos motivos de Python ser considerado legível: a linha se
parece com o que você diria em voz alta.</p>

<h2>Perguntar se está na lista</h2>
<pre><code>if turma == "3A" or turma == "3B" or turma == "3C":   # repetitivo
if turma in ("3A", "3B", "3C"):                       # o mesmo, legível

if "gato" in texto:        # o texto contém a palavra?
if chave in dicionario:    # a chave existe?</code></pre>
<p>O <code>in</code> funciona em lista, texto, dicionário e qualquer coisa percorrível. É um dos
comandos que mais economizam linha.</p>

<h2>O valor padrão numa linha</h2>
<pre><code>if nota &gt;= 6:
    situacao = "Aprovado"
else:
    situacao = "Recuperação"

# o mesmo, quando é simples assim
situacao = "Aprovado" if nota &gt;= 6 else "Recuperação"</code></pre>
<p>Use só quando couber confortavelmente numa linha. Encadear dois ou três desses vira charada, e
aí o <code>if</code> normal é mais honesto.</p>

<h2>O erro que não dá erro</h2>
<pre><code>if nota = 6:     # SyntaxError — Python avisa
if nota == 6:    # certo</code></pre>
<p>Aqui Python protege você: em linguagens como C, <code>if (nota = 6)</code> compila, atribui 6 à
variável e sempre dá verdadeiro. É um bug clássico que Python torna impossível.</p>

<h2>Faça agora</h2>
<p>Reescreva estas condições de forma mais limpa:
<code>if x &gt;= 0 and x &lt;= 100</code>,
<code>if dia == "sab" or dia == "dom"</code>,
e um <code>if/else</code> de quatro linhas que só define uma variável.</p>
`,

  'python-repeticao': `
<h2>Quando você precisa da posição</h2>
<pre><code>alunos = ["Ana", "Bruno", "Carla"]

# o jeito de outras linguagens, que funciona e é feio
for i in range(len(alunos)):
    print(i + 1, alunos[i])

# o jeito de Python
for posicao, nome in enumerate(alunos, start=1):
    print(posicao, nome)</code></pre>
<p>O <code>enumerate</code> entrega os dois: a posição e o valor. O <code>start=1</code> faz a
contagem começar em 1, que é o que se quer ao numerar uma lista para uma pessoa ler.</p>

<h2>Duas listas ao mesmo tempo</h2>
<pre><code>nomes = ["Ana", "Bruno"]
notas = [8.5, 5.0]

for nome, nota in zip(nomes, notas):
    print(f"{nome}: {nota}")</code></pre>
<p>O <code>zip</code> costura as duas listas item a item. Se tiverem tamanhos diferentes, ele para na
menor — o que evita o erro de índice, mas também esconde a diferença. Se isso importar, confira os
tamanhos antes.</p>

<h2>Sair e pular</h2>
<pre><code>for numero in numeros:
    if numero &lt; 0:
        continue        # pula este e vai para o próximo
    if numero &gt; 100:
        break           # abandona o laço inteiro
    print(numero)</code></pre>
<p>Cuidado com o <code>break</code> dentro de laço aninhado: ele sai só do laço mais interno. Quando
precisar sair dos dois, o caminho limpo costuma ser transformar o bloco em função e usar
<code>return</code>.</p>

<h2>O erro de mexer na lista enquanto percorre</h2>
<pre><code>for item in lista:
    if item &lt; 0:
        lista.remove(item)    # pula elementos, e ninguém avisa

lista = [item for item in lista if item &gt;= 0]   # cria uma nova, correto</code></pre>
<p>Remover durante a repetição desloca os itens e faz o laço saltar posições. O resultado sai errado
sem nenhuma mensagem — daquele tipo que só se descobre conferindo na mão.</p>

<h2>Faça agora</h2>
<p>Faça uma lista com cinco nomes e imprima numerada, com <code>enumerate</code>. Depois crie a lista
das notas e imprima os pares com <code>zip</code>. Compare com a versão usando
<code>range(len())</code>: qual você lê mais rápido?</p>
`,

  'python-listas-e-dicionarios': `
<h2>Fatiar: pegar um pedaço</h2>
<pre><code>numeros = [10, 20, 30, 40, 50]

numeros[1:3]     # [20, 30]     — do 1 até antes do 3
numeros[:2]      # [10, 20]     — do começo
numeros[3:]      # [40, 50]     — até o fim
numeros[-1]      # 50           — o último
numeros[-2:]     # [40, 50]     — os dois últimos
numeros[::-1]    # [50,40,...]  — invertida</code></pre>
<p>O índice negativo conta de trás para frente, e <code>[-1]</code> — o último item — é dos atalhos
mais usados da linguagem. Funciona igual em texto: <code>nome[0]</code> é a primeira letra.</p>

<h2>Criar lista numa linha</h2>
<pre><code>quadrados = []
for n in range(1, 6):
    quadrados.append(n ** 2)

quadrados = [n ** 2 for n in range(1, 6)]              # o mesmo
pares     = [n for n in numeros if n % 2 == 0]         # com filtro</code></pre>
<p>Lê-se de dentro para fora: "para cada n no intervalo, guarde n ao quadrado". Vale para o caso
simples; quando a lógica cresce, o <code>for</code> normal continua sendo mais claro.</p>

<h2>Buscar no dicionário sem quebrar</h2>
<pre><code>aluno = {"nome": "Ana", "nota": 8.5}

aluno["turma"]              # KeyError — o programa para
aluno.get("turma")          # None, sem quebrar
aluno.get("turma", "3A")    # "3A" — valor padrão</code></pre>
<p>Use colchete quando a chave <strong>tem</strong> que existir: se faltar, é bug e você quer saber.
Use <code>.get</code> quando ela <strong>pode</strong> faltar.</p>

<h2>Percorrer um dicionário</h2>
<pre><code>for chave in aluno:                    # só as chaves
for valor in aluno.values():           # só os valores
for chave, valor in aluno.items():     # os dois — o mais usado
    print(f"{chave}: {valor}")</code></pre>

<h2>A armadilha da lista dentro da lista</h2>
<pre><code>a = [1, 2, 3]
b = a
b.append(4)
print(a)        # [1, 2, 3, 4] — mudou os dois

c = a.copy()    # cópia de verdade</code></pre>
<p>Igual ao que acontece com objeto em JavaScript: <code>b = a</code> dá outro nome à mesma lista.
Esse conceito reaparece em toda linguagem, e reconhecê-lo aqui poupa horas depois.</p>

<h2>Faça agora</h2>
<p>Com uma lista de dez números: pegue os três primeiros, os dois últimos, a lista invertida e só os
pares — cada um em uma linha. Depois monte um dicionário de um aluno e tente ler uma chave que não
existe, primeiro com colchete e depois com <code>.get</code>.</p>
`,

  'python-funcoes': `
<h2>Parâmetro com valor padrão</h2>
<pre><code>def cumprimentar(nome, saudacao="Olá"):
    return f"{saudacao}, {nome}!"

cumprimentar("Ana")            # "Olá, Ana!"
cumprimentar("Ana", "Bom dia") # "Bom dia, Ana!"</code></pre>
<p>O parâmetro com padrão vem sempre <strong>depois</strong> dos obrigatórios — o contrário é erro de
sintaxe.</p>

<h2>A armadilha do padrão mutável</h2>
<pre><code>def adicionar(item, lista=[]):     # errado
    lista.append(item)
    return lista

adicionar("a")   # ['a']
adicionar("b")   # ['a', 'b'] — a MESMA lista de antes!

def adicionar(item, lista=None):   # certo
    if lista is None:
        lista = []
    lista.append(item)
    return lista</code></pre>
<p>O valor padrão é criado <strong>uma vez só</strong>, quando a função é definida — não a cada
chamada. Com lista ou dicionário como padrão, todas as chamadas compartilham o mesmo objeto. É a
pegadinha mais citada de Python, e vale conhecer antes de cair nela.</p>

<h2>Devolver mais de um valor</h2>
<pre><code>def estatisticas(numeros):
    return min(numeros), max(numeros), sum(numeros) / len(numeros)

menor, maior, media = estatisticas([4, 8, 15, 16])</code></pre>
<p>Tecnicamente devolve uma tupla, e o desempacotamento distribui nas variáveis. Serve para função
que produz duas ou três coisas relacionadas; passando disso, um dicionário se lê melhor.</p>

<h2>Explicar a função para quem chama</h2>
<pre><code>def media(notas):
    """Devolve a média das notas. Lista vazia devolve 0."""
    if not notas:
        return 0
    return sum(notas) / len(notas)</code></pre>
<p>Essa primeira linha entre aspas triplas é a <em>docstring</em>. O editor mostra ela quando você
usa a função, e <code>help(media)</code> imprime. Uma linha dizendo o que entra, o que sai e o caso
especial já resolve.</p>

<h2>Faça agora</h2>
<p>Escreva uma função que recebe uma lista de notas e devolve média, maior e menor, com docstring e
tratando a lista vazia. Depois teste com <code>[]</code> — se quebrar com
<code>ZeroDivisionError</code>, faltou o caso especial.</p>
`,

  'python-arquivos': `
<h2>Os modos de abertura</h2>
<table>
  <tr><th>Modo</th><th>Faz</th><th>Cuidado</th></tr>
  <tr><td><code>"r"</code></td><td>lê</td><td>erro se o arquivo não existir</td></tr>
  <tr><td><code>"w"</code></td><td>escreve do zero</td><td><strong>apaga tudo</strong> que havia</td></tr>
  <tr><td><code>"a"</code></td><td>acrescenta no fim</td><td>cria se não existir</td></tr>
  <tr><td><code>"x"</code></td><td>cria novo</td><td>erro se já existir — proteção contra sobrescrever</td></tr>
</table>
<p>O <code>"w"</code> é o que mais causa estrago: ele apaga sem perguntar, no instante em que o
arquivo é aberto — antes mesmo de você escrever qualquer coisa. Se a intenção é acrescentar, é
<code>"a"</code>.</p>

<h2>Caminho que funciona em qualquer computador</h2>
<pre><code>caminho = "C:\\\\Users\\\\Ana\\\\dados.csv"      # só funciona nessa máquina

from pathlib import Path
caminho = Path(__file__).parent / "dados.csv"   # ao lado do programa</code></pre>
<p>O <code>pathlib</code> monta o caminho com a barra certa para cada sistema, e o
<code>__file__</code> aponta para a pasta do próprio programa. Assim o projeto funciona quando você
manda para outra pessoa.</p>

<h2>Ler tudo ou linha por linha</h2>
<pre><code>with open(arq, encoding="utf-8") as f:
    tudo = f.read()          # o arquivo inteiro na memória

with open(arq, encoding="utf-8") as f:
    for linha in f:          # uma por vez
        processar(linha.strip())</code></pre>
<p>Para arquivo pequeno, tanto faz. Para um de 2 GB, a primeira forma trava o computador e a segunda
funciona — porque só uma linha fica na memória de cada vez.</p>

<h2>Gravar CSV</h2>
<pre><code>import csv

with open("saida.csv", "w", newline="", encoding="utf-8") as f:
    escritor = csv.DictWriter(f, fieldnames=["nome", "media"])
    escritor.writeheader()
    escritor.writerow({"nome": "Ana", "media": 8.5})</code></pre>
<p>O <code>newline=""</code> parece detalhe e não é: sem ele, no Windows o arquivo sai com uma linha
em branco entre cada registro.</p>

<h2>Faça agora</h2>
<p>Escreva um programa que grava três linhas num arquivo com <code>"w"</code>, roda de novo e
confere o resultado — só as três últimas estão lá. Troque para <code>"a"</code> e rode duas vezes:
agora são seis. Ver isso acontecer é o que fixa a diferença.</p>
`,

  'python-automatizando': `
<h2>Organizar o programa em arquivos</h2>
<pre><code>meu_projeto/
    main.py          # o que roda
    calculos.py      # as funções de cálculo
    dados.csv</code></pre>
<pre><code># em calculos.py
def media(notas):
    return sum(notas) / len(notas)

# em main.py
from calculos import media
print(media([8, 9, 7]))</code></pre>
<p>Cada arquivo <code>.py</code> é um módulo, e importar dele é assim. Quando o programa passa de
umas cem linhas, separar por assunto é o que permite achar as coisas depois.</p>

<h2>A linha que aparece em todo programa Python</h2>
<pre><code>def main():
    print("rodando")

if __name__ == "__main__":
    main()</code></pre>
<p>Essa condição é verdadeira quando o arquivo é executado diretamente, e falsa quando ele é
importado por outro. Sem ela, importar <code>calculos.py</code> executaria o programa inteiro em vez
de só disponibilizar as funções.</p>

<h2>Receber o que o programa precisa</h2>
<pre><code>import sys

if len(sys.argv) &lt; 2:
    print("Uso: python programa.py arquivo.csv")
    sys.exit(1)

caminho = sys.argv[1]</code></pre>
<p>Assim o programa vira ferramenta: roda com arquivos diferentes sem precisar editar o código. O
<code>sys.exit(1)</code> encerra sinalizando erro — o que importa quando outro programa chama o
seu.</p>

<h2>Antes de considerar pronto</h2>
<ul>
  <li>Roda numa pasta diferente? (caminho relativo, não absoluto)</li>
  <li>Diz o que fazer quando falta o arquivo, em vez de mostrar erro vermelho?</li>
  <li>Tem README dizendo como rodar e o que precisa estar na pasta?</li>
  <li>Alguém que não é você consegue usar seguindo o README?</li>
</ul>
<p>O último é o teste de verdade. Programa que só funciona na sua máquina não automatizou nada — só
mudou o lugar do trabalho.</p>

<h2>Faça agora</h2>
<p>Separe um programa seu em dois arquivos: um com as funções e outro que os usa. Acrescente o
<code>if __name__ == "__main__"</code> e confirme que importar o primeiro não executa nada.</p>
`,
}

const NOVAS = [
  {
    curso: 'python-do-zero',
    slug: 'python-textos',
    titulo: 'Texto: a metade do trabalho',
    min: 6, ordem: 5,
    descricao: 'Fatiar, limpar, procurar e montar texto — o que mais aparece em automação.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Usar os métodos de texto mais frequentes</li>
  <li>Limpar dado que veio sujo</li>
  <li>Entender por que texto em Python não se altera</li>
</ul>

<h2>Por que texto merece uma aula</h2>
<p>Quase toda automação é trabalho de texto: ler nome de arquivo, limpar planilha exportada, montar
relatório, procurar palavra num documento. Quem domina os métodos de string resolve em três linhas o
que outros resolvem em trinta.</p>

<h2>Os que você vai usar toda semana</h2>
<pre><code>nome = "  Ana Souza  "

nome.strip()          # "Ana Souza"  — tira espaço das pontas
nome.upper()          # "  ANA SOUZA  "
nome.lower()          # "  ana souza  "
nome.strip().title()  # "Ana Souza"  — cada palavra com maiúscula

texto = "ana@escola.com"
texto.startswith("ana")     # True
texto.endswith(".com")      # True
texto.replace("@", " arroba ")
texto.split("@")            # ['ana', 'escola.com']

"-".join(["33", "99999", "0000"])   # "33-99999-0000"</code></pre>
<p>O par <code>split</code> e <code>join</code> resolve a maior parte do trabalho com CSV, listas de
nomes e qualquer coisa separada por vírgula.</p>

<h2>Texto não muda — cria outro</h2>
<pre><code>nome = "  Ana  "
nome.strip()
print(nome)          # "  Ana  " — continua igual!

nome = nome.strip()  # agora sim
print(nome)          # "Ana"</code></pre>
<p>Em Python, string é imutável: todo método devolve um texto <strong>novo</strong> e deixa o
original intacto. Esquecer de guardar o resultado é o erro mais comum da aula — o programa roda,
não reclama, e o texto continua sujo.</p>

<h2>Limpar dado de verdade</h2>
<p>Nome digitado por gente vem assim: <code>"  ana  MARIA silva "</code>. A limpeza padrão:</p>
<pre><code>def limpar_nome(bruto):
    """Tira espaços das pontas, colapsa os do meio e ajusta maiúsculas."""
    return " ".join(bruto.split()).title()

limpar_nome("  ana  MARIA silva ")   # "Ana Maria Silva"</code></pre>
<p>O truque está no <code>split()</code> sem argumento: ele quebra em qualquer quantidade de espaço,
tabulação ou quebra de linha, e descarta os vazios. Juntando de novo com um espaço, sobra o texto
limpo.</p>

<h2>Fatiar como lista</h2>
<pre><code>cpf = "12345678900"
cpf[:3]        # "123"
cpf[-2:]       # "00"

data = "2026-08-23"
ano, mes, dia = data.split("-")</code></pre>
<p>Texto se fatia com a mesma sintaxe das listas, porque em Python ele também é uma sequência.</p>

<h2>Montar texto: f-string sempre</h2>
<pre><code>msg = "Aluno " + nome + " tirou " + str(nota)      # verboso, e exige str()
msg = f"Aluno {nome} tirou {nota}"                  # legível
msg = f"Aluno {nome} tirou {nota:.1f}"              # com uma casa decimal
msg = f"Total: R$ {valor:,.2f}"                     # com separador de milhar</code></pre>
<p>Aquele <code>:.1f</code> depois da variável é o formato: uma casa decimal. Vale a pena conhecer —
é ele que transforma <code>7.666666666</code> em <code>7.7</code> no relatório.</p>

<h2>Faça agora</h2>
<p>Escreva a função <code>limpar_nome</code> e teste com cinco nomes escritos de formas diferentes:
tudo minúsculo, tudo maiúsculo, com espaço a mais no meio, com espaço nas pontas, com quebra de
linha no fim. Os cinco precisam sair no mesmo formato.</p>
`,
    desafio: {
      titulo: 'Limpando a lista da secretaria',
      enunciado: `<p>Você recebeu uma lista de nomes copiada de uma planilha, e ela veio assim:</p>
<pre><code>nomes = [
    "  ana maria silva ",
    "BRUNO   COSTA",
    "\\tcarla  souza\\n",
    "Daniel   de   Oliveira  ",
    "  ",
]</code></pre>
<p>Escreva um programa que:</p>
<ul>
  <li>Limpa cada nome: sem espaço sobrando, cada palavra com maiúscula</li>
  <li>Descarta as entradas vazias</li>
  <li>Ordena em ordem alfabética</li>
  <li>Gera o e-mail de cada um no formato <code>primeiro.ultimo@escola.com</code>, sem acento e em minúsculas</li>
  <li>Grava tudo num arquivo <code>alunos.txt</code>, um por linha</li>
</ul>
<p>O caso do "Daniel de Oliveira" é o interessante: o e-mail dele deve sair
<code>daniel.oliveira@escola.com</code>. Decida o que fazer com o "de" e explique a decisão num
comentário.</p>`,
    },
  },
  {
    curso: 'python-do-zero',
    slug: 'python-erros',
    titulo: 'Quando dá erro: exceções',
    min: 6, ordem: 8,
    descricao: 'Tratar o que pode falhar, em vez de deixar o programa quebrar na cara de quem usa.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Ler o rastro de erro do Python e achar a origem</li>
  <li>Tratar as falhas previsíveis com <code>try</code></li>
  <li>Saber quando NÃO tratar</li>
</ul>

<h2>Ler o rastro de baixo para cima</h2>
<pre><code>Traceback (most recent call last):
  File "main.py", line 12, in &lt;module&gt;
    resultado = calcular(dados)
  File "calculos.py", line 5, in calcular
    return total / quantidade
ZeroDivisionError: division by zero</code></pre>
<p>A <strong>última linha</strong> diz o que aconteceu. A linha logo acima dela diz onde. O resto é
o caminho percorrido até ali — útil quando o erro nasce fundo em funções encadeadas.</p>
<p>Iniciante lê de cima e se perde no caminho. Comece pelo fim: tipo do erro e linha. Nos dois casos
acima, a informação toda está nas duas últimas linhas.</p>

<h2>Tratar o previsível</h2>
<pre><code>try:
    idade = int(input("Idade: "))
except ValueError:
    print("Digite apenas números.")</code></pre>
<p>O <code>try</code> tenta; se der o erro indicado, o <code>except</code> assume. O programa segue
funcionando em vez de morrer com um rastro vermelho na tela de quem usa.</p>

<h2>Os erros que valem tratar</h2>
<table>
  <tr><th>Erro</th><th>Acontece quando</th></tr>
  <tr><td><code>ValueError</code></td><td>o texto não vira número: <code>int("abc")</code></td></tr>
  <tr><td><code>FileNotFoundError</code></td><td>o arquivo não está lá</td></tr>
  <tr><td><code>KeyError</code></td><td>a chave não existe no dicionário</td></tr>
  <tr><td><code>IndexError</code></td><td>a posição não existe na lista</td></tr>
  <tr><td><code>ZeroDivisionError</code></td><td>divisão por zero — lista vazia, quase sempre</td></tr>
</table>

<h2>Não engula tudo</h2>
<pre><code># errado: esconde qualquer problema, inclusive erro de digitação seu
try:
    processar()
except:
    pass

# certo: trata o que você previu, e diz o que fazer
try:
    processar()
except FileNotFoundError:
    print("Arquivo dados.csv não encontrado. Coloque-o na pasta do programa.")</code></pre>
<p>O <code>except</code> vazio com <code>pass</code> é a pior linha que se pode escrever em Python:
o programa passa a falhar em silêncio, e você perde a única pista que tinha. Trate o erro que você
sabe que pode acontecer, e deixe os outros aparecerem.</p>

<h2>As partes completas</h2>
<pre><code>try:
    arquivo = open("dados.csv", encoding="utf-8")
except FileNotFoundError:
    print("Arquivo não encontrado.")
else:
    processar(arquivo)      # roda só se NÃO deu erro
finally:
    print("Fim.")           # roda sempre, com erro ou sem</code></pre>
<p>Na prática, o <code>with open(...)</code> que você já usa cuida do fechamento sozinho — é para
isso que ele existe. O <code>finally</code> aparece quando há outro recurso a liberar.</p>

<h2>Avisar quando o dado não faz sentido</h2>
<pre><code>def calcular_media(notas):
    if not notas:
        raise ValueError("A lista de notas está vazia.")
    return sum(notas) / len(notas)</code></pre>
<p>O <code>raise</code> levanta o erro de propósito. É melhor do que devolver 0 fingindo que deu
certo: quem chamou fica sabendo que algo está errado, com uma mensagem que explica.</p>

<h2>Faça agora</h2>
<p>Escreva um programa que pede um número e divide 100 por ele. Trate os dois casos: texto no lugar
de número e o zero. Depois teste digitando "abc", depois "0", depois "4" — as três respostas
precisam ser úteis para quem está na frente da tela.</p>
`,
    desafio: {
      titulo: 'Um programa que não quebra',
      enunciado: `<p>Escreva um programa que lê um arquivo <code>notas.csv</code> e calcula a média de cada aluno — mas que <strong>não quebra em nenhuma situação</strong>.</p>
<p>Trate pelo menos:</p>
<ul>
  <li>O arquivo não existe</li>
  <li>O arquivo existe mas está vazio</li>
  <li>Uma linha tem texto onde deveria haver número</li>
  <li>Uma linha tem menos colunas que o esperado</li>
  <li>Um aluno sem nenhuma nota</li>
</ul>
<p>Para cada caso, o programa deve dizer o que houve e continuar com as linhas boas — não parar
tudo por causa de uma linha ruim. No fim, mostre quantas linhas foram processadas e quantas foram
descartadas.</p>
<p>Prepare um CSV de teste com todos esses defeitos de propósito e entregue os dois arquivos.</p>`,
    },
  },
  {
    curso: 'python-do-zero',
    slug: 'python-bibliotecas',
    titulo: 'Bibliotecas: o que já existe pronto',
    min: 6, ordem: 9,
    descricao: 'Por que Python vale a pena — e como não reinventar o que já foi feito.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Usar as bibliotecas que já vêm com o Python</li>
  <li>Instalar bibliotecas de terceiros</li>
  <li>Reconhecer quando procurar em vez de escrever</li>
</ul>

<h2>A pergunta que economiza horas</h2>
<p>Antes de escrever qualquer função que pareça genérica — sortear, calcular data, ler planilha,
baixar página — pergunte: <em>isso já não existe?</em> Em Python, quase sempre existe. É essa
biblioteca enorme que explica por que a linguagem é usada em tanta coisa diferente.</p>

<h2>As que já vêm instaladas</h2>
<pre><code>import random
random.randint(1, 60)              # sorteia um número
random.choice(["Ana", "Bruno"])    # sorteia um item
random.shuffle(lista)              # embaralha (altera a lista)
random.sample(range(1, 61), 6)     # 6 números sem repetir</code></pre>
<pre><code>from datetime import date, datetime, timedelta

hoje = date.today()
hoje.strftime("%d/%m/%Y")          # "23/08/2026"
nascimento = date(2009, 5, 14)
idade = (hoje - nascimento).days // 365
amanha = hoje + timedelta(days=1)</code></pre>
<pre><code>import os
os.listdir("fotos")                # lista os arquivos da pasta
os.path.exists("dados.csv")        # o arquivo existe?
os.rename("a.jpg", "b.jpg")        # renomeia</code></pre>
<p>Só com essas três você já automatiza sorteio de equipes, cálculo de prazo e renomeação de
arquivos em lote — que são justamente os pedidos mais comuns na escola.</p>

<h2>Instalar as outras</h2>
<pre><code>pip install openpyxl</code></pre>
<table>
  <tr><th>Biblioteca</th><th>Serve para</th></tr>
  <tr><td><code>openpyxl</code></td><td>ler e escrever Excel de verdade, com abas e fórmulas</td></tr>
  <tr><td><code>requests</code></td><td>baixar página e conversar com API</td></tr>
  <tr><td><code>pandas</code></td><td>planilhas grandes e análise de dados</td></tr>
  <tr><td><code>pillow</code></td><td>redimensionar e converter imagem em lote</td></tr>
</table>
<p>Instale só o que for usar. Cada biblioteca é código de outra pessoa rodando na sua máquina, e
projeto cheio de dependência que ninguém lembra para que serve é problema garantido lá na frente.</p>

<h2>As três formas de importar</h2>
<pre><code>import random                      # random.randint(1, 6)
from random import randint         # randint(1, 6)
from random import *               # evite: não se sabe de onde veio o quê</code></pre>
<p>A primeira é a mais clara em programa grande — lendo <code>random.randint</code> você sabe de
onde vem. A terceira despeja tudo e cria conflito silencioso quando duas bibliotecas têm função de
mesmo nome.</p>

<h2>Um programa inteiro com o que já existe</h2>
<pre><code>import random
from datetime import date

def sortear_equipes(nomes, tamanho=4):
    """Divide os nomes em equipes embaralhadas."""
    embaralhados = nomes[:]          # cópia, para não bagunçar a original
    random.shuffle(embaralhados)
    return [embaralhados[i:i + tamanho]
            for i in range(0, len(embaralhados), tamanho)]

def salvar(equipes):
    nome = f"equipes_{date.today().strftime('%Y-%m-%d')}.txt"
    with open(nome, "w", encoding="utf-8") as f:
        for numero, equipe in enumerate(equipes, start=1):
            f.write(f"Equipe {numero}: {', '.join(equipe)}\\n")
    return nome</code></pre>
<p>Doze linhas resolvem o que na mão leva quinze minutos e sai errado. Nenhuma delas é difícil — o
que faz o programa existir é saber que <code>shuffle</code> e <code>strftime</code> já estavam
prontos.</p>

<h2>Onde procurar</h2>
<ul>
  <li><strong>docs.python.org/pt-br</strong> — a documentação oficial, em português</li>
  <li><strong>pypi.org</strong> — o catálogo de bibliotecas; veja a data da última atualização
    antes de instalar</li>
  <li>Buscar em inglês resolve mais rápido: "python read excel file" traz mais que a versão em
    português</li>
</ul>

<h2>Faça agora</h2>
<p>Escreva um programa de quinze linhas que sorteia as equipes da sua turma a partir de um arquivo
de nomes e grava o resultado com a data no nome do arquivo. Use <code>random</code> e
<code>datetime</code> — os dois já estão instalados.</p>
`,
    desafio: {
      titulo: 'Automatize algo com biblioteca pronta',
      enunciado: `<p>Escolha uma tarefa real e resolva usando pelo menos duas bibliotecas.</p>
<p>Sugestões que cabem no que você já sabe:</p>
<ul>
  <li>Sorteador de equipes ou de apresentações, gravando o resultado com data</li>
  <li>Renomeador de fotos em lote, com <code>os</code> e um padrão de nome</li>
  <li>Calculadora de prazos: quantos dias úteis faltam para uma data</li>
  <li>Relatório de presença a partir de um CSV, com o total do mês</li>
</ul>
<p>Requisitos: pelo menos duas bibliotecas, tratamento de erro para o arquivo que falta, funções com
docstring, e um README dizendo como rodar.</p>
<p>No README, escreva também <strong>quanto tempo essa tarefa levava na mão</strong> e quanto leva
agora. É esse número que justifica ter automatizado.</p>`,
    },
  },
]

await aplicar({ AMPLIACOES, NOVAS })
