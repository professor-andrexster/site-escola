<?php
require_once __DIR__ . '/config.php';
setCORS();

$metodo = $_SERVER['REQUEST_METHOD'];
$id     = idDaUrl();

switch ($metodo) {

    // ── GET: lista ou busca uma ──────────────────────────────
    case 'GET':
        $pdo = db();

        if ($id) {
            $stmt = $pdo->prepare('SELECT * FROM noticias WHERE id = ?');
            $stmt->execute([$id]);
            $noticia = $stmt->fetch();
            if (!$noticia) resposta(['erro' => 'Notícia não encontrada'], 404);
            resposta($noticia);
        }

        $categoria = $_GET['categoria'] ?? null;
        $limit     = min((int) ($_GET['limit']  ?? 20), 100);
        $offset    = (int) ($_GET['offset'] ?? 0);

        $sql    = 'SELECT * FROM noticias';
        $params = [];

        if ($categoria) {
            $sql    .= ' WHERE categoria = ?';
            $params[] = $categoria;
        }

        $sql .= ' ORDER BY criado_em DESC LIMIT ? OFFSET ?';
        $params[] = $limit;
        $params[] = $offset;

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        resposta($stmt->fetchAll());

    // ── POST: cria notícia ───────────────────────────────────
    case 'POST':
        requireAuth();
        $dados = body();

        $titulo     = trim($dados['titulo']     ?? '');
        $texto      = trim($dados['texto']      ?? '');
        $categoria  = trim($dados['categoria']  ?? 'noticia');
        $autor      = trim($dados['autor']      ?? 'Equipe JB');
        $imagem_url = trim($dados['imagem_url'] ?? '');

        if (!$titulo || !$texto) {
            resposta(['erro' => 'Título e texto são obrigatórios'], 400);
        }

        $pdo  = db();
        $stmt = $pdo->prepare(
            'INSERT INTO noticias (titulo, texto, categoria, autor, imagem_url)
             VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([$titulo, $texto, $categoria, $autor, $imagem_url ?: null]);

        resposta(['id' => (int) $pdo->lastInsertId(), 'mensagem' => 'Notícia publicada!'], 201);

    // ── PUT: edita notícia ───────────────────────────────────
    case 'PUT':
        requireAuth();
        if (!$id) resposta(['erro' => 'ID obrigatório'], 400);

        $dados  = body();
        $campos = [];
        $params = [];

        foreach (['titulo', 'texto', 'categoria', 'autor', 'imagem_url'] as $campo) {
            if (array_key_exists($campo, $dados)) {
                $campos[] = "$campo = ?";
                $params[] = $dados[$campo] !== '' ? $dados[$campo] : null;
            }
        }

        if (!$campos) resposta(['erro' => 'Nenhum campo para atualizar'], 400);

        $params[] = $id;
        $pdo = db();
        $pdo->prepare('UPDATE noticias SET ' . implode(', ', $campos) . ' WHERE id = ?')
            ->execute($params);

        resposta(['mensagem' => 'Notícia atualizada!']);

    // ── DELETE: remove notícia ───────────────────────────────
    case 'DELETE':
        requireAuth();
        if (!$id) resposta(['erro' => 'ID obrigatório'], 400);

        $pdo  = db();
        $stmt = $pdo->prepare('DELETE FROM noticias WHERE id = ?');
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) resposta(['erro' => 'Notícia não encontrada'], 404);

        resposta(['mensagem' => 'Notícia removida']);

    default:
        resposta(['erro' => 'Método não permitido'], 405);
}
