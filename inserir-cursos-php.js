#!/usr/bin/env node

/**
 * Script para inserir curso de PHP (Back-end Web)
 * Uso: node inserir-cursos-php.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yxtjkorchxcjkfnbekrs.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4dGprb3JjaHhjamtmbmJla3JzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTcxMzE2NywiZXhwIjoyMDk1Mjg5MTY3fQ.yAig0AWNO39bAMmlYNlRkWBp3iUAl5buvXQa7hWMgN0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ========================================
// DADOS DO CURSO PHP
// ========================================

const cursoPHP = {
  titulo: 'PHP — Back-end Web',
  slug: 'php-backend-web',
  descricao: 'Aprenda PHP 8.5 para criar servidores web dinâmicos. Manipule formulários, gerencie sessões, conecte-se a banco de dados e implemente segurança. Do fundamento ao MVC básico.',
  categoria: 'Web Development',
  autor_nome: 'Professor André Gomes',
  nivel: 'Intermediário',
  publicado: false,
  ordem: 4,
};

const aulasPHP = [
  {
    titulo: 'Fundamentos de PHP',
    slug: 'fundamentos-php',
    descricao: 'Entender sintaxe básica, variáveis, tipos e operadores',
    conteudo: `<h2 style="color: #0066cc;">Objetivo de Aprendizagem</h2>
<p>Ao fim desta aula você será capaz de:</p>
<ul>
  <li>Escrever scripts PHP básicos</li>
  <li>Declarar variáveis e usar tipos</li>
  <li>Trabalhar com operadores e estruturas de controle</li>
</ul>

<h2 style="color: #0066cc;">O que é PHP?</h2>
<p>PHP é uma linguagem de <strong>back-end</strong> executada no servidor. Diferente de JavaScript que roda no navegador, PHP processa requisições, acessa banco de dados e gera HTML dinamicamente.</p>

<p><strong>Versão Atual:</strong> PHP 8.5 (recomendado para novos projetos). PHP 8.2 LTS é estável.</p>

<h2 style="color: #0066cc;">Seu Primeiro Script PHP</h2>
<pre><code>&lt;?php
  echo "Olá, PHP!";
?&gt;</code></pre>

<p>Todo código PHP está entre <strong>&lt;?php</strong> e <strong>?&gt;</strong>. Salve como <strong>index.php</strong> e acesse via servidor local.</p>

<h2 style="color: #0066cc;">Variáveis e Tipos</h2>
<pre><code>&lt;?php
  // String
  $nome = "João";
  $mensagem = 'Olá, mundo';

  // Integer
  $idade = 17;
  $numero = -42;

  // Float
  $preco = 19.99;
  $altura = 1.75;

  // Boolean
  $ativo = true;
  $deletado = false;

  // Array
  $frutas = ["maçã", "banana", "laranja"];
  $dados = ["nome" => "Maria", "idade" => 16];

  // Null
  $vazio = null;

  echo $nome;
  var_dump($idade);  // Debug: mostra tipo e valor
?&gt;</code></pre>

<h2 style="color: #0066cc;">Operadores e Expressões</h2>
<pre><code>&lt;?php
  // Aritmética
  $soma = 10 + 5;      // 15
  $produto = 10 * 5;   // 50
  $resto = 10 % 3;     // 1

  // Comparação
  5 == "5";    // true (igualdade)
  5 === "5";   // false (identidade, verifica tipo)
  5 != 3;      // true
  5 !== "5";   // true

  // Lógica
  true && false;  // false (E)
  true || false;  // true (OU)
  !true;          // false (NÃO)

  // Concatenação de strings
  $saudacao = "Olá, " . $nome . "!";
?&gt;</code></pre>

<h2 style="color: #0066cc;">Estruturas de Controle</h2>
<pre><code>&lt;?php
  $idade = 17;

  // if/else/elseif
  if ($idade >= 18) {
    echo "Maior de idade";
  } elseif ($idade >= 16) {
    echo "Menor";
  } else {
    echo "Criança";
  }

  // switch
  $dia = "segunda";
  switch ($dia) {
    case "segunda":
      echo "Início da semana";
      break;
    case "sexta":
      echo "Fim da semana";
      break;
    default:
      echo "Dia comum";
  }

  // Operador ternário
  $mensagem = $idade >= 18 ? "Maior" : "Menor";
?&gt;</code></pre>

<h2 style="color: #0066cc;">Funções Básicas</h2>
<pre><code>&lt;?php
  // Definir função
  function saudacao($nome) {
    return "Olá, " . $nome . "!";
  }

  echo saudacao("João");  // Olá, João!

  // Parâmetro padrão
  function cumprimento($nome = "Visitante") {
    return "Bem-vindo, " . $nome;
  }

  echo cumprimento();       // Bem-vindo, Visitante
  echo cumprimento("Maria"); // Bem-vindo, Maria
?&gt;</code></pre>

<h2 style="color: #0066cc;">Função Superglobal \$_GET</h2>
<pre><code>&lt;?php
  // Acessa URL: index.php?nome=João&idade=17
  echo $_GET["nome"];   // João
  echo $_GET["idade"];  // 17

  // Verificar se chave existe
  if (isset($_GET["email"])) {
    echo $_GET["email"];
  } else {
    echo "Email não enviado";
  }
?&gt;</code></pre>

<h2 style="color: #0066cc;">Resumo</h2>
<p>PHP é executado no servidor e usa <strong>\$</strong> para variáveis. Use <strong>echo</strong> para saída, <strong>isset()</strong> para verificar existência e <strong>var_dump()</strong> para debug. A versão atual é PHP 8.5.</p>`,
    ordem: 1,
  },
  {
    titulo: 'Formulários GET e POST',
    slug: 'formularios-get-post',
    descricao: 'Processar dados de formulários HTML com GET e POST',
    conteudo: `<h2 style="color: #0066cc;">Objetivo de Aprendizagem</h2>
<p>Ao fim desta aula você será capaz de:</p>
<ul>
  <li>Criar formulários HTML e processar dados em PHP</li>
  <li>Diferenciar GET e POST</li>
  <li>Validar e sanitizar entrada do usuário</li>
</ul>

<h2 style="color: #0066cc;">Diferença entre GET e POST</h2>
<table style="border-collapse: collapse; width: 100%;">
  <tr style="border: 1px solid #ccc;">
    <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">GET</th>
    <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">POST</th>
  </tr>
  <tr style="border: 1px solid #ccc;">
    <td style="border: 1px solid #ccc; padding: 8px;">Dados na URL</td>
    <td style="border: 1px solid #ccc; padding: 8px;">Dados no corpo da requisição</td>
  </tr>
  <tr style="border: 1px solid #ccc;">
    <td style="border: 1px solid #ccc; padding: 8px;">Menos seguro (visível)</td>
    <td style="border: 1px solid #ccc; padding: 8px;">Mais seguro (oculto)</td>
  </tr>
  <tr style="border: 1px solid #ccc;">
    <td style="border: 1px solid #ccc; padding: 8px;">Tamanho limitado</td>
    <td style="border: 1px solid #ccc; padding: 8px;">Tamanho maior permitido</td>
  </tr>
  <tr style="border: 1px solid #ccc;">
    <td style="border: 1px solid #ccc; padding: 8px;">Usar para busca/filtro</td>
    <td style="border: 1px solid #ccc; padding: 8px;">Usar para criar/atualizar dados</td>
  </tr>
</table>

<h2 style="color: #0066cc;">Formulário HTML com GET</h2>
<pre><code>&lt;form method="GET" action="processa.php"&gt;
  &lt;input type="text" name="nome" required&gt;
  &lt;input type="email" name="email" required&gt;
  &lt;button type="submit"&gt;Buscar&lt;/button&gt;
&lt;/form&gt;</code></pre>

<h2 style="color: #0066cc;">Processar GET em PHP</h2>
<pre><code>&lt;?php
  // Recebe dados de index.php?nome=João&email=joao@email.com
  if (isset($_GET["nome"]) && isset($_GET["email"])) {
    $nome = $_GET["nome"];
    $email = $_GET["email"];
    echo "Bem-vindo, $nome! Email: $email";
  } else {
    echo "Dados incompletos";
  }
?&gt;</code></pre>

<h2 style="color: #0066cc;">Formulário HTML com POST</h2>
<pre><code>&lt;form method="POST" action="processa.php"&gt;
  &lt;input type="text" name="nome" required&gt;
  &lt;input type="password" name="senha" required&gt;
  &lt;textarea name="mensagem"&gt;&lt;/textarea&gt;
  &lt;button type="submit"&gt;Enviar&lt;/button&gt;
&lt;/form&gt;</code></pre>

<h2 style="color: #0066cc;">Processar POST em PHP</h2>
<pre><code>&lt;?php
  if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nome = isset($_POST["nome"]) ? $_POST["nome"] : "";
    $senha = isset($_POST["senha"]) ? $_POST["senha"] : "";
    $mensagem = isset($_POST["mensagem"]) ? $_POST["mensagem"] : "";

    // Validação
    if (empty($nome) || empty($senha)) {
      echo "Nome e senha são obrigatórios!";
    } else {
      echo "Dados recebidos com sucesso!";
      // Aqui você salvaria no banco de dados
    }
  }
?&gt;</code></pre>

<h2 style="color: #0066cc;">Sanitização e Validação</h2>
<pre><code>&lt;?php
  // Remover espaços e tags HTML
  $nome = trim($_POST["nome"]);
  $nome = htmlspecialchars($nome);  // Previne XSS

  // Validar email
  $email = $_POST["email"];
  if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo "Email válido";
  } else {
    echo "Email inválido";
  }

  // Validar número
  if (is_numeric($_POST["idade"])) {
    $idade = (int)$_POST["idade"];
  }

  // Funções úteis
  strlen($string);          // Comprimento
  strtolower($string);      // Minúsculas
  strtoupper($string);      // Maiúsculas
  str_replace("a", "o", $string);  // Substituir
?&gt;</code></pre>

<h2 style="color: #0066cc;">Upload de Arquivo</h2>
<pre><code>&lt;form method="POST" enctype="multipart/form-data" action="upload.php"&gt;
  &lt;input type="file" name="arquivo" required&gt;
  &lt;button type="submit"&gt;Enviar&lt;/button&gt;
&lt;/form&gt;

&lt;?php
  if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $arquivo = $_FILES["arquivo"];
    $nome = $arquivo["name"];
    $tmp = $arquivo["tmp_name"];
    $erro = $arquivo["error"];

    if ($erro === 0) {
      move_uploaded_file($tmp, "uploads/$nome");
      echo "Arquivo enviado!";
    } else {
      echo "Erro no upload";
    }
  }
?&gt;</code></pre>

<h2 style="color: #0066cc;">Resumo</h2>
<p>Use <strong>GET</strong> para busca, <strong>POST</strong> para formulários. Sempre valide com <strong>isset()</strong>, sanitize com <strong>htmlspecialchars()</strong> e use <strong>\$_FILES</strong> para uploads.</p>`,
    ordem: 2,
  },
  {
    titulo: 'Cookies e Sessões',
    slug: 'cookies-sessoes',
    descricao: 'Armazenar dados do usuário entre requisições',
    conteudo: `<h2 style="color: #0066cc;">Objetivo de Aprendizagem</h2>
<p>Ao fim desta aula você será capaz de:</p>
<ul>
  <li>Criar e manipular cookies</li>
  <li>Usar sessões para manter estado do usuário</li>
  <li>Implementar login/logout básico</li>
</ul>

<h2 style="color: #0066cc;">O que são Cookies?</h2>
<p>Cookies são pequenos arquivos armazenados no navegador do cliente. Úteis para lembrar preferências (tema, idioma, últimas buscas). O servidor envia o cookie, o navegador guarda e reenvia em cada requisição.</p>

<h2 style="color: #0066cc;">Criando Cookies</h2>
<pre><code>&lt;?php
  // Deve estar ANTES de qualquer output
  setcookie("nome", "João", time() + (86400 * 7));  // 7 dias
  setcookie("tema", "escuro");  // Expira ao fechar navegador

  // Acessar cookie
  echo $_COOKIE["nome"];  // João

  // Verificar se existe
  if (isset($_COOKIE["tema"])) {
    echo "Tema: " . $_COOKIE["tema"];
  }

  // Deletar cookie (tempo no passado)
  setcookie("nome", "", time() - 3600);
?&gt;</code></pre>

<h2 style="color: #0066cc;">Opções de Cookie</h2>
<pre><code>&lt;?php
  setcookie(
    name: "usuario",
    value: "joao123",
    expires_or_options: time() + 86400,  // Expira em 1 dia
    path: "/",                           // Disponível em todo site
    domain: ".example.com",              // Subdomínios
    secure: true,                        // Apenas HTTPS
    httponly: true                       // Inacessível via JavaScript
  );
?&gt;</code></pre>

<h2 style="color: #0066cc;">O que são Sessões?</h2>
<p>Sessões armazenam dados no <strong>servidor</strong> e usam um cookie para identificar o usuário. Mais seguro que cookies puros. Ideal para login de usuários.</p>

<h2 style="color: #0066cc;">Usando Sessões</h2>
<pre><code>&lt;?php
  // DEVE ser a primeira linha
  session_start();

  // Armazenar dados na sessão
  $_SESSION["usuario_id"] = 123;
  $_SESSION["usuario_nome"] = "João Silva";
  $_SESSION["logado"] = true;

  // Acessar dados
  echo $_SESSION["usuario_nome"];  // João Silva

  // Verificar se está logado
  if (isset($_SESSION["logado"]) && $_SESSION["logado"]) {
    echo "Bem-vindo, " . $_SESSION["usuario_nome"];
  } else {
    echo "Acesso negado";
  }
?&gt;</code></pre>

<h2 style="color: #0066cc;">Implementar Login/Logout</h2>
<pre><code>&lt;?php
  // login.php
  session_start();

  if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST["email"];
    $senha = $_POST["senha"];

    // Simular busca no banco de dados
    if ($email == "joao@example.com" && $senha == "123456") {
      $_SESSION["usuario_id"] = 1;
      $_SESSION["usuario_nome"] = "João";
      $_SESSION["logado"] = true;
      header("Location: dashboard.php");  // Redireciona
      exit;
    } else {
      echo "Email ou senha incorretos";
    }
  }
?&gt;
&lt;form method="POST"&gt;
  &lt;input type="email" name="email" required&gt;
  &lt;input type="password" name="senha" required&gt;
  &lt;button type="submit"&gt;Entrar&lt;/button&gt;
&lt;/form&gt;</code></pre>

<h2 style="color: #0066cc;">Logout</h2>
<pre><code>&lt;?php
  // logout.php
  session_start();

  // Limpar sessão
  unset($_SESSION["usuario_id"]);
  unset($_SESSION["usuario_nome"]);
  unset($_SESSION["logado"]);

  // Ou destruir toda a sessão
  session_destroy();

  // Redirecionar para home
  header("Location: index.php");
  exit;
?&gt;</code></pre>

<h2 style="color: #0066cc;">Proteger Página com Autenticação</h2>
<pre><code>&lt;?php
  // dashboard.php
  session_start();

  // Verificar se está logado
  if (!isset($_SESSION["logado"]) || !$_SESSION["logado"]) {
    header("Location: login.php");
    exit;
  }

  // Conteúdo protegido
  echo "Bem-vindo, " . $_SESSION["usuario_nome"];
?&gt;</code></pre>

<h2 style="color: #0066cc;">Resumo</h2>
<p>Use <strong>cookies</strong> para dados não-sensíveis, <strong>sessões</strong> para autenticação. <strong>session_start()</strong> DEVE ser primeira linha. Sempre valide dados e redirecione com <strong>header()</strong>.</p>`,
    ordem: 3,
  },
  {
    titulo: 'Banco de Dados com PHP',
    slug: 'banco-dados-php',
    descricao: 'Conectar-se e executar operações CRUD em MySQL/PostgreSQL',
    conteudo: `<h2 style="color: #0066cc;">Objetivo de Aprendizagem</h2>
<p>Ao fim desta aula você será capaz de:</p>
<ul>
  <li>Conectar a um banco de dados com PDO</li>
  <li>Executar consultas SELECT, INSERT, UPDATE, DELETE</li>
  <li>Prevenir SQL Injection com prepared statements</li>
</ul>

<h2 style="color: #0066cc;">PDO: PHP Data Objects</h2>
<p>PDO é a forma <strong>segura</strong> e moderna de acessar bancos de dados em PHP. Suporta MySQL, PostgreSQL, SQLite e outros.</p>

<h2 style="color: #0066cc;">Conectar ao Banco de Dados</h2>
<pre><code>&lt;?php
  $host = "localhost";
  $db = "escola_db";
  $usuario = "root";
  $senha = "123456";

  try {
    $pdo = new PDO(
      "mysql:host=$host;dbname=$db;charset=utf8mb4",
      $usuario,
      $senha
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Conectado com sucesso!";
  } catch (PDOException $e) {
    echo "Erro ao conectar: " . $e->getMessage();
  }
?&gt;</code></pre>

<h2 style="color: #0066cc;">SELECT: Buscar Dados</h2>
<pre><code>&lt;?php
  // Buscar todos os alunos
  $sql = "SELECT * FROM alunos";
  $stmt = $pdo->query($sql);
  $alunos = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // Exibir resultado
  foreach ($alunos as $aluno) {
    echo $aluno["nome"] . " - " . $aluno["email"] . "<br>";
  }

  // Buscar um registro
  $sql = "SELECT * FROM alunos WHERE id = ?";
  $stmt = $pdo->prepare($sql);
  $stmt->execute([1]);
  $aluno = $stmt->fetch(PDO::FETCH_ASSOC);
  echo $aluno["nome"];
?&gt;</code></pre>

<h2 style="color: #0066cc;">INSERT: Adicionar Dados</h2>
<pre><code>&lt;?php
  $nome = "Maria Silva";
  $email = "maria@example.com";
  $matricula = "2024001";

  $sql = "INSERT INTO alunos (nome, email, matricula) VALUES (?, ?, ?)";
  $stmt = $pdo->prepare($sql);
  $stmt->execute([$nome, $email, $matricula]);

  // Obter ID do registro inserido
  $novoId = $pdo->lastInsertId();
  echo "Aluno inserido com ID: $novoId";
?&gt;</code></pre>

<h2 style="color: #0066cc;">UPDATE: Atualizar Dados</h2>
<pre><code>&lt;?php
  $id = 1;
  $novoEmail = "novo@example.com";

  $sql = "UPDATE alunos SET email = ? WHERE id = ?";
  $stmt = $pdo->prepare($sql);
  $stmt->execute([$novoEmail, $id]);

  // Verificar quantas linhas foram afetadas
  $linhasAfetadas = $stmt->rowCount();
  echo "Linhas atualizadas: $linhasAfetadas";
?&gt;</code></pre>

<h2 style="color: #0066cc;">DELETE: Remover Dados</h2>
<pre><code>&lt;?php
  $id = 1;

  $sql = "DELETE FROM alunos WHERE id = ?";
  $stmt = $pdo->prepare($sql);
  $stmt->execute([$id]);

  echo "Aluno deletado!";
?&gt;</code></pre>

<h2 style="color: #0066cc;">Prepared Statements (Segurança)</h2>
<pre><code>&lt;?php
  // ❌ NUNCA faça assim (vulnerável a SQL Injection)
  $email = $_POST["email"];
  $sql = "SELECT * FROM alunos WHERE email = '$email'";

  // ✅ Sempre use prepared statements
  $sql = "SELECT * FROM alunos WHERE email = ?";
  $stmt = $pdo->prepare($sql);
  $stmt->execute([$email]);

  // Ou com nomes
  $sql = "SELECT * FROM alunos WHERE email = :email AND ativo = :ativo";
  $stmt = $pdo->prepare($sql);
  $stmt->execute([":email" => $email, ":ativo" => true]);
?&gt;</code></pre>

<h2 style="color: #0066cc;">Transações</h2>
<pre><code>&lt;?php
  try {
    $pdo->beginTransaction();

    // Múltiplas operações
    $pdo->prepare("UPDATE alunos SET saldo = saldo - ? WHERE id = ?")->execute([100, 1]);
    $pdo->prepare("UPDATE alunos SET saldo = saldo + ? WHERE id = ?")->execute([100, 2]);

    // Confirmar tudo
    $pdo->commit();
    echo "Transferência realizada!";
  } catch (Exception $e) {
    $pdo->rollBack();  // Desfazer tudo se erro
    echo "Erro: " . $e->getMessage();
  }
?&gt;</code></pre>

<h2 style="color: #0066cc;">Resumo</h2>
<p>Use <strong>PDO</strong> para segurança. <strong>Prepared statements</strong> previnem SQL Injection. Sempre teste com <strong>try/catch</strong> e use <strong>transações</strong> para múltiplas operações críticas.</p>`,
    ordem: 4,
  },
  {
    titulo: 'Segurança em PHP',
    slug: 'seguranca-php',
    descricao: 'Proteger aplicação contra vulnerabilidades comuns',
    conteudo: `<h2 style="color: #0066cc;">Objetivo de Aprendizagem</h2>
<p>Ao fim desta aula você será capaz de:</p>
<ul>
  <li>Prevenir SQL Injection, XSS e CSRF</li>
  <li>Hash de senhas com segurança</li>
  <li>Validar entrada do usuário</li>
</ul>

<h2 style="color: #0066cc;">SQL Injection</h2>
<p><strong>Problema:</strong> Injetar código SQL malicioso através de entrada do usuário.</p>

<pre><code>&lt;?php
  // ❌ Vulnerável
  $email = $_GET["email"];
  $sql = "SELECT * FROM usuarios WHERE email = '$email'";
  // Se email = "' OR '1'='1", a query retorna todos

  // ✅ Seguro (usar prepared statements)
  $sql = "SELECT * FROM usuarios WHERE email = ?";
  $stmt = $pdo->prepare($sql);
  $stmt->execute([$email]);
?&gt;</code></pre>

<h2 style="color: #0066cc;">Cross-Site Scripting (XSS)</h2>
<p><strong>Problema:</strong> Injetar JavaScript malicioso que roda no navegador dos usuários.</p>

<pre><code>&lt;?php
  // ❌ Vulnerável
  $nome = $_GET["nome"];
  echo "Bem-vindo, $nome";
  // Se nome = "&lt;script&gt;alert('Hack!')&lt;/script&gt;"

  // ✅ Seguro (escapar HTML)
  echo "Bem-vindo, " . htmlspecialchars($nome, ENT_QUOTES, 'UTF-8');

  // No HTML/Blade, usar {% escape %} ou {{  }}
?&gt;</code></pre>

<h2 style="color: #0066cc;">CSRF: Cross-Site Request Forgery</h2>
<p><strong>Problema:</strong> Forçar usuário a executar ação indesejada em outro site.</p>

<pre><code>&lt;?php
  // Gerar token CSRF
  session_start();
  if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
  }
?&gt;

&lt;!-- Incluir token em formulário --&gt;
&lt;form method="POST"&gt;
  &lt;input type="hidden" name="csrf_token" value="&lt;?php echo $_SESSION['csrf_token']; ?&gt;"&gt;
  &lt;input type="text" name="nome"&gt;
  &lt;button type="submit"&gt;Enviar&lt;/button&gt;
&lt;/form&gt;

&lt;?php
  // Validar token
  if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (empty($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
      die("CSRF token inválido!");
    }
    // Processar formulário
  }
?&gt;</code></pre>

<h2 style="color: #0066cc;">Hash de Senhas</h2>
<pre><code>&lt;?php
  // ❌ Nunca faça
  $senha = md5($_POST["senha"]);  // Inseguro!

  // ✅ Usar bcrypt ou argon2
  $senha = password_hash($_POST["senha"], PASSWORD_BCRYPT);

  // Verificar ao fazer login
  if (password_verify($_POST["senha"], $senhaHashArmazenada)) {
    echo "Senha correta!";
  } else {
    echo "Senha incorreta!";
  }
?&gt;</code></pre>

<h2 style="color: #0066cc;">Validar Entrada do Usuário</h2>
<pre><code>&lt;?php
  // Validar email
  $email = $_POST["email"];
  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    die("Email inválido");
  }

  // Validar URL
  if (!filter_var($url, FILTER_VALIDATE_URL)) {
    die("URL inválida");
  }

  // Validar inteiro
  if (!filter_var($idade, FILTER_VALIDATE_INT)) {
    die("Idade deve ser número");
  }

  // Remover caracteres perigosos
  $texto = filter_var($_POST["texto"], FILTER_SANITIZE_STRING);
?&gt;</code></pre>

<h2 style="color: #0066cc;">Outras Práticas de Segurança</h2>
<pre><code>&lt;?php
  // Remover headers perigosos
  header("X-Frame-Options: DENY");  // Prevenir clickjacking
  header("Content-Security-Policy: default-src 'self'");

  // Usar HTTPS apenas
  header("Strict-Transport-Security: max-age=31536000");

  // Limpar dados sensíveis
  unset($senha, $token);  // Remover da memória

  // Log de tentativas suspeitas
  error_log("Login falhado para: " . $_POST["email"]);
?&gt;</code></pre>

<h2 style="color: #0066cc;">Checklist de Segurança</h2>
<ul>
  <li>Prepared statements para SQL</li>
  <li>htmlspecialchars() para output HTML</li>
  <li>password_hash() e password_verify() para senhas</li>
  <li>CSRF tokens em formulários</li>
  <li>Validar com FILTER_VALIDATE_* antes de confiar</li>
  <li>HTTPS sempre</li>
  <li>Manter PHP atualizado</li>
</ul>

<h2 style="color: #0066cc;">Resumo</h2>
<p>Nunca confie em entrada do usuário. Use prepared statements, escape HTML, hash senhas e adicione CSRF tokens. Mantenha frameworks e PHP atualizados.</p>`,
    ordem: 5,
  },
  {
    titulo: 'Padrão MVC Básico',
    slug: 'padrao-mvc-basico',
    descricao: 'Estruturar aplicação com Model, View, Controller',
    conteudo: `<h2 style="color: #0066cc;">Objetivo de Aprendizagem</h2>
<p>Ao fim desta aula você será capaz de:</p>
<ul>
  <li>Entender e implementar padrão MVC</li>
  <li>Separar lógica de negócio da apresentação</li>
  <li>Criar roteador básico</li>
</ul>

<h2 style="color: #0066cc;">O que é MVC?</h2>
<p>MVC (Model-View-Controller) separa aplicação em três camadas:</p>
<ul>
  <li><strong>Model:</strong> Dados e lógica (banco de dados)</li>
  <li><strong>View:</strong> Apresentação (HTML)</li>
  <li><strong>Controller:</strong> Intermediário (processa requisição)</li>
</ul>

<h2 style="color: #0066cc;">Estrutura de Pastas</h2>
<pre><code>projeto/
├── config/
│   └── database.php       # Conexão PDO
├── models/
│   └── Aluno.php          # Classe Aluno (SELECT, INSERT, etc)
├── controllers/
│   └── AlunoController.php # Processa requisições de aluno
├── views/
│   └── alunos/
│       ├── index.php      # Lista de alunos
│       ├── create.php     # Formulário criar
│       └── edit.php       # Formulário editar
├── public/
│   ├── index.php          # Arquivo principal
│   ├── style.css
│   └── script.js
└── router.php             # Roteador</code></pre>

<h2 style="color: #0066cc;">1. Model: Aluno.php</h2>
<pre><code>&lt;?php
class Aluno {
  private $pdo;

  public function __construct($pdo) {
    $this->pdo = $pdo;
  }

  public function todos() {
    $sql = "SELECT * FROM alunos";
    return $this->pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
  }

  public function porId($id) {
    $sql = "SELECT * FROM alunos WHERE id = ?";
    $stmt = $this->pdo->prepare($sql);
    $stmt->execute([$id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
  }

  public function criar($nome, $email, $matricula) {
    $sql = "INSERT INTO alunos (nome, email, matricula) VALUES (?, ?, ?)";
    $stmt = $this->pdo->prepare($sql);
    return $stmt->execute([$nome, $email, $matricula]);
  }

  public function atualizar($id, $nome, $email) {
    $sql = "UPDATE alunos SET nome = ?, email = ? WHERE id = ?";
    $stmt = $this->pdo->prepare($sql);
    return $stmt->execute([$nome, $email, $id]);
  }

  public function deletar($id) {
    $sql = "DELETE FROM alunos WHERE id = ?";
    $stmt = $this->pdo->prepare($sql);
    return $stmt->execute([$id]);
  }
}
?&gt;</code></pre>

<h2 style="color: #0066cc;">2. Controller: AlunoController.php</h2>
<pre><code>&lt;?php
require_once "models/Aluno.php";

class AlunoController {
  private $aluno;
  private $pdo;

  public function __construct($pdo) {
    $this->pdo = $pdo;
    $this->aluno = new Aluno($pdo);
  }

  // Listar todos os alunos
  public function index() {
    $alunos = $this->aluno->todos();
    include "views/alunos/index.php";
  }

  // Exibir formulário de criação
  public function create() {
    include "views/alunos/create.php";
  }

  // Salvar novo aluno
  public function store() {
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
      $nome = $_POST["nome"];
      $email = $_POST["email"];
      $matricula = $_POST["matricula"];

      $this->aluno->criar($nome, $email, $matricula);
      header("Location: index.php?acao=alunos");
      exit;
    }
  }

  // Editar aluno
  public function edit($id) {
    $aluno = $this->aluno->porId($id);
    include "views/alunos/edit.php";
  }

  // Atualizar aluno
  public function update($id) {
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
      $nome = $_POST["nome"];
      $email = $_POST["email"];
      $this->aluno->atualizar($id, $nome, $email);
      header("Location: index.php?acao=alunos");
      exit;
    }
  }

  // Deletar aluno
  public function delete($id) {
    $this->aluno->deletar($id);
    header("Location: index.php?acao=alunos");
    exit;
  }
}
?&gt;</code></pre>

<h2 style="color: #0066cc;">3. View: views/alunos/index.php</h2>
<pre><code>&lt;h1&gt;Alunos&lt;/h1&gt;
&lt;a href="?acao=alunos&metodo=create"&gt;+ Novo Aluno&lt;/a&gt;

&lt;table border="1"&gt;
  &lt;tr&gt;
    &lt;th&gt;Nome&lt;/th&gt;
    &lt;th&gt;Email&lt;/th&gt;
    &lt;th&gt;Ações&lt;/th&gt;
  &lt;/tr&gt;
  &lt;?php foreach ($alunos as $aluno): ?&gt;
  &lt;tr&gt;
    &lt;td&gt;&lt;?php echo htmlspecialchars($aluno["nome"]); ?&gt;&lt;/td&gt;
    &lt;td&gt;&lt;?php echo htmlspecialchars($aluno["email"]); ?&gt;&lt;/td&gt;
    &lt;td&gt;
      &lt;a href="?acao=alunos&metodo=edit&id=&lt;?php echo $aluno["id"]; ?&gt;"&gt;Editar&lt;/a&gt;
      &lt;a href="?acao=alunos&metodo=delete&id=&lt;?php echo $aluno["id"]; ?&gt;" onclick="return confirm('Deletar?')"&gt;Deletar&lt;/a&gt;
    &lt;/td&gt;
  &lt;/tr&gt;
  &lt;?php endforeach; ?&gt;
&lt;/table&gt;</code></pre>

<h2 style="color: #0066cc;">4. Roteador: public/index.php</h2>
<pre><code>&lt;?php
require_once "../config/database.php";
require_once "../controllers/AlunoController.php";

// Criar conexão
$pdo = conexaoDB();

// Inicializar controller
$acao = $_GET["acao"] ?? "alunos";
$metodo = $_GET["metodo"] ?? "index";
$id = $_GET["id"] ?? null;

$controller = new AlunoController($pdo);

// Rotear requisição
if ($acao === "alunos") {
  if ($metodo === "index") {
    $controller->index();
  } elseif ($metodo === "create") {
    $controller->create();
  } elseif ($metodo === "store") {
    $controller->store();
  } elseif ($metodo === "edit") {
    $controller->edit($id);
  } elseif ($metodo === "update") {
    $controller->update($id);
  } elseif ($metodo === "delete") {
    $controller->delete($id);
  }
}
?&gt;</code></pre>

<h2 style="color: #0066cc;">Resumo</h2>
<p><strong>MVC</strong> organiza código em Model (dados), Controller (lógica) e View (apresentação). Mais fácil manter, testar e escalar. Frameworks PHP como Laravel usam este padrão.</p>`,
    ordem: 6,
  },
];

const desafiosPHP = [
  {
    titulo: 'Seu Primeiro Script PHP',
    enunciado: 'Crie script PHP que declare variáveis de tipos diferentes (string, int, float, boolean, array), exiba com echo e var_dump, e faça operações aritméticas.',
    tipo: 'pratico',
    gabarito: '<?php $nome = "João"; $idade = 17; $preco = 19.99; echo $nome; var_dump($idade); echo 10 + 5; ?>',
    ordem: 1,
    aula_index: 0,
  },
  {
    titulo: 'Processar Formulário GET',
    enunciado: 'Crie formulário HTML que envia nome e email via GET. Em PHP, receba com $_GET, valide com isset(), sanitize com htmlspecialchars() e exiba.',
    tipo: 'pratico',
    gabarito: 'Formulário com method="GET", PHP verifica isset($_GET["nome"]), usa htmlspecialchars() antes de echo.',
    ordem: 2,
    aula_index: 1,
  },
  {
    titulo: 'Login com Sessão',
    enunciado: 'Crie login.php que recebe email/senha via POST, valida e armazena em $_SESSION. Crie dashboard.php que verifica se está logado. Se não, redireciona para login.',
    tipo: 'pratico',
    gabarito: 'session_start() em ambas páginas, $_SESSION["logado"] = true, header("Location: ..."), verificar isset($_SESSION["logado"]).',
    ordem: 3,
    aula_index: 2,
  },
  {
    titulo: 'CRUD com Banco de Dados',
    enunciado: 'Crie tabela "alunos" (id, nome, email). Implemente: listar todos, buscar por ID, inserir novo, atualizar e deletar usando PDO com prepared statements.',
    tipo: 'pratico',
    gabarito: '$pdo->prepare() com placeholders (?), $stmt->execute([$valor]), $stmt->fetch/fetchAll(), $stmt->rowCount().',
    ordem: 4,
    aula_index: 3,
  },
  {
    titulo: 'Proteger contra SQL Injection',
    enunciado: 'Mostre duas versões: uma vulnerável usando string interpolação, outra segura usando prepared statements. Explique a diferença.',
    tipo: 'pratico',
    gabarito: 'Versão vulnerável: $sql = "SELECT * FROM usuarios WHERE email = \'$email\'"; Segura: $pdo->prepare com ?',
    ordem: 5,
    aula_index: 4,
  },
  {
    titulo: 'Hash de Senha e Validação',
    enunciado: 'Crie registro: use password_hash() para armazenar senha. No login, use password_verify() para comparar. Teste com senha correta e incorreta.',
    tipo: 'pratico',
    gabarito: '$hash = password_hash($_POST["senha"], PASSWORD_BCRYPT); password_verify($_POST["senha"], $hash);',
    ordem: 6,
    aula_index: 4,
  },
  {
    titulo: 'Projeto MVC: Gerenciador de Tarefas',
    enunciado: 'Implemente padrão MVC: Model (Task com CRUD), Controller (TaskController), Views (create, edit, list). Formulários funcionais com banco de dados.',
    tipo: 'pratico',
    gabarito: 'Models/Task.php, Controllers/TaskController.php, Views/tasks/*, public/index.php com roteamento básico.',
    ordem: 7,
    aula_index: 5,
  },
];

// ========================================
// FUNÇÃO PRINCIPAL
// ========================================

async function inserirCurso() {
  try {
    console.log('🚀 Inserindo Curso PHP — Back-end Web...\n');

    // 1. Inserir curso
    console.log('📚 Inserindo curso...');
    const { data: curso, error: eroCurso } = await supabase
      .from('cursos')
      .insert([cursoPHP])
      .select();

    if (eroCurso) throw new Error(`Erro ao inserir curso: ${eroCurso.message}`);
    const cursoId = curso[0].id;
    console.log(`✅ Curso inserido com ID: ${cursoId}\n`);

    // 2. Inserir aulas
    console.log('📖 Inserindo aulas...');
    const aulasComCursoId = aulasPHP.map((aula) => ({
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
    const desafiosComIds = desafiosPHP.map((desafio) => ({
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
    console.log('✅ CURSO PHP INSERIDO COM SUCESSO!');
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
