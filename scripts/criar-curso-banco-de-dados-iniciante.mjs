/**
 * Cria o segundo curso da trilha "Programação Iniciante": Banco de Dados para
 * Iniciantes, da planilha à tabela.
 *
 *   node scripts/criar-curso-banco-de-dados-iniciante.mjs             simula
 *   node scripts/criar-curso-banco-de-dados-iniciante.mjs --aplicar   grava como rascunho (publicado = 0)
 *   node scripts/criar-curso-banco-de-dados-iniciante.mjs --publicar  liga curso e aulas
 *
 * Por que outro curso de banco de dados: o que existe ("Banco de Dados: do
 * Modelo ao SQL", trilha Programação, nível Difícil, 11 aulas) parte de quem já
 * programa e chega em normalização, transação e índice. Quem nunca viu uma
 * tabela não tem por onde entrar. Este curso é a porta: sai da planilha, que
 * o aluno já conhece, e chega na primeira consulta com duas tabelas. Termina
 * apontando para o curso avançado.
 *
 * Posição: curso 2 do módulo "Programação Iniciante" e da trilha de mesmo
 * nome, logo depois de Fluxogramas. Não mexe em nenhuma outra trilha nem
 * empurra curso de ninguém.
 *
 * Cargas seguem o critério conservador de scripts/recalcular-cargas.mjs:
 * curso 20 min, aulas de 3 a 4 min. O módulo passa de 37 para 57 min
 * (dois cursos de 20 + projeto de módulo).
 *
 * Ferramenta ensinada: sqliteonline.com. Gratuito, roda no navegador sem
 * conta e sem instalar (SQLite 3.50 em 2026-09-21, conferido no site). Como
 * extra na aula 3, o DB Browser for SQLite: gratuito, código aberto, Windows,
 * Mac e Linux (v3.13.1, conferido em github.com/sqlitebrowser/sqlitebrowser).
 *
 * Fechamento: um mini desafio (sistema escolar: turmas, alunos, notas) preso à
 * última aula, sem valer certificado, e o projeto final, que vale.
 *
 * Tudo nasce despublicado. O André revisa em /admin/cursos/gerenciar e, quando
 * aprovar, roda com --publicar. Idempotente: rodar duas vezes não duplica nada.
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

const MODULO_SLUG = 'programacao-iniciante'
const TRILHA_SLUG = 'programacao-iniciante'
const MODULO_CARGA_MIN = 57

const CURSO = {
  slug: 'banco-de-dados-iniciante',
  titulo: 'Banco de Dados para Iniciantes: da planilha à tabela',
  categoria: 'Programação',
  carga: 1,
  cargaMin: 20,
  descricao:
    'Seis aulas para entender o que é um banco de dados, montar suas primeiras tabelas e fazer perguntas a elas em SQL. Você pratica no sqliteonline.com, direto no navegador, sem instalar nada, e termina com o banco de dados de algo real da sua vida.',
  ordemNoModulo: 2,
  ordemNaTrilha: 2,
}

const FORMATOS = '.sql, .png, .pdf, .db, .sqlite'

const AULAS = [
  {
    slug: 'o-que-e-um-banco-de-dados',
    titulo: 'O que é um banco de dados e por que a planilha não dá conta',
    min: 3,
    descricao: 'Tabela, linha e coluna. Onde a planilha começa a falhar e o que o banco de dados resolve.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Reconhecer um banco de dados nas coisas que você já usa</li>
  <li>Dizer o que é tabela, linha e coluna</li>
  <li>Explicar em que momento a planilha deixa de dar conta</li>
</ul>

<h2>Você usa banco de dados o dia inteiro</h2>
<p>Quando você abre o WhatsApp, as mensagens estão lá. Quando entra no site da escola, sua nota
aparece. Quando o caixa do mercado passa um produto, o preço vem na hora. Nada disso está "solto":
está guardado em um <strong>banco de dados</strong>, um lugar organizado para guardar informação
e encontrar depois.</p>
<p>A palavra importante é <em>organizado</em>. Um monte de papel em uma gaveta também guarda
informação. Banco de dados é a gaveta com pastas etiquetadas, onde qualquer pessoa acha o que
procura em segundos.</p>

<h2>Tabela, linha e coluna</h2>
<p>A forma mais comum de organizar dados é a <strong>tabela</strong>. Você já conhece: é a mesma
coisa da planilha e da lista de chamada.</p>
<pre><code>alunos
+----+----------------+-------+-----------------+
| id | nome           | turma | telefone        |
+----+----------------+-------+-----------------+
| 1  | Ana Souza      | 1A    | 33 99999-0000   |
| 2  | Bruno Lima     | 1A    | 33 98888-1111   |
| 3  | Carla Mendes   | 2B    | 33 97777-2222   |
+----+----------------+-------+-----------------+</code></pre>
<ul>
  <li>Cada <strong>linha</strong> é uma coisa: um aluno. Também se chama <strong>registro</strong>.</li>
  <li>Cada <strong>coluna</strong> é uma informação sobre essa coisa: nome, turma, telefone. Também
  se chama <strong>campo</strong>.</li>
  <li>A tabela tem um nome, e o nome diz o que ela guarda: <code>alunos</code>.</li>
</ul>
<p>Regra de ouro: <strong>uma tabela guarda um tipo de coisa só</strong>. Alunos em uma, livros em
outra, empréstimos em outra. Misturar tudo em uma tabela é o erro número um de quem começa.</p>

<h2>Onde a planilha começa a falhar</h2>
<p>Planilha resolve muita coisa, e vai continuar resolvendo. Mas ela quebra em quatro situações:</p>
<table>
  <tr><th>Situação</th><th>O que acontece na planilha</th></tr>
  <tr><td>Muita gente mexendo ao mesmo tempo</td><td>Um sobrescreve o outro, ou aparecem cinco cópias do arquivo</td></tr>
  <tr><td>Muitos dados</td><td>Com dezenas de milhares de linhas, ela trava para abrir e para filtrar</td></tr>
  <tr><td>Dado repetido</td><td>O telefone da Ana está em vinte linhas; ela troca de número e alguém esquece de mudar uma</td></tr>
  <tr><td>Ninguém obriga o formato</td><td>Uma célula tem "1A", outra "1ºA", outra "1 A". Na hora de contar a turma, são três turmas</td></tr>
</table>
<p>O banco de dados existe para essas quatro coisas: várias pessoas ao mesmo tempo, muitos dados,
cada informação guardada uma vez só, e regras que impedem o dado errado de entrar.</p>

<h2>Como se conversa com um banco de dados</h2>
<p>Não é clicando em célula. É escrevendo pedidos em uma linguagem chamada <strong>SQL</strong>
(fala-se "ésse-quê-éle" ou "síquel"). Um pedido em SQL parece uma frase em inglês:</p>
<pre><code>SELECT nome, telefone FROM alunos WHERE turma = '1A';</code></pre>
<p>Leia: <em>selecione nome e telefone, da tabela alunos, onde a turma é 1A</em>. Você vai
escrever a sua primeira a partir da aula 3. Por enquanto só precisa saber que existe e que é
legível.</p>

<h2>Glossário desta aula</h2>
<ul>
  <li><strong>Banco de dados:</strong> lugar organizado para guardar informação e encontrar depois.</li>
  <li><strong>Tabela:</strong> conjunto de linhas e colunas que guarda um tipo de coisa.</li>
  <li><strong>Linha (registro):</strong> uma coisa dentro da tabela.</li>
  <li><strong>Coluna (campo):</strong> uma informação sobre a coisa.</li>
  <li><strong>SQL:</strong> a linguagem usada para pedir coisas ao banco de dados.</li>
</ul>

<h2>Resumo</h2>
<p>Banco de dados é a gaveta organizada. Tabela tem linhas (as coisas) e colunas (as informações).
Uma tabela, um tipo de coisa. A planilha falha com muita gente, muitos dados, repetição e falta de
regra. Com o banco se conversa em SQL.</p>
`,
    desafio: {
      titulo: 'Três bancos de dados do seu dia',
      enunciado: `<p>Escreva, no caderno ou no bloco de notas, <strong>três lugares</strong> onde você usa um
banco de dados sem perceber (aplicativo, site, loja, escola).</p>
<p>Para cada um:</p>
<ul>
  <li>Diga <strong>uma tabela</strong> que provavelmente existe lá (ex.: no WhatsApp, a tabela de
  mensagens)</li>
  <li>Liste <strong>quatro colunas</strong> dessa tabela</li>
  <li>Escreva <strong>uma linha</strong> de exemplo, inventada</li>
</ul>
<p>Depois responda em duas linhas: qual dos quatro problemas da planilha (muita gente, muitos dados,
repetição, falta de regra) seria o pior se esse serviço usasse planilha em vez de banco?</p>
<p>Envie foto ou PDF.</p>`,
    },
  },
  {
    slug: 'tabela-bem-feita',
    titulo: 'Tabela bem feita: cada coisa no seu lugar',
    min: 3,
    descricao: 'Tipos de dado, o id que identifica cada linha e as regras que impedem o dado errado de entrar. Desenhar a tabela no papel antes de criar.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Escolher o tipo certo para cada coluna: texto, número ou data</li>
  <li>Entender por que toda tabela tem um <code>id</code></li>
  <li>Desenhar uma tabela no papel antes de criar no computador</li>
</ul>

<h2>Cada coluna tem um tipo</h2>
<p>Na planilha, uma célula aceita qualquer coisa. No banco de dados, cada coluna declara
<strong>que tipo de dado</strong> aceita, e recusa o resto. Três tipos resolvem quase tudo no
começo:</p>
<table>
  <tr><th>Tipo</th><th>Serve para</th><th>Exemplo</th><th>Em SQL</th></tr>
  <tr><td>Texto</td><td>Nomes, descrições, códigos com letras</td><td><code>'Ana Souza'</code>, <code>'1A'</code></td><td><code>TEXT</code></td></tr>
  <tr><td>Número inteiro</td><td>Quantidade, idade, ano</td><td><code>17</code>, <code>2026</code></td><td><code>INTEGER</code></td></tr>
  <tr><td>Número com vírgula</td><td>Preço, nota, peso</td><td><code>7.5</code>, <code>12.90</code></td><td><code>REAL</code></td></tr>
  <tr><td>Data</td><td>Nascimento, data do empréstimo</td><td><code>'2026-03-15'</code></td><td><code>TEXT</code> no formato ano-mês-dia</td></tr>
</table>
<p>Repare em duas coisas: número com vírgula em SQL usa <strong>ponto</strong> (<code>7.5</code>),
e data se escreve <strong>ano-mês-dia</strong> (<code>2026-03-15</code>). Não é capricho: nesse
formato, ordenar datas como texto dá a ordem certa.</p>
<p>Pergunta que decide o tipo: <strong>vou fazer conta com isso?</strong> Telefone e CEP são
números, mas ninguém soma telefone. Então são texto. Nota e preço entram em conta, então são
número.</p>

<h2>O id: cada linha tem um número só dela</h2>
<p>Pode existir duas alunas chamadas Ana Souza. Pode existir dois livros "Dom Casmurro". Como o
banco sabe de qual você está falando? Pela coluna <code>id</code>: um número que
<strong>nunca se repete</strong> dentro da tabela e que o próprio banco preenche, 1, 2, 3, na
ordem em que as linhas entram.</p>
<p>Essa coluna se chama <strong>chave primária</strong>. Toda tabela tem uma. Você vai usar o
<code>id</code> para apontar para uma linha específica: "apague o aluno 3", "mostre o livro 12".
Sem ele, você teria que apontar pelo nome, e nome repete.</p>

<h2>Regras que o banco cobra sozinho</h2>
<p>Além do tipo, uma coluna pode ter regras. Duas são as mais usadas:</p>
<ul>
  <li><strong>Não pode ficar vazia</strong> (<code>NOT NULL</code>). Aluno sem nome não existe.
  Se alguém tentar gravar, o banco recusa.</li>
  <li><strong>Não pode repetir</strong> (<code>UNIQUE</code>). Duas pessoas com a mesma matrícula
  é erro. O banco recusa a segunda.</li>
</ul>
<p>É isso que a planilha não faz: lá, a regra está na cabeça de quem digita. No banco, a regra está
na tabela e vale para todo mundo.</p>

<h2>Desenhar antes de criar</h2>
<p>Do mesmo jeito que se desenha o fluxograma antes de programar, se desenha a tabela antes de
criar. O desenho é simples: nome da tabela, e uma linha por coluna com nome, tipo e regra.</p>
<pre><code>livros
  id        INTEGER   chave primária
  titulo    TEXT      não vazio
  autor     TEXT      não vazio
  ano       INTEGER
  codigo    TEXT      não vazio, não repete</code></pre>
<p>Nomes de coluna: letras minúsculas, sem acento, sem espaço. Use <code>_</code> para separar:
<code>data_nascimento</code>, não <code>Data de Nascimento</code>. O banco até aceita o outro
jeito, mas você vai digitar esse nome centenas de vezes.</p>

<h2>Glossário desta aula</h2>
<ul>
  <li><strong>Tipo de dado:</strong> o que a coluna aceita: texto, número inteiro, número com vírgula.</li>
  <li><strong>Chave primária:</strong> a coluna <code>id</code>, que identifica cada linha sem repetir.</li>
  <li><strong>NOT NULL:</strong> a coluna não pode ficar vazia.</li>
  <li><strong>UNIQUE:</strong> o valor não pode repetir na tabela.</li>
</ul>

<h2>Resumo</h2>
<p>Coluna tem tipo: texto, inteiro, com vírgula. Conta-se com isso? Então é número. Toda tabela tem
<code>id</code>, que não repete e o banco preenche. Regras de não vazio e não repetir ficam na
tabela, não na cabeça de ninguém. Desenhe no papel antes de criar.</p>
`,
    desafio: {
      titulo: 'A biblioteca da escola no papel',
      enunciado: `<p>Desenhe no caderno (ou no draw.io, se preferir) as <strong>duas tabelas</strong> de uma
biblioteca de escola: <code>livros</code> e <code>alunos</code>.</p>
<ul>
  <li>Cada tabela com <code>id</code> e pelo menos <strong>quatro outras colunas</strong></li>
  <li>Para cada coluna: nome (minúsculo, sem acento, sem espaço), tipo e regra, se tiver</li>
  <li>Marque com uma estrela as colunas que <strong>não podem repetir</strong></li>
</ul>
<p>Depois escreva <strong>três linhas de exemplo</strong> em cada tabela, inventadas, respeitando os
tipos (data em ano-mês-dia, número com ponto).</p>
<p>Envie foto ou PDF.</p>`,
    },
  },
  {
    slug: 'sqliteonline-primeira-tabela',
    titulo: 'sqliteonline.com na prática: a primeira tabela no computador',
    min: 4,
    descricao: 'Abrir o sqliteonline.com sem instalar nada, criar a tabela com CREATE TABLE, colocar linhas com INSERT e ver com SELECT. Salvar o .sql.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Abrir o sqliteonline.com e rodar um comando SQL</li>
  <li>Criar uma tabela com <code>CREATE TABLE</code></li>
  <li>Colocar linhas com <code>INSERT</code> e ver tudo com <code>SELECT *</code></li>
  <li>Salvar o que fez em um arquivo <code>.sql</code></li>
</ul>

<h2>Por que sqliteonline.com</h2>
<p>Existem muitos bancos de dados (MySQL, PostgreSQL, SQL Server...). Para aprender, o melhor é o
<strong>SQLite</strong>: é um banco de dados inteiro dentro de um arquivo, sem servidor, sem
instalação, e é o mesmo que está dentro do seu celular guardando as mensagens e as fotos.</p>
<p>E o site <strong>sqliteonline.com</strong> roda o SQLite dentro do navegador:</p>
<ul>
  <li>Gratuito, sem criar conta</li>
  <li>Funciona no laboratório da escola, no celular e em casa</li>
  <li>O SQL que você aprende aqui é o mesmo dos bancos grandes, com diferenças pequenas</li>
</ul>
<p>Quem quiser usar sem internet pode instalar o <strong>DB Browser for SQLite</strong>
(sqlitebrowser.org): gratuito, código aberto, tem para Windows, Mac e Linux. Ele mostra as tabelas
em telas parecidas com a planilha e tem uma aba para escrever SQL. Fica como extra.</p>

<h2>Passo a passo: primeira tela</h2>
<ol>
  <li>Abra <strong>sqliteonline.com</strong>.</li>
  <li>Na coluna da esquerda, confira que está marcado <strong>SQLite</strong> (o site também
  oferece outros bancos; ignore por enquanto).</li>
  <li>No meio da tela há um editor de texto. É ali que você escreve o SQL.</li>
  <li>Para executar: botão <strong>Run</strong> ou <code>Ctrl+Enter</code>. O resultado aparece
  embaixo.</li>
</ol>

<h2>Criar a tabela</h2>
<p>Apague o que estiver no editor e digite:</p>
<pre><code>CREATE TABLE livros (
  id INTEGER PRIMARY KEY,
  titulo TEXT NOT NULL,
  autor TEXT NOT NULL,
  ano INTEGER,
  codigo TEXT NOT NULL UNIQUE
);</code></pre>
<p>Leia: <em>crie a tabela livros, com estas colunas</em>. É o desenho da aula passada, escrito
em SQL. Cada coluna: nome, tipo, regras. Vírgula entre uma coluna e outra, e <strong>sem
vírgula na última</strong>. Ponto e vírgula no fim do comando.</p>
<p>Execute. Se não apareceu erro em vermelho, a tabela existe. Ela aparece na coluna da
esquerda.</p>

<h2>Colocar linhas</h2>
<pre><code>INSERT INTO livros (titulo, autor, ano, codigo)
VALUES ('Dom Casmurro', 'Machado de Assis', 1899, 'L001');

INSERT INTO livros (titulo, autor, ano, codigo)
VALUES ('O Cortiço', 'Aluísio Azevedo', 1890, 'L002');

INSERT INTO livros (titulo, autor, ano, codigo)
VALUES ('Capitães da Areia', 'Jorge Amado', 1937, 'L003');</code></pre>
<p>Leia: <em>insira em livros, nestas colunas, estes valores</em>. Repare:</p>
<ul>
  <li>O <code>id</code> não aparece: o banco preenche sozinho, 1, 2, 3</li>
  <li>Texto vai entre <strong>aspas simples</strong>: <code>'Dom Casmurro'</code>. Número vai sem aspas</li>
  <li>A ordem dos valores é a ordem das colunas que você listou</li>
</ul>
<p>Agora tente inserir um quarto livro com o código <code>'L001'</code> de novo. O banco recusa:
<code>UNIQUE constraint failed</code>. É a regra funcionando.</p>

<h2>Ver o que tem lá</h2>
<pre><code>SELECT * FROM livros;</code></pre>
<p>Leia: <em>selecione tudo da tabela livros</em>. O asterisco quer dizer "todas as colunas".
Embaixo aparece a tabela com as três linhas e os ids que o banco criou.</p>

<h2>Salvar o trabalho</h2>
<p>O sqliteonline.com guarda o banco na memória do navegador. Se você fechar a aba, pode perder.
Por isso, <strong>o que se salva é o texto SQL</strong>, não o banco: selecione tudo o que
escreveu no editor, copie e cole em um arquivo de texto chamado <code>biblioteca.sql</code>.
Com esse arquivo, você recria o banco em qualquer lugar em dez segundos: cola e executa.</p>
<p>Para entregar uma imagem do resultado, tire um print da tela com a tabela aparecendo.</p>

<h2>Glossário desta aula</h2>
<ul>
  <li><strong>SQLite:</strong> banco de dados que vive em um arquivo, sem servidor.</li>
  <li><strong>CREATE TABLE:</strong> cria uma tabela.</li>
  <li><strong>INSERT:</strong> coloca uma linha na tabela.</li>
  <li><strong>SELECT *:</strong> mostra todas as colunas.</li>
  <li><strong>Arquivo .sql:</strong> texto com os comandos, que recria o banco onde for colado.</li>
</ul>

<h2>Resumo</h2>
<p>sqliteonline.com, aba SQLite, escreve no editor, <code>Ctrl+Enter</code> executa.
<code>CREATE TABLE</code> cria, <code>INSERT</code> coloca, <code>SELECT *</code> mostra. Texto
entre aspas simples, o <code>id</code> o banco preenche. Salve o texto em um <code>.sql</code>.</p>
`,
    desafio: {
      titulo: 'A biblioteca sai do papel',
      enunciado: `<p>Pegue as duas tabelas que você desenhou no desafio anterior e crie as duas no
sqliteonline.com.</p>
<ul>
  <li><code>CREATE TABLE</code> de <code>livros</code> e de <code>alunos</code>, com os tipos e regras
  do seu desenho</li>
  <li><strong>Cinco livros e cinco alunos</strong> com <code>INSERT</code></li>
  <li>Tente inserir um aluno com uma matrícula repetida e anote a mensagem de erro que apareceu</li>
  <li><code>SELECT *</code> nas duas tabelas</li>
</ul>
<p>Envie <strong>dois arquivos</strong>: o <code>biblioteca.sql</code> com todos os comandos e um
print da tela mostrando o resultado do <code>SELECT</code>.</p>`,
    },
  },
  {
    slug: 'perguntando-ao-banco',
    titulo: 'Perguntando ao banco: SELECT com WHERE, ORDER BY e COUNT',
    min: 4,
    descricao: 'Filtrar linhas, escolher colunas, ordenar, limitar e contar. As cinco perguntas que resolvem quase tudo.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Escolher só as colunas que interessam</li>
  <li>Filtrar linhas com <code>WHERE</code></li>
  <li>Ordenar, limitar e contar o resultado</li>
</ul>

<h2>A consulta é uma pergunta</h2>
<p>Todo <code>SELECT</code> responde a uma pergunta. Antes de escrever, diga a pergunta em
português: <em>"quais livros são de antes de 1900?"</em>. Depois traduza pedaço por pedaço. Para
esta aula, use a tabela de livros da aula passada, com mais algumas linhas:</p>
<pre><code>INSERT INTO livros (titulo, autor, ano, codigo) VALUES
  ('Vidas Secas', 'Graciliano Ramos', 1938, 'L004'),
  ('Iracema', 'José de Alencar', 1865, 'L005'),
  ('Quarto de Despejo', 'Carolina Maria de Jesus', 1960, 'L006');</code></pre>
<p>Repare: um <code>INSERT</code> só, com várias linhas separadas por vírgula. Funciona igual ao
de uma linha por vez, e cansa menos.</p>

<h2>Só as colunas que interessam</h2>
<pre><code>SELECT titulo, ano FROM livros;</code></pre>
<p>No lugar do asterisco, os nomes das colunas, separados por vírgula. O resultado vem com essas
duas só. Em tabela com trinta colunas, é assim que se trabalha.</p>

<h2>Só as linhas que interessam: WHERE</h2>
<pre><code>SELECT titulo, ano FROM livros WHERE ano &lt; 1900;</code></pre>
<p>O <code>WHERE</code> é o filtro. Só passa a linha em que a condição é verdadeira. É o losango do
fluxograma: uma pergunta de sim ou não, feita linha por linha.</p>
<table>
  <tr><th>Pergunta</th><th>Condição</th></tr>
  <tr><td>ano igual a 1938</td><td><code>WHERE ano = 1938</code></td></tr>
  <tr><td>ano diferente de 1938</td><td><code>WHERE ano &lt;&gt; 1938</code></td></tr>
  <tr><td>autor é Jorge Amado</td><td><code>WHERE autor = 'Jorge Amado'</code></td></tr>
  <tr><td>título começa com "C"</td><td><code>WHERE titulo LIKE 'C%'</code></td></tr>
  <tr><td>título tem "de" em qualquer lugar</td><td><code>WHERE titulo LIKE '%de%'</code></td></tr>
  <tr><td>entre 1900 e 1950</td><td><code>WHERE ano BETWEEN 1900 AND 1950</code></td></tr>
  <tr><td>duas condições ao mesmo tempo</td><td><code>WHERE ano &gt; 1900 AND autor = 'Jorge Amado'</code></td></tr>
  <tr><td>uma ou outra</td><td><code>WHERE ano &lt; 1870 OR ano &gt; 1950</code></td></tr>
</table>
<p>Texto compara com aspas simples e diferencia maiúscula de minúscula na maior parte dos bancos:
<code>'jorge amado'</code> não acha <code>'Jorge Amado'</code>. O <code>%</code> do
<code>LIKE</code> quer dizer "qualquer coisa aqui".</p>

<h2>Em ordem: ORDER BY</h2>
<pre><code>SELECT titulo, ano FROM livros ORDER BY ano;
SELECT titulo, ano FROM livros ORDER BY ano DESC;</code></pre>
<p>Sem <code>ORDER BY</code>, o banco devolve na ordem que quiser. Com ele, do menor para o
maior; com <code>DESC</code> no fim, do maior para o menor. Para ordenar por nome, é
<code>ORDER BY titulo</code>: texto ordena por ordem alfabética.</p>

<h2>Só os primeiros: LIMIT</h2>
<pre><code>SELECT titulo, ano FROM livros ORDER BY ano LIMIT 3;</code></pre>
<p>Os três mais antigos. <code>LIMIT</code> corta o resultado depois de ordenar. "Os cinco produtos
mais vendidos", "os dez alunos com maior nota": é sempre <code>ORDER BY</code> mais
<code>LIMIT</code>.</p>

<h2>Quantos: COUNT</h2>
<pre><code>SELECT COUNT(*) FROM livros;
SELECT COUNT(*) FROM livros WHERE ano &lt; 1900;</code></pre>
<p>Devolve um número só: quantas linhas passaram pelo filtro. Junto com ele vêm
<code>MIN</code>, <code>MAX</code>, <code>SUM</code> e <code>AVG</code> (menor, maior, soma,
média), que funcionam do mesmo jeito: <code>SELECT MIN(ano) FROM livros;</code> dá o ano do livro
mais antigo.</p>

<h2>A ordem das palavras</h2>
<p>O SQL exige esta ordem, sempre: <code>SELECT</code> ... <code>FROM</code> ...
<code>WHERE</code> ... <code>ORDER BY</code> ... <code>LIMIT</code>. Pode pular o que não usar,
mas não pode trocar de lugar. <code>WHERE</code> depois de <code>ORDER BY</code> dá erro.</p>

<h2>Glossário desta aula</h2>
<ul>
  <li><strong>WHERE:</strong> filtro; só passa a linha em que a condição é verdadeira.</li>
  <li><strong>LIKE:</strong> comparação de texto com pedaço desconhecido (<code>%</code>).</li>
  <li><strong>ORDER BY:</strong> ordena o resultado; <code>DESC</code> inverte.</li>
  <li><strong>LIMIT:</strong> devolve só as primeiras linhas.</li>
  <li><strong>COUNT:</strong> conta as linhas do resultado.</li>
</ul>

<h2>Resumo</h2>
<p>Diga a pergunta em português, depois traduza. Colunas depois do <code>SELECT</code>, filtro no
<code>WHERE</code>, ordem no <code>ORDER BY</code>, corte no <code>LIMIT</code>, quantidade com
<code>COUNT</code>. Sempre nessa ordem.</p>
`,
    desafio: {
      titulo: 'Dez perguntas para a biblioteca',
      enunciado: `<p>Com o banco da biblioteca (coloque pelo menos <strong>dez livros e oito alunos</strong>),
escreva a consulta SQL que responde cada pergunta. Acima de cada consulta, escreva a pergunta em
português como comentário: uma linha começando com <code>--</code>.</p>
<ol>
  <li>Título e autor de todos os livros, em ordem alfabética de título</li>
  <li>Livros publicados antes de 1900</li>
  <li>Livros de um autor específico, à sua escolha</li>
  <li>Os três livros mais recentes</li>
  <li>Livros cujo título começa com a letra "C"</li>
  <li>Quantos livros existem no total</li>
  <li>Quantos livros são de depois de 1950</li>
  <li>O ano do livro mais antigo</li>
  <li>Alunos de uma turma específica, em ordem alfabética</li>
  <li>Uma pergunta sua, que use <code>AND</code> ou <code>OR</code></li>
</ol>
<p>Envie o <code>.sql</code> com as dez consultas comentadas e um print de <strong>três</strong>
resultados à sua escolha.</p>`,
    },
  },
  {
    slug: 'mudar-e-apagar-com-cuidado',
    titulo: 'Mudar e apagar com cuidado: UPDATE e DELETE',
    min: 3,
    descricao: 'Alterar e apagar linhas. O erro do WHERE esquecido, que apaga a tabela inteira, e o hábito que evita isso.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Alterar dados com <code>UPDATE</code></li>
  <li>Apagar linhas com <code>DELETE</code></li>
  <li>Adotar o hábito que evita apagar a tabela inteira por engano</li>
</ul>

<h2>Dado muda</h2>
<p>A Ana trocou de turma. O livro estava com o ano errado. Um aluno saiu da escola. Um banco de
dados não é só para guardar e ler: é para manter atualizado. Dois comandos fazem isso, e os dois
são perigosos do mesmo jeito.</p>

<h2>UPDATE: mudar o que já existe</h2>
<pre><code>UPDATE alunos SET turma = '2A' WHERE id = 1;</code></pre>
<p>Leia: <em>na tabela alunos, mude a turma para 2A, onde o id é 1</em>. Três partes: a tabela, o
que muda (<code>SET</code>) e em quais linhas (<code>WHERE</code>).</p>
<p>Pode mudar mais de uma coluna de uma vez:</p>
<pre><code>UPDATE alunos SET turma = '2A', telefone = '33 91111-0000' WHERE id = 1;</code></pre>
<p>E pode mudar várias linhas de uma vez, de propósito. Toda a turma 1A passou de ano:</p>
<pre><code>UPDATE alunos SET turma = '2A' WHERE turma = '1A';</code></pre>

<h2>DELETE: apagar linhas</h2>
<pre><code>DELETE FROM alunos WHERE id = 3;</code></pre>
<p>Leia: <em>apague da tabela alunos, onde o id é 3</em>. Não tem <code>SET</code>, porque a linha
some inteira. Não existe "apagar uma coluna de uma linha": para isso se usa <code>UPDATE</code>
com o valor vazio.</p>

<h2>O erro que todo mundo comete uma vez</h2>
<p>Olhe este comando:</p>
<pre><code>DELETE FROM alunos;</code></pre>
<p>Sem <code>WHERE</code>, o comando vale para <strong>todas as linhas</strong>. Isso apaga todos
os alunos. Não pergunta "tem certeza?". Não tem desfazer. O mesmo vale para
<code>UPDATE alunos SET turma = '2A';</code>: todo aluno da escola vai parar na 2A.</p>
<p>Esse erro já derrubou empresa. A defesa é um hábito, e vale a pena criar agora, enquanto o banco
é de treino:</p>
<ol>
  <li><strong>Escreva o <code>SELECT</code> primeiro.</strong> <code>SELECT * FROM alunos WHERE id = 3;</code>
  Veja que aparece só a linha que você quer.</li>
  <li><strong>Troque o começo.</strong> Apague <code>SELECT *</code> e escreva
  <code>DELETE</code> no lugar, mantendo o <code>FROM</code> e o <code>WHERE</code> iguais.</li>
  <li><strong>Confira com outro <code>SELECT</code>.</strong> A linha sumiu? Só ela?</li>
</ol>
<p>Regra: <code>UPDATE</code> ou <code>DELETE</code> sem <code>WHERE</code> é sempre suspeito.
Se for de propósito, escreva um comentário em cima dizendo por quê.</p>

<h2>Quando o id vale ouro</h2>
<p>Repare que os exemplos usam <code>WHERE id = 3</code>, e não <code>WHERE nome = 'Carla Mendes'</code>.
Nome pode repetir; id não. Para mexer em <strong>uma</strong> linha, aponte pelo id. Para mexer em
um <strong>grupo</strong> (toda a turma 1A), aí sim use outra coluna, e confira com
<code>SELECT</code> antes.</p>

<h2>Glossário desta aula</h2>
<ul>
  <li><strong>UPDATE ... SET:</strong> muda o valor de colunas nas linhas que passarem pelo <code>WHERE</code>.</li>
  <li><strong>DELETE FROM:</strong> apaga as linhas que passarem pelo <code>WHERE</code>.</li>
  <li><strong>Comentário:</strong> linha que começa com <code>--</code>; o banco ignora, quem lê entende.</li>
</ul>

<h2>Resumo</h2>
<p><code>UPDATE tabela SET coluna = valor WHERE ...</code> muda. <code>DELETE FROM tabela WHERE ...</code>
apaga. Sem <code>WHERE</code>, vale para tudo e não tem volta. Hábito: <code>SELECT</code> antes,
troca o começo, <code>SELECT</code> depois. Uma linha se aponta pelo id.</p>
`,
    desafio: {
      titulo: 'Manutenção da biblioteca',
      enunciado: `<p>No banco da biblioteca, faça as cinco alterações abaixo. Para <strong>cada uma</strong>, o
<code>.sql</code> precisa mostrar as três etapas: o <code>SELECT</code> de conferência antes, o
comando, e o <code>SELECT</code> de conferência depois.</p>
<ol>
  <li>Um livro está com o ano errado. Corrija pelo id</li>
  <li>Um aluno trocou de telefone. Corrija pelo id</li>
  <li>Toda a turma 1A passou para a 2A</li>
  <li>Um aluno saiu da escola. Apague pelo id</li>
  <li>Dois livros foram doados para outra escola. Apague os dois em um comando só (dica:
  <code>OR</code> ou <code>IN</code>)</li>
</ol>
<p>Por fim, responda em duas linhas, como comentário no fim do arquivo: o que aconteceria se você
rodasse a alteração 3 sem o <code>WHERE</code>?</p>
<p>Envie o <code>.sql</code> e um print do <code>SELECT *</code> final das duas tabelas.</p>`,
    },
  },
  {
    slug: 'duas-tabelas-que-se-conhecem',
    titulo: 'Duas tabelas que se conhecem: chave estrangeira e JOIN',
    min: 3,
    descricao: 'Por que o empréstimo aponta para o aluno e para o livro pelo id, e como juntar as tabelas em uma consulta só. A ponte para o curso avançado.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Ligar duas tabelas guardando o <code>id</code> de uma dentro da outra</li>
  <li>Juntar as duas em uma consulta com <code>JOIN</code></li>
  <li>Saber o que vem depois deste curso</li>
</ul>

<h2>O problema: quem está com o livro?</h2>
<p>A biblioteca precisa registrar empréstimos: qual aluno pegou qual livro, em que dia. A primeira
ideia é colocar tudo em uma tabela:</p>
<pre><code>emprestimos (jeito errado)
+----+----------------+------------------+--------------+------------+
| id | aluno          | telefone         | livro        | data       |
+----+----------------+------------------+--------------+------------+
| 1  | Ana Souza      | 33 99999-0000    | Dom Casmurro | 2026-03-10 |
| 2  | Ana Souza      | 33 99999-0000    | Iracema      | 2026-03-17 |
+----+----------------+------------------+--------------+------------+</code></pre>
<p>É a planilha de novo, com o mesmo problema da aula 1: o telefone da Ana repetido em cada
empréstimo. Se ela trocar de número, tem que mudar em todas as linhas. Se alguém digitar "Ana
Sousa" com S, vira outra pessoa.</p>

<h2>A solução: guardar o id, não a informação</h2>
<p>Você já tem uma tabela de alunos e uma de livros, cada uma com <code>id</code>. O empréstimo
não precisa repetir nome e telefone: precisa só <strong>apontar</strong> para o aluno e para o
livro, pelo id.</p>
<pre><code>CREATE TABLE emprestimos (
  id INTEGER PRIMARY KEY,
  aluno_id INTEGER NOT NULL,
  livro_id INTEGER NOT NULL,
  data_emprestimo TEXT NOT NULL,
  data_devolucao TEXT
);

INSERT INTO emprestimos (aluno_id, livro_id, data_emprestimo) VALUES (1, 1, '2026-03-10');
INSERT INTO emprestimos (aluno_id, livro_id, data_emprestimo) VALUES (1, 5, '2026-03-17');
INSERT INTO emprestimos (aluno_id, livro_id, data_emprestimo) VALUES (2, 3, '2026-03-18');</code></pre>
<p>A coluna <code>aluno_id</code> guarda o <code>id</code> de uma linha da tabela
<code>alunos</code>. Chama-se <strong>chave estrangeira</strong>: uma chave que veio de outra
tabela. O nome segue um padrão: <em>tabela no singular</em> mais <code>_id</code>.</p>
<p>Agora o telefone da Ana está em um lugar só. Ela troca de número, você muda uma linha, e todos
os empréstimos dela continuam certos, porque apontam para o id 1, não para o telefone.</p>
<p>Repare que <code>data_devolucao</code> pode ficar vazia (não tem <code>NOT NULL</code>). Vazio
quer dizer "ainda não devolveu". É uma informação, e o banco tem um nome para ela:
<code>NULL</code>.</p>

<h2>Juntar de volta: JOIN</h2>
<p>Se você fizer <code>SELECT * FROM emprestimos</code>, vai ver números: <code>1, 1, 2026-03-10</code>.
Para a bibliotecária isso não serve. Ela quer o nome do aluno e o título do livro. O
<code>JOIN</code> junta as tabelas na hora da consulta, seguindo os ids:</p>
<pre><code>SELECT alunos.nome, livros.titulo, emprestimos.data_emprestimo
FROM emprestimos
JOIN alunos ON alunos.id = emprestimos.aluno_id
JOIN livros ON livros.id = emprestimos.livro_id;</code></pre>
<p>Leia: <em>da tabela emprestimos, junte alunos onde o id do aluno bate com o aluno_id, junte
livros onde o id do livro bate com o livro_id, e me mostre nome, título e data</em>. O resultado é
a tabela "errada" da primeira seção, montada na hora, mas sem repetir nada no armazenamento.</p>
<p>Como agora aparecem várias tabelas, o nome da coluna vem com o nome da tabela na frente:
<code>alunos.nome</code>. É como sobrenome: evita confundir o <code>id</code> de uma tabela com
o <code>id</code> da outra.</p>

<h2>Perguntas que só o JOIN responde</h2>
<pre><code>-- quem ainda não devolveu?
SELECT alunos.nome, livros.titulo
FROM emprestimos
JOIN alunos ON alunos.id = emprestimos.aluno_id
JOIN livros ON livros.id = emprestimos.livro_id
WHERE emprestimos.data_devolucao IS NULL;

-- quantos livros cada aluno já pegou?
SELECT alunos.nome, COUNT(*) AS quantidade
FROM emprestimos
JOIN alunos ON alunos.id = emprestimos.aluno_id
GROUP BY alunos.nome;</code></pre>
<p>Duas novidades pequenas: vazio se testa com <code>IS NULL</code> (não com <code>= NULL</code>),
e <code>GROUP BY</code> faz o <code>COUNT</code> contar por grupo, um número por aluno em vez de
um número total. <code>AS quantidade</code> só dá nome à coluna do resultado.</p>

<h2>O que vem depois</h2>
<p>Você agora sabe o que é uma tabela, cria, coloca, consulta, altera, apaga e liga duas tabelas.
Isso é o começo de qualquer sistema: cadastro de cliente, controle de estoque, aplicativo.</p>
<p>O curso <strong>Banco de Dados: do Modelo ao SQL</strong>, na trilha Programação, continua
daqui: modelagem de sistemas maiores, as regras de separar tabelas (normalização), o relacionamento
de muitos para muitos, transações, índices e backup. Ele começa em ritmo mais rápido e supõe que
você já fez o que fez aqui.</p>

<h2>Glossário desta aula</h2>
<ul>
  <li><strong>Chave estrangeira:</strong> coluna que guarda o <code>id</code> de uma linha de outra tabela (<code>aluno_id</code>).</li>
  <li><strong>JOIN ... ON:</strong> junta duas tabelas na consulta, casando os ids.</li>
  <li><strong>NULL:</strong> valor vazio; testa-se com <code>IS NULL</code>.</li>
  <li><strong>GROUP BY:</strong> faz a contagem por grupo em vez de no total.</li>
</ul>

<h2>Resumo</h2>
<p>Não repita informação: guarde o id da outra tabela (<code>aluno_id</code>). Para ver os nomes
de volta, <code>JOIN tabela ON tabela.id = outra.tabela_id</code>. Vazio é <code>NULL</code>.
Contar por grupo é <code>GROUP BY</code>. Próximo passo: Banco de Dados, do Modelo ao SQL.</p>
`,
    desafio: {
      titulo: 'Os empréstimos da biblioteca',
      enunciado: `<p>Complete o banco da biblioteca com a tabela <code>emprestimos</code>.</p>
<ol>
  <li><code>CREATE TABLE emprestimos</code> com <code>aluno_id</code>, <code>livro_id</code>, data
  do empréstimo e data de devolução (que pode ficar vazia)</li>
  <li><strong>Oito empréstimos</strong>, de pelo menos quatro alunos diferentes; três deles ainda
  sem devolução</li>
  <li>Consulta com <code>JOIN</code> mostrando nome do aluno, título do livro e data, de todos os
  empréstimos</li>
  <li>Consulta dos livros que <strong>ainda não voltaram</strong>, com o nome de quem está com eles</li>
  <li>Consulta de <strong>quantos livros cada aluno</strong> já pegou</li>
</ol>
<p>Envie o <code>.sql</code> completo (as três tabelas, os dados e as consultas) e um print do
resultado da consulta 4.</p>`,
    },
  },
]

// Mini desafio de fechamento (pedido do André, 2026-09-21): um sistema escolar
// pequeno, preso à última aula como segundo desafio dela. Fica entre o desafio
// da aula 6 e o projeto final: menor que o projeto (não vale certificado) e
// obriga o aluno a sair da biblioteca, o fio condutor das seis aulas, para
// montar do zero um assunto novo com as mesmas peças. Idempotente por título.
const MINI_DESAFIO = {
  aulaSlug: 'duas-tabelas-que-se-conhecem',
  titulo: 'Mini desafio: um sistema escolar',
  enunciado: `
<p>Durante o curso você montou a biblioteca. Agora monte, sozinho e do zero, um
<strong>sistema escolar</strong> pequeno: turmas, alunos e notas. É um mini desafio: cabe em uma
hora e usa só o que as seis aulas ensinaram.</p>

<h3>As três tabelas</h3>
<ul>
  <li><code>turmas</code>: <code>id</code>, nome da turma (<code>UNIQUE</code>, ex.: "1º A") e ano
  (<code>INTEGER</code>)</li>
  <li><code>alunos</code>: <code>id</code>, nome (<code>NOT NULL</code>), data de nascimento no
  formato ano-mês-dia e <code>turma_id</code> apontando para <code>turmas</code></li>
  <li><code>notas</code>: <code>id</code>, <code>aluno_id</code> apontando para <code>alunos</code>,
  disciplina (<code>TEXT</code>), bimestre (<code>INTEGER</code>) e nota (<code>REAL</code>)</li>
</ul>
<p>Antes de digitar, desenhe as três tabelas no papel, como na aula 2. Confira: cada tabela guarda
um tipo de coisa só, e o nome do aluno aparece <strong>uma vez</strong>, na tabela
<code>alunos</code>, nunca repetido em <code>notas</code>.</p>

<h3>Os dados</h3>
<ul>
  <li>Duas turmas</li>
  <li>Seis alunos, três em cada turma (pode inventar os nomes)</li>
  <li>Doze notas, no mínimo: duas disciplinas, dois bimestres, e pelo menos um aluno sem nota
  em uma delas</li>
</ul>

<h3>As perguntas</h3>
<p>Escreva a pergunta em português como comentário (<code>-- ...</code>) em cima de cada consulta.</p>
<ol>
  <li>Nome dos alunos de uma turma, em ordem alfabética (<code>JOIN</code> + <code>ORDER BY</code>)</li>
  <li>Quantos alunos tem cada turma (<code>JOIN</code> + <code>GROUP BY</code>)</li>
  <li>Todas as notas de um aluno, com o nome dele e a disciplina, do maior para o menor</li>
  <li>Média de cada aluno em uma disciplina (<code>AVG</code> funciona igual ao <code>COUNT</code>:
  <code>AVG(nota)</code>)</li>
  <li>Alunos com alguma nota abaixo de 6 (<code>WHERE nota &lt; 6</code>)</li>
</ol>

<h3>Uma mudança com cuidado</h3>
<p>Um aluno mudou de turma. Faça o <code>UPDATE</code> em <code>alunos</code> com <code>WHERE</code>
pelo <code>id</code>, e mostre o <code>SELECT</code> de conferência antes e depois, como na aula 5.
Repare que nenhuma nota precisou mudar: a nota aponta para o aluno, e o aluno é quem aponta para
a turma.</p>

<h3>O que enviar</h3>
<ul>
  <li>Um arquivo <code>.sql</code> que recria tudo quando colado no sqliteonline.com: as três
  tabelas, os dados, as cinco consultas e o <code>UPDATE</code> com as conferências</li>
  <li>Um print do resultado da consulta 4</li>
</ul>
<p>Tudo certo? Você acabou de montar o esqueleto de um sistema escolar de verdade. É por aí que o
projeto final começa.</p>
`,
}

const PROJETO_FINAL = {
  titulo: 'Projeto final: o banco de dados de algo seu',
  enunciado: `
<p>O projeto de fechamento é um banco de dados de <strong>uma coisa real</strong>: da sua casa, da
escola, de um trabalho de alguém da família, de um hobby. Não é exercício de livro: é algo que,
se existisse, alguém usaria.</p>
<p>Ideias: estoque da cantina; controle de quem pagou a excursão; os jogos de um campeonato entre
turmas; as vendas de brigadeiro da sua irmã; a coleção de algo que você guarda; as tarefas da casa
e quem fez cada uma.</p>

<h3>O que entregar</h3>
<ul>
  <li><strong>Um arquivo <code>.sql</code></strong> que recria tudo do zero quando colado no
  sqliteonline.com: tabelas, dados e consultas</li>
  <li><strong>Pelo menos duas tabelas ligadas</strong> por chave estrangeira (<code>algo_id</code>)</li>
  <li><strong>Cada tabela com <code>id</code></strong>, tipos certos e pelo menos uma regra
  (<code>NOT NULL</code> ou <code>UNIQUE</code>)</li>
  <li><strong>Pelo menos dez linhas</strong> no total, com dados que façam sentido</li>
  <li><strong>Cinco consultas</strong>, cada uma com a pergunta em português como comentário:
  uma com <code>WHERE</code>, uma com <code>ORDER BY</code> e <code>LIMIT</code>, uma com
  <code>COUNT</code>, uma com <code>JOIN</code> e uma à sua escolha</li>
  <li><strong>Um <code>UPDATE</code> e um <code>DELETE</code></strong> com o <code>SELECT</code> de
  conferência antes e depois</li>
  <li><strong>Um PDF de uma página</strong> com o desenho das tabelas (papel ou draw.io) e um
  parágrafo dizendo quem usaria isso e para quê</li>
</ul>

<h3>Como será avaliado</h3>
<table>
  <tr><th>Critério</th><th>O que se espera</th></tr>
  <tr><td>Resolve algo real</td><td>Dá para explicar em uma frase quem usa e para quê</td></tr>
  <tr><td>Recria do zero</td><td>Colar o <code>.sql</code> em um sqliteonline.com limpo funciona sem erro</td></tr>
  <tr><td>Tabelas bem feitas</td><td>Uma coisa por tabela, <code>id</code> em todas, tipos e regras certos, nada repetido que devia ser id</td></tr>
  <tr><td>Consultas respondem</td><td>Cada consulta responde à pergunta escrita em cima dela</td></tr>
  <tr><td>Cuidado</td><td><code>UPDATE</code> e <code>DELETE</code> com <code>WHERE</code> e conferência antes e depois</td></tr>
  <tr><td>Legibilidade</td><td>Nomes minúsculos sem acento, um comando por bloco, comentários onde ajuda</td></tr>
</table>

<h3>Como enviar</h3>
<p>Um único <code>.zip</code> com o <code>.sql</code> e o PDF, ou os dois arquivos separados.</p>
`,
  instrucoes: 'Envie o .sql que recria o banco do zero e o PDF com o desenho das tabelas (juntos em um .zip ou separados).',
  formatos: '.zip, .sql, .pdf, .png',
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
  const [modulo] = await c.query('SELECT id, carga_min FROM modulos WHERE slug = ?', [MODULO_SLUG])
  if (!modulo) throw new Error(`módulo ${MODULO_SLUG} não existe: rode criar-modulo-programacao-iniciante.mjs antes`)
  const [trilha] = await c.query('SELECT id FROM trilhas WHERE slug = ?', [TRILHA_SLUG])
  if (!trilha) throw new Error(`trilha ${TRILHA_SLUG} não existe: rode criar-trilha-programacao-iniciante.mjs antes`)

  const [cursoExistente] = await c.query('SELECT id FROM cursos WHERE slug = ?', [CURSO.slug])
  let cursoId = cursoExistente?.id

  if (!cursoId) {
    acao(`abrir espaço na trilha e no módulo: quem está na posição ${CURSO.ordemNaTrilha} ou depois anda uma casa`)
    if (APLICAR) {
      await c.query('UPDATE cursos SET ordem_na_trilha = ordem_na_trilha + 1 WHERE trilha_id = ? AND ordem_na_trilha >= ?',
        [trilha.id, CURSO.ordemNaTrilha])
      await c.query('UPDATE cursos SET ordem_no_modulo = ordem_no_modulo + 1 WHERE modulo_id = ? AND ordem_no_modulo >= ?',
        [modulo.id, CURSO.ordemNoModulo])
    }
    acao(`criar curso "${CURSO.titulo}" (Fácil, ${CURSO.cargaMin} min), curso ${CURSO.ordemNaTrilha} da trilha e do módulo, publicado=${PUB}`)
    if (APLICAR) {
      await c.query(
        `INSERT INTO cursos (id, titulo, slug, descricao, categoria, nivel, autor_nome, publicado,
                             ordem, carga_horaria, carga_min, modulo_id, ordem_no_modulo, trilha_id, ordem_na_trilha,
                             created_at, updated_at, criado_em, atualizado_em)
         VALUES (UUID(), ?, ?, ?, ?, 'Fácil', 'André Gomes', ?, 20, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW(), NOW())`,
        [CURSO.titulo, CURSO.slug, CURSO.descricao, CURSO.categoria, PUB, CURSO.carga, CURSO.cargaMin,
          modulo.id, CURSO.ordemNoModulo, trilha.id, CURSO.ordemNaTrilha]
      )
      cursoId = (await c.query('SELECT id FROM cursos WHERE slug = ?', [CURSO.slug]))[0].id
    }
  } else {
    acao(`curso já existe, atualizando${PUBLICAR ? ' e publicando' : ''}`)
    if (APLICAR) {
      await c.query(
        `UPDATE cursos SET titulo=?, descricao=?, carga_horaria=?, carga_min=?, modulo_id=?, trilha_id=?, publicado=IF(?, 1, publicado), atualizado_em=NOW() WHERE id=?`,
        [CURSO.titulo, CURSO.descricao, CURSO.carga, CURSO.cargaMin, modulo.id, trilha.id, PUB, cursoId])
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

    // Por título: a última aula tem dois desafios (o dela e o mini desafio).
    const [desafioJa] = await c.query('SELECT id FROM curso_desafios WHERE aula_id = ? AND titulo = ?', [aulaId.id, aula.desafio.titulo])
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

  // Mini desafio: segundo desafio da última aula, ordem 7 (depois dos seis da
  // aula), tipo 'pratico', não vale certificado. desafiosDaAula() lista todos os
  // desafios da aula em ordem, então aparece logo abaixo do desafio da aula 6.
  acao(`mini desafio na aula ${AULAS.length}: ${MINI_DESAFIO.titulo}`)
  if (APLICAR) {
    const [aulaMini] = await c.query('SELECT id FROM aulas WHERE slug = ? AND curso_id = ?', [MINI_DESAFIO.aulaSlug, cursoId])
    if (!aulaMini) throw new Error(`aula ${MINI_DESAFIO.aulaSlug} não existe`)
    const [miniJa] = await c.query('SELECT id FROM curso_desafios WHERE aula_id = ? AND titulo = ?', [aulaMini.id, MINI_DESAFIO.titulo])
    if (miniJa) {
      await c.query('UPDATE curso_desafios SET enunciado=?, ordem=?, formatos_aceitos=? WHERE id=?',
        [MINI_DESAFIO.enunciado.trim(), AULAS.length + 1, FORMATOS, miniJa.id])
    } else {
      await c.query(
        `INSERT INTO curso_desafios (id, curso_id, aula_id, titulo, enunciado, tipo, ordem, vale_certificado, formatos_aceitos, created_at)
         VALUES (UUID(), ?, ?, ?, ?, 'pratico', ?, 0, ?, NOW())`,
        [cursoId, aulaMini.id, MINI_DESAFIO.titulo, MINI_DESAFIO.enunciado.trim(), AULAS.length + 1, FORMATOS]
      )
    }
  }

  // Projeto final do curso: tipo 'final', ordem 99, vale_certificado = 1, sem aula.
  // É o que desafioFinalDoCurso() procura para mostrar a seção "Certificado do curso".
  acao(`projeto final do curso: ${PROJETO_FINAL.titulo}`)
  if (APLICAR) {
    const [ja] = await c.query('SELECT id FROM curso_desafios WHERE curso_id = ? AND aula_id IS NULL AND modulo_id IS NULL', [cursoId])
    if (ja) {
      await c.query('UPDATE curso_desafios SET titulo=?, enunciado=?, tipo=\'final\', ordem=99, vale_certificado=1, instrucoes_envio=?, formatos_aceitos=? WHERE id=?',
        [PROJETO_FINAL.titulo, PROJETO_FINAL.enunciado.trim(), PROJETO_FINAL.instrucoes, PROJETO_FINAL.formatos, ja.id])
    } else {
      await c.query(
        `INSERT INTO curso_desafios (id, curso_id, titulo, enunciado, tipo, ordem, vale_certificado, instrucoes_envio, formatos_aceitos, created_at)
         VALUES (UUID(), ?, ?, ?, 'final', 99, 1, ?, ?, NOW())`,
        [cursoId, PROJETO_FINAL.titulo, PROJETO_FINAL.enunciado.trim(), PROJETO_FINAL.instrucoes, PROJETO_FINAL.formatos]
      )
    }
  }

  if (modulo.carga_min !== MODULO_CARGA_MIN) {
    acao(`carga do módulo: ${modulo.carga_min} -> ${MODULO_CARGA_MIN} min (dois cursos + projeto de módulo)`)
    if (APLICAR) await c.query('UPDATE modulos SET carga_min=?, atualizado_em=NOW() WHERE id=?', [MODULO_CARGA_MIN, modulo.id])
  }

  if (!APLICAR) console.log('\n(simulação: passe --aplicar para gravar como rascunho, --publicar para ligar)')
  else console.log(`\ncurso, ${AULAS.length} aulas e ${AULAS.length + 2} desafios no lugar (publicado=${PUB})`)
} finally {
  c.release()
  await pool.end()
}
