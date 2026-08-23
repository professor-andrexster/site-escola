/**
 * Amplia o curso PHP — Back-end Web.
 *
 *   node scripts/conteudo-php.mjs --aplicar
 *
 * Quatro aulas novas, porque o curso tinha só seis e faltava o começo: como o
 * servidor responde. Sem esse modelo mental, PHP vira "JavaScript com cifrão" —
 * e o aluno não entende por que `echo` aparece na página e `console.log` não.
 */
import { aplicar } from './lib-conteudo.mjs'

const AMPLIACOES = {
  'fundamentos-php': `
<h2>PHP roda no servidor. JavaScript, no navegador</h2>
<p>Essa é a diferença que explica todo o resto:</p>
<table>
  <tr><th></th><th>PHP</th><th>JavaScript no navegador</th></tr>
  <tr><td>Onde executa</td><td>no servidor, antes de enviar</td><td>na máquina de quem acessa</td></tr>
  <tr><td>O visitante vê o código?</td><td>não — chega só o resultado</td><td>sim, com Ctrl+U</td></tr>
  <tr><td>Acessa banco de dados?</td><td>sim</td><td>não diretamente</td></tr>
  <tr><td>Guarda segredo (senha, chave)?</td><td>sim</td><td>nunca</td></tr>
  <tr><td>Reage a clique?</td><td>não</td><td>sim</td></tr>
</table>
<p>Por isso os dois não competem: PHP monta a página e JavaScript a torna viva depois que ela
chegou. Dê Ctrl+U num site em PHP e você verá HTML puro — o código PHP já terminou o trabalho e
desapareceu.</p>

<h2>Tipos frouxos, e o mesmo cuidado do JavaScript</h2>
<pre><code>"5" == 5      // true  — converte antes de comparar
"5" === 5     // false — compara valor e tipo
0 == "abc"    // false no PHP 8; era true nas versões antigas</code></pre>
<p>Mesma regra do JavaScript, e pelo mesmo motivo: <strong>use sempre <code>===</code></strong>.
Aquele último caso mudou no PHP 8, o que significa que código antigo pode se comportar diferente ao
mudar de versão — mais uma razão para não depender da conversão automática.</p>

<h2>Mostrar erro enquanto se desenvolve</h2>
<pre><code>&lt;?php
// só na sua máquina, nunca no site publicado
ini_set('display_errors', 1);
error_reporting(E_ALL);</code></pre>
<p>Sem isso, o erro de PHP costuma dar uma página em branco — sem mensagem, sem pista. Com isso,
você lê o que aconteceu e em que linha.</p>
<p>No servidor de verdade, o contrário: erro não aparece para o visitante, vai para o log. Mensagem
de erro revela caminho de arquivo e estrutura do banco, que é informação de graça para quem quer
atacar.</p>

<h2>Faça agora</h2>
<p>Crie um arquivo <code>teste.php</code> com <code>&lt;?php echo "Olá"; ?&gt;</code> e abra pelo
servidor. Depois abra o mesmo arquivo com clique duplo, direto do explorador: o navegador mostra o
código em vez de executar. A diferença entre os dois é a aula inteira.</p>
`,

  'formularios-get-post': `
<h2>GET ou POST</h2>
<table>
  <tr><th></th><th>GET</th><th>POST</th></tr>
  <tr><td>Onde vão os dados</td><td>na URL, à vista</td><td>no corpo da requisição</td></tr>
  <tr><td>Dá para compartilhar o link?</td><td>sim</td><td>não</td></tr>
  <tr><td>Fica no histórico?</td><td>sim</td><td>não</td></tr>
  <tr><td>Serve para</td><td>busca, filtro, paginação</td><td>login, cadastro, exclusão</td></tr>
</table>
<p>A regra prática: <strong>GET para ler, POST para mudar</strong>. Uma busca com GET permite mandar
o link do resultado a alguém — o que é bom. Um login com GET põe a senha na barra de endereço, no
histórico e no log do servidor — o que é péssimo.</p>

<h2>Nunca confie no que chegou</h2>
<pre><code>&lt;?php
// quebra se o campo não veio
$nome = $_POST['nome'];

// certo
$nome = trim($_POST['nome'] ?? '');
if ($nome === '') {
    $erros[] = 'O nome é obrigatório.';
}</code></pre>
<p>Aquele <code>??</code> devolve o segundo valor quando o primeiro não existe. É a defesa contra o
aviso de índice indefinido — e contra alguém que enviou o formulário sem passar pela sua página.</p>
<p>Vale insistir: a validação em JavaScript que você escreveu no curso anterior <strong>não protege
nada</strong>. Ela roda na máquina de quem usa e pode ser desligada em uma linha pelo console. A que
protege é esta, aqui no servidor.</p>

<h2>Devolver texto do usuário para a tela</h2>
<pre><code>&lt;?php
// se alguém digitou &lt;script&gt;, ele executa
echo "Olá, " . $_POST['nome'];

// escapado: aparece como texto
echo "Olá, " . htmlspecialchars($_POST['nome'], ENT_QUOTES, 'UTF-8');</code></pre>
<p>É o mesmo XSS da aula de DOM em JavaScript, do outro lado. A regra: <strong>todo dado de usuário
que volta para o HTML passa por <code>htmlspecialchars</code></strong>.</p>

<h2>O formulário que reenvia ao recarregar</h2>
<p>Depois de gravar algo com POST, se a pessoa apertar F5 o navegador pergunta se quer reenviar — e
grava de novo. A solução é redirecionar depois de gravar:</p>
<pre><code>&lt;?php
// ... grava no banco
header('Location: lista.php?ok=1');
exit;</code></pre>
<p>O <code>exit</code> depois do <code>header</code> é obrigatório: sem ele, o PHP continua
executando as linhas seguintes.</p>

<h2>Faça agora</h2>
<p>Monte um formulário de busca com GET e um de cadastro com POST. Preencha os dois e olhe a barra
de endereço: no primeiro os dados aparecem, no segundo não. Depois recarregue a página do cadastro e
veja o aviso de reenvio.</p>
`,

  'cookies-sessoes': `
<h2>A ordem que quebra tudo</h2>
<pre><code>&lt;?php
session_start();   // precisa vir ANTES de qualquer saída
?&gt;
&lt;!DOCTYPE html&gt;</code></pre>
<p>O erro <em>"headers already sent"</em> é o mais comum com sessões. Ele acontece quando algo já
foi enviado ao navegador antes do <code>session_start()</code> — inclusive um espaço em branco antes
do <code>&lt;?php</code>, ou uma linha em branco depois do <code>?&gt;</code> de um arquivo
incluído.</p>
<p>Por isso a recomendação: em arquivo que só tem PHP, <strong>não feche a tag</strong>. Sem
<code>?&gt;</code> no fim, não há como sobrar espaço depois dele.</p>

<h2>Cookie e sessão: onde cada um mora</h2>
<table>
  <tr><th></th><th>Cookie</th><th>Sessão</th></tr>
  <tr><td>Guardado em</td><td>no navegador de quem acessa</td><td>no servidor</td></tr>
  <tr><td>O usuário pode alterar?</td><td>sim, facilmente</td><td>não</td></tr>
  <tr><td>Serve para</td><td>preferência, "lembrar de mim"</td><td>quem está logado, carrinho</td></tr>
  <tr><td>Tamanho</td><td>cerca de 4 KB</td><td>o que o servidor aguentar</td></tr>
</table>
<p>A consequência prática: <strong>nunca guarde em cookie algo que decide permissão</strong>. Um
cookie <code>admin=1</code> é alterável em dez segundos pelo próprio navegador. O que decide fica na
sessão, no servidor.</p>

<h2>Cookie com as proteções</h2>
<pre><code>setcookie('tema', 'escuro', [
    'expires'  =&gt; time() + 60 * 60 * 24 * 30,
    'path'     =&gt; '/',
    'httponly' =&gt; true,    // JavaScript não lê
    'secure'   =&gt; true,    // só por HTTPS
    'samesite' =&gt; 'Lax',   // não viaja para outro site
]);</code></pre>
<p>As três últimas linhas são o que separa um cookie seguro de um vulnerável. O
<code>httponly</code> impede que um XSS roube o cookie de sessão; o <code>samesite</code> barra o
ataque em que outro site faz uma requisição usando a sua sessão.</p>

<h2>Encerrar sessão de verdade</h2>
<pre><code>session_start();
$_SESSION = [];
session_destroy();
header('Location: login.php');
exit;</code></pre>
<p>Só <code>session_destroy()</code> não basta: os dados continuam na variável até o fim do script.
Limpar o array antes garante que nada seja usado por engano nas linhas seguintes.</p>

<h2>Faça agora</h2>
<p>Faça uma página que conta quantas vezes você a visitou, guardando na sessão. Depois feche o
navegador e abra de novo: o contador zera, porque a sessão acabou. Refaça com cookie e compare — o
cookie sobrevive.</p>
`,

  'banco-dados-php': `
<h2>Conectar do jeito certo</h2>
<pre><code>&lt;?php
$pdo = new PDO(
    'mysql:host=localhost;dbname=escola;charset=utf8mb4',
    $usuario,
    $senha,
    [
        PDO::ATTR_ERRMODE            =&gt; PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE =&gt; PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   =&gt; false,
    ]
);</code></pre>
<table>
  <tr><th>Opção</th><th>Por que importa</th></tr>
  <tr><td><code>charset=utf8mb4</code></td><td>sem ela, acento vira símbolo estranho</td></tr>
  <tr><td><code>ERRMODE_EXCEPTION</code></td><td>erro de SQL vira exceção; sem isso, falha em silêncio</td></tr>
  <tr><td><code>FETCH_ASSOC</code></td><td>devolve array por nome de coluna, e não duplicado por índice</td></tr>
  <tr><td><code>EMULATE_PREPARES = false</code></td><td>usa o preparo de verdade do banco, não uma imitação</td></tr>
</table>

<h2>A senha não vai no código</h2>
<pre><code>// errado: vai parar no GitHub junto com o resto
$senha = 'MinhaSenha123';

// certo: fora do código, e o arquivo fora do versionamento
$config = require __DIR__ . '/config.php';</code></pre>
<p>E <code>config.php</code> entra no <code>.gitignore</code>. Senha commitada é permanente: apagar
depois não resolve, porque o histórico do Git guarda.</p>

<h2>Ler os resultados</h2>
<pre><code>$stmt = $pdo-&gt;prepare('SELECT nome, nota FROM alunos WHERE turma = ?');
$stmt-&gt;execute([$turma]);

$todos = $stmt-&gt;fetchAll();   // todos de uma vez
$um    = $stmt-&gt;fetch();      // um por vez, para tabela grande

foreach ($todos as $aluno) {
    echo htmlspecialchars($aluno['nome']) . ': ' . $aluno['nota'] . '&lt;br&gt;';
}</code></pre>
<p>Repare no <code>htmlspecialchars</code> mesmo com dado que veio do banco. Ele foi gravado por
alguém — e se essa pessoa digitou <code>&lt;script&gt;</code>, o ataque estava só esperando ser
exibido.</p>

<h2>Faça agora</h2>
<p>Conecte a um banco e liste uma tabela. Depois desligue o <code>ERRMODE_EXCEPTION</code>, escreva
o nome de uma coluna errada e veja o que acontece: página em branco, sem pista nenhuma. Religue e
repita — agora a mensagem diz exatamente o problema.</p>
`,

  'seguranca-php': `
<h2>Senha nunca se guarda</h2>
<pre><code>// tudo errado
$sql = "INSERT INTO usuarios (email, senha) VALUES (?, ?)";
$stmt-&gt;execute([$email, $senha]);
$stmt-&gt;execute([$email, md5($senha)]);      // md5 quebra em segundos

// certo
$hash = password_hash($senha, PASSWORD_DEFAULT);
$stmt-&gt;execute([$email, $hash]);

// e para conferir depois
if (password_verify($senhaDigitada, $hashGuardado)) { … }</code></pre>
<p>O <code>password_hash</code> gera um resumo do qual não se volta para a senha — e acrescenta um
tempero aleatório, de modo que duas pessoas com a mesma senha têm hashes diferentes. O
<code>PASSWORD_DEFAULT</code> acompanha o algoritmo recomendado a cada versão do PHP, sem você
precisar mudar o código.</p>
<p>MD5 e SHA1 aparecem em tutorial antigo e estão quebrados: existem tabelas prontas que revertem
senhas comuns em segundos.</p>

<h2>Comparar sem vazar informação</h2>
<pre><code>if ($token === $tokenGuardado) { … }            // vaza tempo
if (hash_equals($tokenGuardado, $token)) { … }  // tempo constante</code></pre>
<p>A comparação normal para na primeira letra diferente — e a diferença de microssegundos permite
adivinhar o valor letra por letra. Só importa para segredo comparado muitas vezes, como token, mas
custa nada usar o certo.</p>

<h2>Upload é a porta mais explorada</h2>
<pre><code>// não confie no nome nem no tipo declarado
$tipo = mime_content_type($arquivo['tmp_name']);   // olha os bytes
$permitidos = ['image/jpeg', 'image/png', 'image/webp'];

if (!in_array($tipo, $permitidos, true)) {
    die('Envie uma imagem JPG, PNG ou WEBP.');
}

// nome novo, gerado por você
$extensao = ['image/jpeg' =&gt; 'jpg', 'image/png' =&gt; 'png', 'image/webp' =&gt; 'webp'][$tipo];
$nome = bin2hex(random_bytes(8)) . '.' . $extensao;</code></pre>
<p>Três defesas: conferir o tipo pelos bytes e não pela extensão, gerar o nome no servidor, e gravar
numa pasta que não executa PHP. Um arquivo <code>.php</code> renomeado para <code>.jpg</code>, numa
pasta que executa, entrega o servidor inteiro.</p>

<h2>A lista mínima antes de publicar</h2>
<ul>
  <li>Consulta com <code>prepare</code>, nunca com string concatenada</li>
  <li>Saída para HTML com <code>htmlspecialchars</code></li>
  <li>Senha com <code>password_hash</code></li>
  <li>Erro no log, não na tela</li>
  <li>Senha de banco fora do código e fora do Git</li>
  <li>Upload validado pelos bytes, com nome gerado pelo servidor</li>
</ul>

<h2>Faça agora</h2>
<p>Gere <code>password_hash("123456")</code> duas vezes e compare os resultados: são diferentes, e
mesmo assim <code>password_verify</code> aceita os dois. Entender por que isso funciona é entender o
tempero aleatório.</p>
`,

  'padrao-mvc-basico': `
<h2>O problema que o MVC resolve</h2>
<p>Um arquivo com conexão, consulta, regra de negócio e HTML misturados funciona — até precisar
mudar. Aí você mexe no visual e quebra a consulta; corrige a consulta e quebra o visual.</p>
<table>
  <tr><th>Camada</th><th>Responde por</th><th>Não deve</th></tr>
  <tr><td>Model</td><td>dados e regras</td><td>imprimir HTML</td></tr>
  <tr><td>View</td><td>o que se vê</td><td>consultar o banco</td></tr>
  <tr><td>Controller</td><td>receber o pedido e coordenar</td><td>conter regra complexa</td></tr>
</table>
<p>O teste: se você precisasse trocar todo o HTML por JSON — para virar uma API — quanto do código
mudaria? Num MVC bem separado, só a View.</p>

<h2>Uma pasta por camada</h2>
<pre><code>projeto/
  public/
    index.php          # o único arquivo acessível pela web
  app/
    Controllers/
    Models/
    Views/
  config.php</code></pre>
<p>Só <code>public/</code> fica visível na web; o resto mora acima da raiz do site. Assim ninguém
acessa <code>config.php</code> pelo navegador, mesmo sabendo o caminho.</p>

<h2>Sem incluir arquivo na mão</h2>
<pre><code>spl_autoload_register(function ($classe) {
    $caminho = __DIR__ . '/app/' . str_replace('\\\\', '/', $classe) . '.php';
    if (file_exists($caminho)) {
        require $caminho;
    }
});</code></pre>
<p>Com isso, usar <code>new Models\\Aluno()</code> carrega o arquivo sozinho. É o que evita aquela
lista de trinta <code>require</code> no topo de cada página.</p>

<h2>Faça agora</h2>
<p>Pegue uma página sua que mistura tudo e separe em três arquivos: um que consulta, um que decide e
um que mostra. Depois troque só o arquivo que mostra, por uma versão que devolve JSON. Se você
conseguiu sem tocar nos outros dois, a separação está certa.</p>
`,
}

const NOVAS = [
  {
    curso: 'php-backend-web',
    slug: 'como-o-servidor-responde',
    titulo: 'Como o servidor responde',
    min: 6, ordem: 1,
    descricao: 'O que acontece entre digitar o endereço e a página aparecer.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Entender o caminho de uma requisição até a resposta</li>
  <li>Saber o que roda no servidor e o que roda no navegador</li>
  <li>Reconhecer os códigos de resposta que você vai encontrar</li>
</ul>

<h2>O que acontece quando você aperta Enter</h2>
<ol>
  <li>O navegador descobre o endereço do servidor pelo nome do site</li>
  <li>Manda uma <strong>requisição</strong>: "me dê /alunos.php"</li>
  <li>O servidor vê que é <code>.php</code> e entrega o arquivo ao interpretador</li>
  <li>O PHP executa o código — consulta banco, faz contas, monta o HTML</li>
  <li>O servidor devolve a <strong>resposta</strong>: só o HTML pronto</li>
  <li>O navegador desenha, e aí sim o CSS e o JavaScript entram em ação</li>
</ol>
<p>O passo 4 é a parte que some. Quando a resposta chega, o PHP já terminou e não existe mais — por
isso ele não reage a clique. Para o PHP agir de novo, é preciso uma nova requisição.</p>

<h2>Sem estado: cada requisição começa do zero</h2>
<pre><code>&lt;?php
$contador = 0;
$contador = $contador + 1;
echo $contador;     // sempre 1, por mais que você recarregue</code></pre>
<p>Toda variável morre no fim do script. É por isso que existem sessão e banco de dados: são as
formas de o servidor lembrar alguma coisa entre uma requisição e outra.</p>
<p>Isso muda o jeito de pensar em relação ao JavaScript, onde a variável fica viva enquanto a página
está aberta. Aqui, cada carregamento é uma vida nova.</p>

<h2>Os códigos que você vai ver</h2>
<table>
  <tr><th>Código</th><th>Significa</th><th>Costuma ser</th></tr>
  <tr><td>200</td><td>deu certo</td><td>—</td></tr>
  <tr><td>301 / 302</td><td>mudou de endereço</td><td><code>header('Location: …')</code></td></tr>
  <tr><td>403</td><td>proibido</td><td>permissão de arquivo</td></tr>
  <tr><td>404</td><td>não existe</td><td>caminho errado</td></tr>
  <tr><td>500</td><td>erro no servidor</td><td>erro no seu PHP</td></tr>
</table>
<p>O 500 é o que mais aparece enquanto se aprende, e ele é genérico de propósito — a mensagem de
verdade está no log de erro do servidor. Saber onde fica esse log é metade do trabalho de resolver.</p>

<h2>Ver a requisição por dentro</h2>
<p>F12 → aba Network → recarregue. Clique na primeira linha e você vê a requisição inteira: método,
cabeçalhos, código de resposta e o HTML que chegou.</p>
<p>Repare em uma coisa nessa aba: <strong>não existe PHP em lugar nenhum</strong>. Só HTML, CSS,
JavaScript e imagens. O PHP fez o trabalho e ficou no servidor — que é exatamente por que ele pode
guardar a senha do banco com segurança.</p>

<h2>O servidor local</h2>
<pre><code>php -S localhost:8000</code></pre>
<p>Esse comando, rodado na pasta do projeto, sobe um servidor de teste. É o que faz o arquivo
<code>.php</code> ser <em>executado</em> em vez de exibido como texto — a diferença entre abrir pelo
endereço <code>localhost:8000</code> e abrir com clique duplo.</p>

<h2>Faça agora</h2>
<p>Suba o servidor local, abra uma página PHP e olhe o Ctrl+U. Depois abra o arquivo no editor e
compare os dois: o que sumiu no caminho foi o PHP. Essa comparação lado a lado é a aula inteira.</p>
`,
    desafio: {
      titulo: 'Rastreie uma requisição',
      enunciado: `<p>Suba o servidor local e crie uma página que mostra a data e a hora com PHP.</p>
<ul>
  <li>Abra pelo navegador e anote o código de resposta na aba Network</li>
  <li>Compare o código-fonte (Ctrl+U) com o arquivo no editor: liste o que desapareceu</li>
  <li>Recarregue cinco vezes e observe a hora mudando — cada recarga é uma execução nova</li>
  <li>Provoque um erro de propósito (tire um ponto e vírgula) e anote o código que aparece</li>
  <li>Peça um arquivo que não existe e anote o código</li>
</ul>
<p>Entregue a lista dos códigos que você viu e o que causou cada um.</p>`,
    },
  },
  {
    curso: 'php-backend-web',
    slug: 'php-arrays-e-funcoes',
    titulo: 'Arrays e funções em PHP',
    min: 6, ordem: 3,
    descricao: 'A estrutura que segura todo dado vindo do banco e do formulário.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Usar array com índice e com chave</li>
  <li>Percorrer e transformar listas</li>
  <li>Escrever funções com valor padrão e tipo declarado</li>
</ul>

<h2>Um tipo que faz dois papéis</h2>
<pre><code>&lt;?php
// lista comum
$notas = [7.5, 8.0, 6.5];
echo $notas[0];          // 7.5

// com chave — o que em outras linguagens seria dicionário ou objeto
$aluno = ['nome' =&gt; 'Ana', 'nota' =&gt; 8.5];
echo $aluno['nome'];     // Ana

// lista de registros: como o banco devolve
$turma = [
    ['nome' =&gt; 'Ana',   'nota' =&gt; 8.5],
    ['nome' =&gt; 'Bruno', 'nota' =&gt; 5.0],
];</code></pre>
<p>Em PHP os dois são o mesmo tipo. É por isso que <code>$_POST</code>, <code>$_SESSION</code> e o
resultado de uma consulta são todos arrays — e dominar array é dominar metade do PHP.</p>

<h2>Percorrer</h2>
<pre><code>foreach ($turma as $aluno) {
    echo $aluno['nome'];
}

foreach ($aluno as $campo =&gt; $valor) {
    echo "$campo: $valor";
}</code></pre>

<h2>As funções que evitam laço</h2>
<pre><code>$notas = array_column($turma, 'nota');            // [8.5, 5.0]
$soma  = array_sum($notas);
$media = $soma / count($notas);

$aprovados = array_filter($turma, fn($a) =&gt; $a['nota'] &gt;= 6);
$nomes     = array_map(fn($a) =&gt; $a['nome'], $turma);

usort($turma, fn($a, $b) =&gt; $b['nota'] &lt;=&gt; $a['nota']);   // ordena</code></pre>
<p>Aquele <code>&lt;=&gt;</code> compara e devolve -1, 0 ou 1 — é o que <code>usort</code> espera. O
<code>array_column</code> é dos mais úteis e menos conhecidos: extrai uma coluna inteira de uma lista
de registros.</p>

<h2>O detalhe do array_filter</h2>
<pre><code>$aprovados = array_filter($turma, fn($a) =&gt; $a['nota'] &gt;= 6);
// as chaves originais são MANTIDAS: pode vir [0 =&gt; …, 3 =&gt; …, 7 =&gt; …]

$aprovados = array_values($aprovados);   // renumera de 0 em diante</code></pre>
<p>Sem o <code>array_values</code>, o array filtrado vira objeto quando convertido para JSON — porque
as chaves não são sequenciais. É um bug que só aparece na hora de virar API.</p>

<h2>Funções com tipo declarado</h2>
<pre><code>function media(array $notas, int $casas = 1): float
{
    if (count($notas) === 0) {
        return 0.0;
    }
    return round(array_sum($notas) / count($notas), $casas);
}</code></pre>
<p>Declarar os tipos faz o PHP recusar chamada errada em vez de improvisar uma conversão. O
<code>$casas = 1</code> é o valor padrão — e, como em Python, ele vem depois dos obrigatórios.</p>

<h2>Faça agora</h2>
<p>Monte um array com cinco alunos e calcule a média da turma com <code>array_column</code> e
<code>array_sum</code>, sem escrever nenhum <code>foreach</code>. Depois ordene por nota e mostre o
primeiro colocado.</p>
`,
    desafio: {
      titulo: 'Boletim sem laço',
      enunciado: `<p>Com um array de seis alunos, cada um com nome, turma e três notas:</p>
<ul>
  <li>Calcule a média de cada um e acrescente ao array</li>
  <li>Separe os aprovados (média 6 ou mais) — lembre do <code>array_values</code></li>
  <li>Ordene do maior para o menor</li>
  <li>Mostre o resultado numa tabela HTML, com <code>htmlspecialchars</code> em cada nome</li>
  <li>Some quantos são de cada turma, usando array com chave</li>
</ul>
<p>Use as funções de array em tudo que der; deixe <code>foreach</code> só para montar o HTML.
Entregue também a versão em JSON com <code>json_encode</code> — e confira se os aprovados saíram
como lista, e não como objeto. Se saíram como objeto, faltou o <code>array_values</code>.</p>`,
    },
  },
  {
    curso: 'php-backend-web',
    slug: 'crud-completo',
    titulo: 'CRUD: as quatro operações',
    min: 7, ordem: 6,
    descricao: 'Listar, criar, editar e apagar — o esqueleto de todo sistema.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Montar as quatro operações sobre uma tabela</li>
  <li>Organizar os arquivos de um cadastro</li>
  <li>Proteger a exclusão e evitar o cadastro duplicado</li>
</ul>

<h2>As quatro letras</h2>
<table>
  <tr><th>Letra</th><th>Operação</th><th>SQL</th><th>Método</th></tr>
  <tr><td>C</td><td>criar</td><td><code>INSERT</code></td><td>POST</td></tr>
  <tr><td>R</td><td>ler</td><td><code>SELECT</code></td><td>GET</td></tr>
  <tr><td>U</td><td>atualizar</td><td><code>UPDATE</code></td><td>POST</td></tr>
  <tr><td>D</td><td>apagar</td><td><code>DELETE</code></td><td>POST</td></tr>
</table>
<p>Todo sistema de cadastro que você vai encontrar é isto repetido: alunos, produtos, notas,
empréstimos de biblioteca. Aprender uma vez serve para todas.</p>

<h2>Listar</h2>
<pre><code>&lt;?php
$stmt = $pdo-&gt;query('SELECT id, nome, turma FROM alunos ORDER BY nome');
$alunos = $stmt-&gt;fetchAll();
?&gt;
&lt;table&gt;
  &lt;?php foreach ($alunos as $a): ?&gt;
    &lt;tr&gt;
      &lt;td&gt;&lt;?= htmlspecialchars($a['nome']) ?&gt;&lt;/td&gt;
      &lt;td&gt;&lt;a href="editar.php?id=&lt;?= (int) $a['id'] ?&gt;"&gt;Editar&lt;/a&gt;&lt;/td&gt;
    &lt;/tr&gt;
  &lt;?php endforeach; ?&gt;
&lt;/table&gt;</code></pre>
<p>Duas coisas: <code>&lt;?=</code> é atalho para <code>&lt;?php echo</code>, e aquele
<code>(int)</code> força o id a ser número — defesa simples contra um id manipulado na URL.</p>

<h2>Criar, e o campo que não pode repetir</h2>
<pre><code>$stmt = $pdo-&gt;prepare('INSERT INTO alunos (nome, matricula, turma) VALUES (?, ?, ?)');

try {
    $stmt-&gt;execute([$nome, $matricula, $turma]);
} catch (PDOException $e) {
    if ($e-&gt;errorInfo[1] === 1062) {          // chave duplicada
        $erros[] = 'Já existe aluno com essa matrícula.';
    } else {
        throw $e;
    }
}</code></pre>
<p>Verificar antes com um <code>SELECT</code> não basta: entre a consulta e a inserção, outra pessoa
pode gravar a mesma matrícula. Quem garante de verdade é o índice único no banco — e o código trata
o erro que ele devolve.</p>

<h2>Editar: o formulário que sabe quem é</h2>
<pre><code>$id = (int) ($_GET['id'] ?? 0);
$stmt = $pdo-&gt;prepare('SELECT * FROM alunos WHERE id = ?');
$stmt-&gt;execute([$id]);
$aluno = $stmt-&gt;fetch();

if (!$aluno) {
    http_response_code(404);
    exit('Aluno não encontrado.');
}</code></pre>
<p>O <code>UPDATE</code> depois leva o id junto: <code>UPDATE alunos SET nome = ? WHERE id = ?</code>.
Esquecer o <code>WHERE</code> num <code>UPDATE</code> altera a tabela inteira — e não há como
desfazer.</p>

<h2>Apagar: nunca por link</h2>
<pre><code>&lt;!-- errado: o navegador pode visitar sozinho, ao pré-carregar --&gt;
&lt;a href="apagar.php?id=5"&gt;Apagar&lt;/a&gt;

&lt;!-- certo --&gt;
&lt;form method="post" action="apagar.php"
      onsubmit="return confirm('Apagar este aluno?')"&gt;
  &lt;input type="hidden" name="id" value="5"&gt;
  &lt;button type="submit"&gt;Apagar&lt;/button&gt;
&lt;/form&gt;</code></pre>
<p>É a regra "GET para ler, POST para mudar" com consequência prática. Já houve caso famoso de
sistema em que um robô de indexação seguiu todos os links e apagou o banco inteiro — porque apagar
estava num link.</p>

<h2>Apagar de verdade ou marcar como inativo</h2>
<pre><code>-- some para sempre
DELETE FROM alunos WHERE id = ?

-- some das listas, mas continua lá
UPDATE alunos SET ativo = 0 WHERE id = ?</code></pre>
<p>A segunda forma é a usada em quase todo sistema real. Aluno apagado leva junto notas, presenças e
histórico — e um dia alguém vai precisar deles. Aqui na escola é assim que funciona.</p>

<h2>Faça agora</h2>
<p>Monte o CRUD de uma tabela simples: listar, criar, editar e apagar. Depois teste com o id errado
na URL, com id que não existe, e com um campo vazio no formulário. As três respostas precisam ser
úteis.</p>
`,
    desafio: {
      titulo: 'Um cadastro completo',
      enunciado: `<p>Monte o cadastro de uma tabela à sua escolha — livros da biblioteca, produtos, oficinas — com as quatro operações.</p>
<ul>
  <li>Listagem ordenada, com busca por nome usando GET</li>
  <li>Cadastro com validação no servidor e mensagem por campo</li>
  <li>Edição que carrega os dados atuais no formulário</li>
  <li>Exclusão por POST, com confirmação, marcando como inativo em vez de apagar</li>
  <li>Redirecionamento depois de gravar, para o F5 não reenviar</li>
  <li>Um campo com índice único, e o erro de duplicidade tratado</li>
</ul>
<p>Teste estes casos e entregue o resultado de cada um: id inexistente na URL, id com letra em vez
de número, formulário enviado vazio, cadastro repetido, e F5 depois de gravar.</p>`,
    },
  },
  {
    curso: 'php-backend-web',
    slug: 'login-e-permissao',
    titulo: 'Login e permissão',
    min: 7, ordem: 8,
    descricao: 'Quem é a pessoa, e o que ela pode fazer.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Montar login com senha guardada corretamente</li>
  <li>Proteger páginas que exigem estar logado</li>
  <li>Separar autenticação de autorização</li>
</ul>

<h2>Duas perguntas diferentes</h2>
<table>
  <tr><th>Pergunta</th><th>Nome</th><th>Responde</th></tr>
  <tr><td>Quem é você?</td><td>autenticação</td><td>o login</td></tr>
  <tr><td>O que você pode fazer?</td><td>autorização</td><td>o papel: aluno, professor, direção</td></tr>
</table>
<p>Confundir as duas produz o furo mais comum: o sistema confere se a pessoa está logada e esquece de
conferir se ela pode fazer aquilo. Aluno logado que abre <code>/notas/editar.php?id=7</code> e
consegue editar é exatamente isso.</p>

<h2>O login</h2>
<pre><code>&lt;?php
$stmt = $pdo-&gt;prepare('SELECT id, nome, senha_hash, papel FROM usuarios WHERE email = ?');
$stmt-&gt;execute([$email]);
$usuario = $stmt-&gt;fetch();

if (!$usuario || !password_verify($senha, $usuario['senha_hash'])) {
    $erro = 'E-mail ou senha incorretos.';
} else {
    session_regenerate_id(true);          // troca o id da sessão
    $_SESSION['usuario_id'] = $usuario['id'];
    $_SESSION['papel']      = $usuario['papel'];
    header('Location: painel.php');
    exit;
}</code></pre>
<p>Três decisões nesse trecho:</p>
<ul>
  <li><strong>A mensagem é genérica.</strong> "E-mail não cadastrado" confirma quais e-mails existem
    no sistema — informação útil para quem quer atacar</li>
  <li><strong><code>session_regenerate_id</code></strong> troca o identificador da sessão no login.
    Sem isso, um id obtido antes continua valendo depois — é o ataque de fixação de sessão</li>
  <li><strong>Guarda o id, não o objeto inteiro.</strong> Se o papel mudar, a sessão não fica com o
    valor velho para sempre</li>
</ul>

<h2>Proteger as páginas</h2>
<pre><code>&lt;?php
// auth.php
function exigirLogin(): array
{
    if (empty($_SESSION['usuario_id'])) {
        header('Location: login.php');
        exit;
    }
    return ['id' =&gt; $_SESSION['usuario_id'], 'papel' =&gt; $_SESSION['papel']];
}

function exigirPapel(string ...$papeis): array
{
    $usuario = exigirLogin();
    if (!in_array($usuario['papel'], $papeis, true)) {
        http_response_code(403);
        exit('Você não tem permissão para esta página.');
    }
    return $usuario;
}</code></pre>
<pre><code>&lt;?php
require 'auth.php';
$usuario = exigirPapel('professor', 'direcao');   // primeira linha da página</code></pre>
<p>A verificação vai <strong>no topo, antes de qualquer saída</strong>. Esconder o botão no menu não
protege nada: quem souber o endereço digita direto.</p>

<h2>Conferir o dono, não só o papel</h2>
<pre><code>$stmt = $pdo-&gt;prepare('SELECT * FROM projetos WHERE id = ? AND aluno_id = ?');
$stmt-&gt;execute([$id, $usuario['id']]);</code></pre>
<p>Um aluno logado tem papel de aluno — e isso não o autoriza a editar o projeto de outro aluno. A
consulta que já filtra pelo dono resolve isso de uma vez, sem depender de um <code>if</code> que
alguém pode esquecer.</p>

<h2>Limitar tentativas</h2>
<p>Sem limite, dá para testar milhares de senhas por minuto. O mínimo: contar as tentativas
malsucedidas por e-mail e por endereço de origem, e bloquear por alguns minutos depois de cinco.
Guarde numa tabela — sessão não serve, porque quem ataca não manda cookie.</p>

<h2>Faça agora</h2>
<p>Monte o login e proteja uma página. Depois teste o furo clássico: faça login como aluno e digite
na barra de endereço uma página que só professor deveria abrir. Se ela abrir, falta o
<code>exigirPapel</code> no topo.</p>
`,
    desafio: {
      titulo: 'Login com dois papéis',
      enunciado: `<p>Monte a autenticação de um sistema com dois papéis: aluno e professor.</p>
<ul>
  <li>Cadastro com <code>password_hash</code></li>
  <li>Login com mensagem genérica e <code>session_regenerate_id</code></li>
  <li>Uma página só para professor e uma para qualquer logado</li>
  <li>Sair encerrando a sessão de verdade</li>
  <li>Uma página em que o aluno vê apenas os próprios registros — filtrando na consulta</li>
</ul>
<p>Entregue com estes testes feitos e descritos:</p>
<ul>
  <li>Acessar a página de professor sem estar logado</li>
  <li>Acessar a página de professor logado como aluno</li>
  <li>Logado como aluno A, tentar abrir um registro do aluno B pelo id na URL</li>
</ul>
<p>Os três precisam ser barrados. O terceiro é o que mais escapa — e é o mais explorado.</p>`,
    },
  },
]

await aplicar({ AMPLIACOES, NOVAS })
