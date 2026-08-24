/**
 * Amplia o curso Banco de Dados: do Modelo ao SQL.
 *
 *   node scripts/conteudo-banco.mjs --aplicar
 *
 * O curso já cobria bem o SQL. O que faltava era o PORQUÊ da modelagem —
 * normalização — e o relacionamento que mais confunde, o muitos-para-muitos.
 * A terceira aula nova fecha o ciclo: consultas que respondem pergunta, e como
 * descobrir por que uma delas está lenta.
 */
import { aplicar } from './lib-conteudo.mjs'

const AMPLIACOES = {
  'o-que-e-um-banco-de-dados': `
<h2>Quando a planilha ainda serve</h2>
<p>Banco de dados não é sempre a resposta. A planilha resolve bem quando:</p>
<ul>
  <li>uma pessoa por vez mexe</li>
  <li>são algumas centenas de linhas</li>
  <li>o formato muda toda hora</li>
  <li>quem usa precisa ver e editar direto</li>
</ul>
<p>O banco passa a valer quando aparece pelo menos um destes:</p>
<table>
  <tr><th>Situação</th><th>Por que a planilha falha</th></tr>
  <tr><td>Várias pessoas gravando ao mesmo tempo</td><td>uma sobrescreve a outra</td></tr>
  <tr><td>Dado que se repete em vários lugares</td><td>muda num lugar e esquece nos outros</td></tr>
  <tr><td>Precisa garantir regra</td><td>nada impede digitar nota 15 ou CPF repetido</td></tr>
  <tr><td>Dezenas de milhares de linhas</td><td>fica lenta e trava</td></tr>
  <tr><td>Um sistema precisa consultar</td><td>ler planilha por programa é frágil</td></tr>
</table>

<h2>O que o banco garante e a planilha não</h2>
<p>Quatro propriedades, resumidas numa sigla que você vai reencontrar — ACID:</p>
<ul>
  <li><strong>Atomicidade</strong> — ou a operação inteira acontece, ou nada acontece. Transferência
    que debita e não credita não existe</li>
  <li><strong>Consistência</strong> — as regras valem sempre: nota entre 0 e 10, matrícula única</li>
  <li><strong>Isolamento</strong> — duas pessoas gravando ao mesmo tempo não atrapalham uma à outra</li>
  <li><strong>Durabilidade</strong> — gravou, sobreviveu à queda de energia</li>
</ul>
<p>Nada disso é automático numa planilha. É o que se paga ao aprender SQL — e é por isso que todo
sistema sério usa banco.</p>

<h2>Faça agora</h2>
<p>Pense em três controles feitos em planilha na sua escola — presença, biblioteca, cantina. Para
cada um, responda: quantas pessoas mexem? o dado se repete? existe regra que ninguém garante? As
respostas dizem quais valeriam um banco.</p>
`,

  'modelagem-do-mundo-real-as-tabelas': `
<h2>O erro do campo que guarda vários valores</h2>
<pre><code>-- errado
alunos(id, nome, telefones)
  1, 'Ana', '33 99999-0000, 33 98888-1111'</code></pre>
<p>Parece prático e quebra tudo: não dá para buscar por um telefone, não dá para contar quantos
cada aluno tem, e ordenar é impossível. Toda consulta vira manipulação de texto.</p>
<pre><code>-- certo
alunos(id, nome)
telefones(id, aluno_id, numero, tipo)</code></pre>
<p>A regra: <strong>uma célula, um valor</strong>. Quando a resposta for "vários", é outra tabela.</p>

<h2>Ler a cardinalidade em voz alta</h2>
<p>Descobrir o tipo de relacionamento é fazer a pergunta nos dois sentidos:</p>
<table>
  <tr><th>Pergunta</th><th>Resposta</th><th>Relacionamento</th></tr>
  <tr><td>Um aluno tem quantas turmas? Uma turma tem quantos alunos?</td><td>1 · muitos</td><td>um para muitos</td></tr>
  <tr><td>Um aluno faz quantos cursos? Um curso tem quantos alunos?</td><td>muitos · muitos</td><td>muitos para muitos</td></tr>
  <tr><td>Um aluno tem quantas matrículas? Uma matrícula é de quantos alunos?</td><td>1 · 1</td><td>um para um</td></tr>
</table>
<p>No <strong>um para muitos</strong>, a chave estrangeira vai no lado "muitos": é
<code>alunos.turma_id</code>, não <code>turmas.aluno_id</code>. Pense assim: cada aluno aponta para
a sua turma, porque ele só tem uma.</p>

<h2>Nomear de um jeito só</h2>
<ul>
  <li>Tabela no plural, minúscula: <code>alunos</code>, <code>notas</code></li>
  <li>Chave primária: <code>id</code></li>
  <li>Chave estrangeira: <code>tabela_no_singular_id</code> — <code>aluno_id</code></li>
  <li>Sem acento, sem espaço, sem maiúscula</li>
</ul>
<p>Qualquer padrão serve; o que não serve é misturar. Metade das tabelas em português e metade em
inglês custa uma consulta ao esquema a cada consulta escrita.</p>

<h2>Faça agora</h2>
<p>Modele a biblioteca da escola: livros, exemplares, leitores e empréstimos. Faça as perguntas de
cardinalidade em voz alta para cada par. A que mais confunde é livro e exemplar — a escola tem três
cópias do mesmo livro, e são coisas diferentes.</p>
`,

  'criando-tabelas-tipos-chaves-restricoes': `
<h2>Dinheiro nunca em ponto flutuante</h2>
<pre><code>preco FLOAT      -- 0.1 + 0.2 dá 0.30000000000000004
preco DECIMAL(10,2)  -- exato, sempre</code></pre>
<p>É o mesmo problema que você viu em JavaScript, aqui com consequência contábil: um centavo de erro
por linha, em dez mil linhas, é uma diferença que ninguém consegue explicar. Para dinheiro, use
<code>DECIMAL</code>; para medida científica, <code>FLOAT</code> serve.</p>

<h2>Escolher o tipo certo</h2>
<table>
  <tr><th>Guarda</th><th>Use</th><th>Não use</th></tr>
  <tr><td>Nome, e-mail</td><td><code>VARCHAR(120)</code></td><td><code>TEXT</code> — não indexa bem</td></tr>
  <tr><td>Texto longo</td><td><code>TEXT</code></td><td>—</td></tr>
  <tr><td>Dinheiro</td><td><code>DECIMAL(10,2)</code></td><td><code>FLOAT</code></td></tr>
  <tr><td>Data</td><td><code>DATE</code> / <code>DATETIME</code></td><td><code>VARCHAR</code> — não dá para ordenar nem comparar</td></tr>
  <tr><td>Sim ou não</td><td><code>BOOLEAN</code></td><td><code>VARCHAR(3)</code> com 'sim'/'não'</td></tr>
  <tr><td>CPF, telefone</td><td><code>VARCHAR</code></td><td>número — perde o zero à esquerda</td></tr>
</table>
<p>O último pega muita gente: CPF que começa com zero, guardado como número, perde o zero e vira
inválido. Se não se faz conta com ele, não é número.</p>

<h2>Deixar o banco garantir a regra</h2>
<pre><code>CREATE TABLE alunos (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nome       VARCHAR(120) NOT NULL,
  matricula  VARCHAR(20)  NOT NULL UNIQUE,
  email      VARCHAR(120) UNIQUE,
  nota       DECIMAL(4,2) CHECK (nota &gt;= 0 AND nota &lt;= 10),
  ativo      BOOLEAN NOT NULL DEFAULT TRUE,
  turma_id   INT,
  criado_em  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (turma_id) REFERENCES turmas(id)
);</code></pre>
<p>Cada restrição aí evita um bug que apareceria meses depois. O <code>CHECK</code> impede nota 15
mesmo que o programa tenha um erro; o <code>UNIQUE</code> impede matrícula repetida mesmo com duas
pessoas cadastrando ao mesmo tempo.</p>
<blockquote>Regra que vale a carreira: validação na aplicação é conveniência; no banco é garantia.
Sistemas mudam, o banco fica.</blockquote>

<h2>O que fazer quando o pai é apagado</h2>
<pre><code>FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE RESTRICT   -- barra
FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE    -- leva junto
FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE SET NULL   -- desliga</code></pre>
<p><code>CASCADE</code> é conveniente e perigoso: apagar um aluno leva notas, presenças e histórico
sem aviso. Use em dado que só existe por causa do pai — os itens de um pedido, por exemplo. Para o
resto, <code>RESTRICT</code> obriga a pensar antes.</p>

<h2>Faça agora</h2>
<p>Crie a tabela de alunos acima e tente violar cada restrição: nota 15, matrícula repetida, nome
nulo, turma que não existe. Anote a mensagem de erro de cada tentativa — é ela que vai aparecer no
seu sistema, e o código vai precisar tratá-la.</p>
`,

  'insert-e-select': `
<h2>Sempre nomeie as colunas</h2>
<pre><code>-- quebra no dia em que alguém acrescentar uma coluna
INSERT INTO alunos VALUES (1, 'Ana', '2026001');

-- continua funcionando
INSERT INTO alunos (nome, matricula) VALUES ('Ana', '2026001');</code></pre>
<p>O mesmo vale na leitura: <code>SELECT *</code> serve para explorar no terminal, não para código.
Ele traz colunas que você não usa, quebra quando a ordem muda e esconde de quem lê quais campos
importam.</p>

<h2>NULL não é zero nem vazio</h2>
<pre><code>SELECT * FROM alunos WHERE email = NULL;      -- não devolve nada, nunca
SELECT * FROM alunos WHERE email IS NULL;     -- certo</code></pre>
<p><code>NULL</code> significa "não sei", e comparar com o desconhecido dá desconhecido — nem
verdadeiro nem falso. Por isso existe <code>IS NULL</code> e <code>IS NOT NULL</code>.</p>
<p>A consequência aparece em conta: <code>NULL + 10</code> é <code>NULL</code>. Se uma nota está
nula, a soma da linha inteira some. O conserto é <code>COALESCE(nota, 0)</code>, que troca o nulo por
um valor.</p>

<h2>Inserir vários de uma vez</h2>
<pre><code>INSERT INTO alunos (nome, matricula) VALUES
  ('Ana',   '2026001'),
  ('Bruno', '2026002'),
  ('Carla', '2026003');</code></pre>
<p>Além de mais curto, é bem mais rápido: uma ida ao banco em vez de três. Com mil linhas, a
diferença deixa de ser detalhe.</p>

<h2>Limitar enquanto explora</h2>
<pre><code>SELECT nome, nota FROM alunos LIMIT 10;</code></pre>
<p>Costume que evita susto: numa tabela de dois milhões de linhas, o <code>SELECT</code> sem limite
trava o terminal e ocupa o servidor. Explore com <code>LIMIT</code>, sempre.</p>

<h2>Faça agora</h2>
<p>Insira cinco alunos, deixando o e-mail nulo em dois. Depois rode
<code>SELECT * FROM alunos WHERE email = NULL</code> e
<code>WHERE email IS NULL</code>. A primeira volta vazia — e entender por quê é o ponto da aula.</p>
`,

  'where-order-by-e-agregacao': `
<h2>WHERE ou HAVING</h2>
<pre><code>SELECT turma, AVG(nota) AS media
FROM alunos
WHERE ativo = TRUE          -- filtra LINHAS, antes de agrupar
GROUP BY turma
HAVING AVG(nota) &gt;= 7       -- filtra GRUPOS, depois de agrupar
ORDER BY media DESC;</code></pre>
<p>A ordem em que o banco executa explica tudo: <code>WHERE</code> → <code>GROUP BY</code> →
<code>HAVING</code> → <code>ORDER BY</code>. Por isso não dá para usar <code>AVG()</code> no
<code>WHERE</code>: quando ele roda, os grupos ainda não existem.</p>

<h2>COUNT(*) e COUNT(coluna) são diferentes</h2>
<pre><code>SELECT
  COUNT(*)      AS linhas,        -- todas as linhas
  COUNT(email)  AS com_email,     -- ignora os NULL
  COUNT(DISTINCT turma) AS turmas -- valores distintos
FROM alunos;</code></pre>
<p>A diferença entre as duas primeiras é justamente quantos e-mails estão nulos. É um jeito rápido de
medir a qualidade do cadastro.</p>

<h2>Buscar texto</h2>
<pre><code>WHERE nome LIKE 'Ana%'     -- começa com Ana — usa índice
WHERE nome LIKE '%Silva'   -- termina com — NÃO usa índice
WHERE nome LIKE '%ana%'    -- contém — não usa índice</code></pre>
<p>O <code>%</code> no começo impede o banco de usar o índice, porque ele não sabe por onde começar
a procurar — é como procurar no dicionário uma palavra que <em>termina</em> com "ção". Em tabela
grande, essa consulta varre tudo.</p>

<h2>O erro de agrupar e selecionar o que não agrupou</h2>
<pre><code>-- sem sentido: qual nome, se o grupo tem trinta alunos?
SELECT turma, nome, AVG(nota) FROM alunos GROUP BY turma;</code></pre>
<p>Bancos rigorosos recusam isso; outros devolvem um nome qualquer, sem avisar — o que é pior,
porque parece funcionar. Toda coluna do <code>SELECT</code> ou está no <code>GROUP BY</code>, ou
está dentro de uma função de agregação.</p>

<h2>Faça agora</h2>
<p>Escreva uma consulta que mostre, por turma: quantos alunos, a média, a maior e a menor nota —
considerando só os ativos e mostrando apenas as turmas com mais de cinco alunos. Você vai usar
<code>WHERE</code> e <code>HAVING</code> na mesma consulta, e a diferença entre os dois fica clara.</p>
`,

  'join-dados-em-tabelas-diferentes': `
<h2>O JOIN sem ON</h2>
<pre><code>-- 300 alunos × 12 turmas = 3.600 linhas sem sentido
SELECT * FROM alunos, turmas;</code></pre>
<p>Chama-se produto cartesiano: cada linha de uma tabela combinada com todas as da outra. Quando
uma consulta devolver um número absurdo de linhas, é quase sempre isto — falta a condição de
ligação.</p>

<h2>INNER ou LEFT: a escolha muda o resultado</h2>
<pre><code>-- só alunos QUE TÊM turma
SELECT a.nome, t.nome FROM alunos a
INNER JOIN turmas t ON t.id = a.turma_id;

-- TODOS os alunos; quem não tem turma vem com NULL
SELECT a.nome, t.nome FROM alunos a
LEFT JOIN turmas t ON t.id = a.turma_id;</code></pre>
<p>A pergunta que decide: <em>quero perder as linhas que não têm par?</em> Para listar alunos, quase
nunca — e é por isso que aluno sem turma some de relatórios feitos com <code>INNER JOIN</code>, sem
ninguém perceber.</p>

<h2>Achar o que NÃO tem par</h2>
<pre><code>SELECT a.nome
FROM alunos a
LEFT JOIN matriculas m ON m.aluno_id = a.id
WHERE m.id IS NULL;      -- alunos sem nenhuma matrícula</code></pre>
<p>É um padrão que vale guardar: <code>LEFT JOIN</code> mais <code>IS NULL</code> devolve exatamente
os órfãos. Serve para achar aluno sem turma, produto sem categoria, pedido sem item.</p>

<h2>O filtro que anula o LEFT JOIN</h2>
<pre><code>-- vira INNER JOIN sem você perceber
LEFT JOIN turmas t ON t.id = a.turma_id
WHERE t.ativa = TRUE

-- mantém o comportamento de LEFT
LEFT JOIN turmas t ON t.id = a.turma_id AND t.ativa = TRUE</code></pre>
<p>No primeiro caso, a linha sem par tem <code>t.ativa</code> nulo, e o <code>WHERE</code> a
descarta. Condição sobre a tabela da direita vai no <code>ON</code>, não no <code>WHERE</code>.</p>

<h2>Apelido sempre</h2>
<pre><code>SELECT a.nome AS aluno, t.nome AS turma
FROM alunos a
JOIN turmas t ON t.id = a.turma_id;</code></pre>
<p>Com duas tabelas que têm coluna <code>nome</code>, o apelido deixa claro qual é qual — e o
<code>AS</code> no resultado evita duas colunas chamadas "nome".</p>

<h2>Faça agora</h2>
<p>Rode uma consulta com <code>INNER JOIN</code> e outra com <code>LEFT JOIN</code> na mesma dupla de
tabelas e compare a contagem de linhas. Depois cadastre um aluno sem turma e repita: a diferença
entre os dois números é exatamente esse aluno.</p>
`,

  'update-delete-e-transacoes': `
<h2>O comando que assusta</h2>
<pre><code>UPDATE alunos SET turma_id = 3;     -- TODOS os alunos, sem exceção
DELETE FROM alunos;                 -- a tabela inteira</code></pre>
<p>Esquecer o <code>WHERE</code> não dá erro: o banco faz o que foi mandado. É o acidente mais
clássico da profissão, e ele não tem desfazer.</p>
<p>O hábito que evita: <strong>escreva o <code>SELECT</code> primeiro</strong>.</p>
<pre><code>SELECT * FROM alunos WHERE turma_id = 2;     -- confere: são estes?
UPDATE alunos SET turma_id = 3 WHERE turma_id = 2;</code></pre>
<p>Trocar <code>SELECT *</code> por <code>UPDATE ... SET</code> depois de conferir custa cinco
segundos e evita a tarde inteira restaurando backup.</p>

<h2>Transação: tudo ou nada</h2>
<pre><code>START TRANSACTION;

UPDATE contas SET saldo = saldo - 100 WHERE id = 1;
UPDATE contas SET saldo = saldo + 100 WHERE id = 2;

COMMIT;      -- confirma as duas
-- ROLLBACK; -- desfaz as duas</code></pre>
<p>Sem transação, uma queda de energia entre os dois comandos faz o dinheiro sumir: saiu de uma
conta e não entrou na outra. Com transação, ou as duas acontecem, ou nenhuma.</p>
<p>Use sempre que uma operação envolver mais de uma tabela ou mais de um comando que precisam andar
juntos — matricular aluno e criar as notas, registrar empréstimo e baixar o exemplar.</p>

<h2>A rede de proteção no terminal</h2>
<pre><code>SET autocommit = 0;    -- nada se confirma sozinho
DELETE FROM alunos WHERE turma_id = 2;
SELECT COUNT(*) FROM alunos;    -- confere o estrago
ROLLBACK;              -- desfaz, se estiver errado</code></pre>
<p>Trabalhar assim em banco de produção é o que separa o susto do desastre. Enquanto não houver
<code>COMMIT</code>, dá para voltar.</p>

<h2>Apagar de verdade ou desativar</h2>
<pre><code>DELETE FROM alunos WHERE id = 5;              -- some, com histórico e tudo
UPDATE alunos SET ativo = FALSE WHERE id = 5; -- some das listas, permanece</code></pre>
<p>A segunda é o padrão em sistema escolar, e por um motivo simples: o aluno saiu, mas as notas dele
precisam continuar existindo. É a mesma decisão que você viu no CRUD em PHP.</p>

<h2>Faça agora</h2>
<p>Numa tabela de teste, ligue <code>SET autocommit = 0</code>, apague tudo, confira com
<code>SELECT COUNT(*)</code> que está vazia, e depois <code>ROLLBACK</code>. Confira de novo: os
dados voltaram. Ver isso funcionar dá a confiança para trabalhar em banco de verdade.</p>
`,

  'indices-backup-e-seguranca': `
<h2>Índice é o sumário do livro</h2>
<p>Sem índice, achar uma linha é ler a tabela inteira. Com índice, o banco vai direto — é a diferença
entre folhear um livro de 500 páginas e usar o sumário.</p>
<pre><code>CREATE INDEX idx_alunos_turma ON alunos(turma_id);
CREATE INDEX idx_alunos_nome  ON alunos(nome);</code></pre>
<p>Vale indexar: coluna usada em <code>WHERE</code>, em <code>JOIN</code> e em <code>ORDER BY</code>
frequente. Chave primária e <code>UNIQUE</code> já vêm indexados.</p>

<h2>Índice também custa</h2>
<table>
  <tr><th>Índice ajuda</th><th>Índice atrapalha</th></tr>
  <tr><td>leitura fica muito mais rápida</td><td>toda gravação precisa atualizá-lo</td></tr>
  <tr><td>ordenação sai pronta</td><td>ocupa espaço em disco</td></tr>
</table>
<p>Por isso não se indexa tudo: numa tabela que recebe milhares de inserções por minuto, índice
demais deixa a gravação lenta. E índice em coluna com poucos valores distintos — um campo "ativo"
com só sim e não — quase não ajuda.</p>

<h2>Descobrir se o índice está sendo usado</h2>
<pre><code>EXPLAIN SELECT * FROM alunos WHERE turma_id = 3;</code></pre>
<p>Na coluna <code>type</code> da resposta: <code>ALL</code> significa que o banco leu a tabela
inteira; <code>ref</code> ou <code>const</code> significam que usou índice. Se você criou o índice e
continua aparecendo <code>ALL</code>, algo na consulta impede o uso — um <code>LIKE '%…'</code>, ou
uma função aplicada à coluna.</p>

<h2>Backup que nunca foi restaurado não é backup</h2>
<pre><code>mysqldump -u usuario -p escola &gt; backup.sql        # gerar
mysql -u usuario -p escola_teste &lt; backup.sql      # RESTAURAR num banco de teste</code></pre>
<p>A segunda linha é a que quase ninguém executa — e é a única que prova que a primeira funcionou.
Há muitos casos de empresa que descobriu, no dia do desastre, que o backup estava vazio há meses.</p>
<p>A regra dos três: três cópias, em dois lugares diferentes, sendo uma fora do prédio. E teste de
restauração marcado no calendário.</p>

<h2>Cada sistema com seu usuário</h2>
<pre><code>-- errado: tudo com o root
-- certo:
CREATE USER 'site'@'localhost' IDENTIFIED BY 'senha-forte';
GRANT SELECT, INSERT, UPDATE ON escola.* TO 'site'@'localhost';</code></pre>
<p>Repare no que <strong>não</strong> foi concedido: <code>DELETE</code> e <code>DROP</code>. Se
alguém invadir o site, o estrago fica limitado ao que aquele usuário podia fazer. Chama-se menor
privilégio, e é uma das defesas mais baratas que existem.</p>

<h2>Faça agora</h2>
<p>Numa tabela com alguns milhares de linhas, rode <code>EXPLAIN</code> numa consulta por coluna sem
índice e anote o <code>type</code>. Crie o índice, rode de novo e compare. Depois gere um backup e
restaure num banco de teste — o exercício inteiro é esse último passo.</p>
`,
}

const NOVAS = [
  {
    curso: 'banco-de-dados',
    slug: 'normalizacao-por-que-separar',
    titulo: 'Normalização: por que separar tabelas',
    min: 7, ordem: 3,
    descricao: 'A regra por trás da modelagem — e o que acontece quando ela é ignorada.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Reconhecer os problemas de uma tabela mal modelada</li>
  <li>Aplicar as três primeiras formas normais</li>
  <li>Saber quando é aceitável não normalizar</li>
</ul>

<h2>A tabela que parece prática</h2>
<pre><code>matriculas
+----+-------+------------------+--------------+---------------------+
| id | aluno | telefone_aluno   | curso        | professor_do_curso  |
+----+-------+------------------+--------------+---------------------+
| 1  | Ana   | 33 99999-0000    | HTML e CSS   | André Gomes         |
| 2  | Bruno | 33 98888-1111    | HTML e CSS   | André Gomes         |
| 3  | Ana   | 33 99999-0000    | Python       | André Gomes         |
+----+-------+------------------+--------------+---------------------+</code></pre>
<p>Tudo num lugar só, fácil de consultar. E com três problemas graves:</p>
<table>
  <tr><th>Problema</th><th>Acontece quando</th></tr>
  <tr><td>Atualização</td><td>Ana troca de telefone: você precisa mudar em duas linhas, e vai esquecer uma</td></tr>
  <tr><td>Inserção</td><td>chega um curso novo sem alunos: não dá para cadastrar, porque a linha exige um aluno</td></tr>
  <tr><td>Exclusão</td><td>o Bruno cancela e era o único de um curso: apagar a linha apaga o curso junto</td></tr>
</table>
<p>Esses três têm nome — anomalias — e normalizar é o processo de eliminá-los.</p>

<h2>Primeira forma normal: um valor por célula</h2>
<pre><code>-- fora da 1FN
alunos(id, nome, telefones)
  1, 'Ana', '33 99999-0000, 33 98888-1111'

-- na 1FN
alunos(id, nome)
telefones(id, aluno_id, numero)</code></pre>
<p>Também viola a 1FN a tabela com colunas repetidas — <code>telefone1</code>,
<code>telefone2</code>, <code>telefone3</code>. Quando aparecer o quarto telefone, você vai alterar
a estrutura da tabela; com a tabela separada, é só mais uma linha.</p>

<h2>Segunda forma normal: depender da chave inteira</h2>
<p>Só importa quando a chave primária tem mais de uma coluna:</p>
<pre><code>-- chave: (aluno_id, curso_id)
matriculas(aluno_id, curso_id, nota, nome_do_curso)</code></pre>
<p>A <code>nota</code> depende dos dois — é a nota daquele aluno naquele curso, certo. Mas
<code>nome_do_curso</code> depende <strong>só do curso</strong>, metade da chave. Resultado: o nome
se repete em toda matrícula daquele curso, e mudá-lo exige alterar dezenas de linhas.</p>
<pre><code>-- na 2FN
matriculas(aluno_id, curso_id, nota)
cursos(id, nome)</code></pre>

<h2>Terceira forma normal: sem depender de outro campo comum</h2>
<pre><code>-- fora da 3FN
alunos(id, nome, turma_id, nome_da_turma, sala_da_turma)</code></pre>
<p><code>nome_da_turma</code> não depende do aluno: depende de <code>turma_id</code>, que é um campo
comum. Se a turma mudar de sala, você atualiza em todos os alunos dela.</p>
<pre><code>-- na 3FN
alunos(id, nome, turma_id)
turmas(id, nome, sala)</code></pre>
<p>Resumo das três, na formulação clássica: <em>cada campo depende da chave, da chave inteira, e de
nada além da chave</em>.</p>

<h2>Quando não normalizar</h2>
<p>Normalizar tem custo: mais tabelas significam mais <code>JOIN</code>, e <code>JOIN</code> demais
deixa consulta lenta. Há dois casos em que se guarda repetido de propósito:</p>
<ul>
  <li><strong>Dado histórico.</strong> A nota fiscal guarda o preço da época. Se ela apontasse para
    o produto, o valor de uma venda de 2020 mudaria quando o preço subisse hoje — e isso é
    falsificar registro</li>
  <li><strong>Desempenho medido.</strong> Um total pré-calculado, quando a consulta com
    <code>JOIN</code> comprovadamente não aguenta. Medido, não suposto</li>
</ul>
<p>Fora esses, normalize. É bem mais fácil desnormalizar depois, com o problema à vista, do que
consertar dado duplicado que divergiu ao longo de dois anos.</p>

<h2>Faça agora</h2>
<p>Pegue a tabela do começo desta aula e separe em quatro: alunos, telefones, cursos e matrículas.
Depois responda: para trocar o telefone da Ana, quantas linhas você altera agora?</p>
`,
    desafio: {
      titulo: 'Normalize a planilha da secretaria',
      enunciado: `<p>A secretaria mantém esta planilha para controlar os empréstimos da biblioteca:</p>
<pre><code>emprestimos
| id | aluno  | turma | telefone      | livro              | autor        | editora | data_saida | data_volta |
|  1 | Ana    | 3A    | 33 99999-0000 | Dom Casmurro       | Machado      | Ática   | 01/08      | 15/08      |
|  2 | Ana    | 3A    | 33 99999-0000 | Memórias Póstumas  | Machado      | Ática   | 01/08      |            |
|  3 | Bruno  | 3A    | 33 98888-1111 | Dom Casmurro       | Machado      | Ática   | 16/08      |            |</code></pre>
<ul>
  <li>Aponte as três anomalias (atualização, inserção e exclusão) com um exemplo concreto de cada</li>
  <li>Normalize até a 3FN e desenhe as tabelas com as chaves</li>
  <li>Escreva o <code>CREATE TABLE</code> de cada uma, com tipos e restrições adequados</li>
  <li>Escreva a consulta que lista os empréstimos em aberto com nome do aluno, turma e título</li>
</ul>
<p>Uma decisão de modelagem para você tomar e justificar: a escola tem <strong>três exemplares</strong>
de Dom Casmurro. Livro e exemplar são a mesma coisa no seu modelo? Se não forem, explique o que muda
na tabela de empréstimos.</p>`,
    },
  },
  {
    curso: 'banco-de-dados',
    slug: 'muitos-para-muitos',
    titulo: 'Muitos para muitos: a tabela do meio',
    min: 6, ordem: 8,
    descricao: 'O relacionamento que mais confunde — e o único jeito de resolvê-lo.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Reconhecer um relacionamento muitos para muitos</li>
  <li>Criar a tabela associativa corretamente</li>
  <li>Consultar através dela</li>
</ul>

<h2>O problema</h2>
<p>Um aluno faz vários cursos. Um curso tem vários alunos. Onde fica a chave estrangeira?</p>
<pre><code>-- em alunos? só cabe um curso
alunos(id, nome, curso_id)

-- em cursos? só cabe um aluno
cursos(id, nome, aluno_id)

-- uma lista no campo? volta a violar a 1FN
alunos(id, nome, cursos)  -- '1,3,7'</code></pre>
<p>Nenhuma das três funciona. O muitos para muitos <strong>não cabe em duas tabelas</strong> — ele
precisa de uma terceira.</p>

<h2>A tabela associativa</h2>
<pre><code>CREATE TABLE matriculas (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  aluno_id  INT NOT NULL,
  curso_id  INT NOT NULL,
  matriculado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  nota      DECIMAL(4,2),
  UNIQUE (aluno_id, curso_id),
  FOREIGN KEY (aluno_id) REFERENCES alunos(id),
  FOREIGN KEY (curso_id) REFERENCES cursos(id)
);</code></pre>
<p>Cada linha é uma ligação: este aluno está neste curso. Dois pontos importantes:</p>
<ul>
  <li>O <code>UNIQUE (aluno_id, curso_id)</code> impede matricular a mesma pessoa duas vezes no
    mesmo curso. Sem ele, um duplo clique cria duas matrículas</li>
  <li>A tabela pode ter <strong>dados próprios</strong> — data e nota não pertencem ao aluno nem ao
    curso, e sim à relação entre eles. É onde eles cabem</li>
</ul>

<h2>Consultar através dela</h2>
<pre><code>-- os cursos de um aluno
SELECT c.nome, m.nota
FROM matriculas m
JOIN cursos c ON c.id = m.curso_id
WHERE m.aluno_id = 1;

-- os alunos de um curso
SELECT a.nome, m.nota
FROM matriculas m
JOIN alunos a ON a.id = m.aluno_id
WHERE m.curso_id = 3;

-- quantos alunos por curso
SELECT c.nome, COUNT(m.id) AS total
FROM cursos c
LEFT JOIN matriculas m ON m.curso_id = c.id
GROUP BY c.id, c.nome
ORDER BY total DESC;</code></pre>
<p>Repare no <code>LEFT JOIN</code> da terceira: com <code>INNER</code>, curso sem nenhum aluno
sumiria do relatório — e é justamente esse que a coordenação precisa ver.</p>

<h2>Onde ele aparece</h2>
<table>
  <tr><th>De um lado</th><th>Do outro</th><th>A tabela do meio</th></tr>
  <tr><td>Alunos</td><td>Cursos</td><td>matrículas</td></tr>
  <tr><td>Livros</td><td>Autores</td><td>autoria</td></tr>
  <tr><td>Produtos</td><td>Pedidos</td><td>itens do pedido</td></tr>
  <tr><td>Alunos</td><td>Dias letivos</td><td>presenças</td></tr>
</table>
<p>Repare que a tabela do meio quase sempre tem nome próprio no mundo real — e costuma carregar
informação: quantidade no item do pedido, presente ou faltou na presença.</p>

<h2>O erro de tratar como um para muitos</h2>
<p>O sistema começa com "cada aluno faz um curso" e alguém põe <code>curso_id</code> na tabela de
alunos. Seis meses depois, aparece o aluno que faz dois. As saídas costumam ser:
<code>curso_id_2</code>, ou uma linha duplicada do aluno — as duas ruins.</p>
<p>Por isso vale a pergunta na modelagem, antes: <em>pode vir a ser mais de um?</em> Se puder, já
faça a tabela associativa. Ela custa uma tabela a mais hoje e evita uma migração dolorosa depois.</p>

<h2>Faça agora</h2>
<p>Crie as três tabelas — alunos, cursos e matrículas — e cadastre dois alunos em três cursos, com
sobreposição. Depois tente matricular o mesmo aluno duas vezes no mesmo curso e veja o
<code>UNIQUE</code> barrar.</p>
`,
    desafio: {
      titulo: 'A grade da escola',
      enunciado: `<p>Modele e implemente a relação entre <strong>professores</strong>, <strong>disciplinas</strong> e <strong>turmas</strong>.</p>
<p>As regras são estas: um professor leciona várias disciplinas; uma disciplina é dada por vários professores; e cada combinação de professor, disciplina e turma tem um horário.</p>
<ul>
  <li>Desenhe o modelo e implemente com <code>CREATE TABLE</code></li>
  <li>Impeça que o mesmo professor tenha duas aulas no mesmo horário</li>
  <li>Cadastre dados de três professores, quatro disciplinas e duas turmas</li>
</ul>
<p>Escreva as consultas que respondem:</p>
<ul>
  <li>Que disciplinas o professor X leciona?</li>
  <li>Qual é a grade completa da turma 3A?</li>
  <li>Quantas aulas por semana cada professor tem?</li>
  <li>Que disciplinas estão <strong>sem professor</strong> designado?</li>
</ul>
<p>A última exige atenção ao tipo de JOIN — com o errado, ela devolve vazio e parece que está tudo
certo.</p>`,
    },
  },
  {
    curso: 'banco-de-dados',
    slug: 'consultas-que-respondem',
    titulo: 'Consultas que respondem perguntas',
    min: 7, ordem: 10,
    descricao: 'Subconsulta, view e o que fazer quando a consulta está lenta.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Usar subconsulta para perguntas que dependem de outra resposta</li>
  <li>Guardar consulta complexa numa view</li>
  <li>Descobrir por que uma consulta está lenta</li>
</ul>

<h2>Subconsulta: a resposta que depende de outra</h2>
<p><em>"Quais alunos tiraram acima da média da turma?"</em> — não dá para responder direto, porque a
média precisa ser calculada antes.</p>
<pre><code>SELECT nome, nota
FROM alunos
WHERE nota &gt; (SELECT AVG(nota) FROM alunos);</code></pre>
<p>O banco resolve a de dentro primeiro e usa o resultado na de fora. É a mesma ideia dos parênteses
na matemática.</p>

<h2>As três formas</h2>
<pre><code>-- devolve UM valor
WHERE nota &gt; (SELECT AVG(nota) FROM alunos)

-- devolve uma LISTA
WHERE turma_id IN (SELECT id FROM turmas WHERE turno = 'integral')

-- devolve uma TABELA, usada como se fosse uma
SELECT t.nome, m.media
FROM turmas t
JOIN (SELECT turma_id, AVG(nota) AS media FROM alunos GROUP BY turma_id) m
  ON m.turma_id = t.id;</code></pre>

<h2>EXISTS quando você só quer saber se tem</h2>
<pre><code>-- alunos que têm pelo menos uma matrícula
SELECT nome FROM alunos a
WHERE EXISTS (SELECT 1 FROM matriculas m WHERE m.aluno_id = a.id);</code></pre>
<p>O <code>EXISTS</code> para na primeira linha encontrada — não precisa contar tudo. Aquele
<code>SELECT 1</code> não é engano: como só importa se existe, não se seleciona coluna nenhuma.</p>

<h2>View: dar nome a uma consulta</h2>
<pre><code>CREATE VIEW boletim AS
SELECT a.id, a.nome, t.nome AS turma, AVG(m.nota) AS media
FROM alunos a
JOIN turmas t ON t.id = a.turma_id
LEFT JOIN matriculas m ON m.aluno_id = a.id
GROUP BY a.id, a.nome, t.nome;

-- e depois, como se fosse tabela
SELECT * FROM boletim WHERE media &gt;= 7 ORDER BY media DESC;</code></pre>
<p>A view não guarda dados: ela é a consulta salva, executada a cada uso. Serve para três coisas —
esconder complexidade, padronizar o cálculo (todo mundo usa a mesma definição de média) e limitar
acesso, dando permissão à view sem dar à tabela.</p>

<h2>Quando a consulta está lenta</h2>
<p>Antes de suspeitar do banco, faça na ordem:</p>
<ol>
  <li><strong><code>EXPLAIN</code></strong> na consulta. Se <code>type</code> for <code>ALL</code>,
    ela está lendo a tabela inteira</li>
  <li>Veja a coluna do <code>WHERE</code> e do <code>JOIN</code>: <strong>tem índice?</strong></li>
  <li>Se tem índice e não está sendo usado, procure o que impede</li>
</ol>
<table>
  <tr><th>Isso impede o índice</th><th>Troque por</th></tr>
  <tr><td><code>WHERE YEAR(data) = 2026</code></td><td><code>WHERE data &gt;= '2026-01-01' AND data &lt; '2027-01-01'</code></td></tr>
  <tr><td><code>WHERE nome LIKE '%ana%'</code></td><td>busca de texto completo, ou <code>LIKE 'ana%'</code></td></tr>
  <tr><td><code>WHERE CAST(id AS CHAR) = '5'</code></td><td><code>WHERE id = 5</code></td></tr>
</table>
<p>O padrão é sempre o mesmo: <strong>função aplicada à coluna cega o índice</strong>. O banco tem o
índice de <code>data</code>, não o de <code>YEAR(data)</code>.</p>

<h2>Contar linhas em tabela grande</h2>
<pre><code>SELECT COUNT(*) FROM registros;          -- pode demorar em tabela enorme
SELECT COUNT(*) FROM registros WHERE ativo = TRUE;   -- com índice, rápido</code></pre>
<p>Quando você só precisa saber "tem mais de 100?", não conte tudo:
<code>SELECT 1 FROM registros LIMIT 101</code> e conte o resultado. Parece truque e é a diferença
entre milissegundos e minutos.</p>

<h2>Faça agora</h2>
<p>Escreva a consulta dos alunos acima da média da turma <em>deles</em> — não da média geral. Você
vai precisar de uma subconsulta que se refere à linha de fora. Depois transforme em view e compare
como fica ler as duas.</p>
`,
    desafio: {
      titulo: 'Cinco perguntas da coordenação',
      enunciado: `<p>Com o banco da escola que você modelou, escreva a consulta que responde cada pergunta. Use subconsulta ou JOIN, o que couber melhor, e explique a escolha em comentário.</p>
<ol>
  <li>Quais alunos estão acima da média da <strong>própria turma</strong>?</li>
  <li>Que cursos <strong>nunca</strong> tiveram matrícula?</li>
  <li>Qual turma tem a maior média, e qual é o valor?</li>
  <li>Quais alunos estão matriculados em <strong>todos</strong> os cursos obrigatórios?</li>
  <li>Quantos alunos se matricularam por mês, nos últimos seis meses?</li>
</ol>
<p>Depois crie uma view para a primeira e rode <code>EXPLAIN</code> em duas delas, anotando o
<code>type</code> de cada uma. Se alguma vier <code>ALL</code>, crie o índice que resolve e mostre o
antes e o depois.</p>
<p>A número 4 é a mais difícil — e a dica é pensar por eliminação: quem <em>não</em> tem nenhum
curso obrigatório faltando.</p>`,
    },
  },
]

await aplicar({ AMPLIACOES, NOVAS })
