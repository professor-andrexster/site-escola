<?php
// ── Segurança: bloqueia acesso direto ────────────────────────
if (basename($_SERVER['PHP_SELF']) === 'config.php') {
    http_response_code(403);
    exit(json_encode(['erro' => 'Acesso negado']));
}

// ── Carrega o .env ───────────────────────────────────────────
$envPath = __DIR__ . '/../.env';
if (file_exists($envPath)) {
    foreach (file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $linha) {
        if ($linha[0] === '#' || strpos($linha, '=') === false) continue;
        [$chave, $valor] = explode('=', $linha, 2);
        $_ENV[trim($chave)] = trim($valor);
    }
}

// ── Headers CORS + JSON ──────────────────────────────────────
function setCORS(): void {
    $origem = $_ENV['ALLOWED_ORIGIN'] ?? '*';
    header("Access-Control-Allow-Origin: $origem");
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Content-Type: application/json; charset=utf-8');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

// ── Conexão PDO (MySQL) ──────────────────────────────────────
function db(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;

    $host = $_ENV['DB_HOST']     ?? 'localhost';
    $port = $_ENV['DB_PORT']     ?? '3306';
    $user = $_ENV['DB_USER']     ?? '';
    $pass = $_ENV['DB_PASSWORD'] ?? '';
    $name = $_ENV['DB_NAME']     ?? '';

    try {
        $pdo = new PDO(
            "mysql:host=$host;port=$port;dbname=$name;charset=utf8mb4",
            $user, $pass,
            [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]
        );
    } catch (PDOException $e) {
        resposta(['erro' => 'Erro ao conectar ao banco de dados'], 500);
    }

    return $pdo;
}

// ── JWT simples (HS256, sem dependências) ────────────────────
function b64url(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}
function b64urlDecode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', (4 - strlen($data) % 4) % 4));
}

function criarToken(array $payload): string {
    $secret  = $_ENV['JWT_SECRET'] ?? 'segredo';
    $header  = b64url(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = array_merge($payload, ['iat' => time(), 'exp' => time() + 28800]); // 8h
    $body    = b64url(json_encode($payload));
    $sig     = b64url(hash_hmac('sha256', "$header.$body", $secret, true));
    return "$header.$body.$sig";
}

function verificarToken(string $token): array|false {
    $secret = $_ENV['JWT_SECRET'] ?? 'segredo';
    $partes = explode('.', $token);
    if (count($partes) !== 3) return false;

    [$header, $body, $sig] = $partes;
    $esperado = b64url(hash_hmac('sha256', "$header.$body", $secret, true));
    if (!hash_equals($esperado, $sig)) return false;

    $dados = json_decode(b64urlDecode($body), true);
    if (!$dados || $dados['exp'] < time()) return false;

    return $dados;
}

function requireAuth(): void {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $token      = trim(str_replace('Bearer', '', $authHeader));

    if (!$token || !verificarToken($token)) {
        resposta(['erro' => 'Não autorizado. Faça login novamente.'], 401);
    }
}

// ── Helpers ──────────────────────────────────────────────────
function resposta(array $dados, int $codigo = 200): never {
    http_response_code($codigo);
    echo json_encode($dados, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}

function body(): array {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

function idDaUrl(): ?int {
    // Suporta /api/noticias/5 (via .htaccess) ou ?id=5
    if (isset($_GET['id'])) return (int) $_GET['id'];
    $uri   = $_SERVER['REQUEST_URI'];
    $partes = explode('/', trim(parse_url($uri, PHP_URL_PATH), '/'));
    $ultimo = end($partes);
    return is_numeric($ultimo) ? (int) $ultimo : null;
}
