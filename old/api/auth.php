<?php
require_once __DIR__ . '/config.php';
setCORS();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    resposta(['erro' => 'Método não permitido'], 405);
}

$dados = body();
$senha = $dados['senha'] ?? '';

if (!$senha) {
    resposta(['erro' => 'Senha é obrigatória'], 400);
}

$senhaCorreta = $_ENV['ADMIN_PASSWORD'] ?? 'beraldo2025';

if (!hash_equals($senhaCorreta, $senha)) {
    resposta(['erro' => 'Senha incorreta'], 401);
}

$token = criarToken(['admin' => true]);
resposta(['token' => $token, 'mensagem' => 'Login realizado com sucesso']);
