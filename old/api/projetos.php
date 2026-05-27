<?php
require_once __DIR__ . '/config.php';
setCORS();

$metodo = $_SERVER['REQUEST_METHOD'];
$id     = idDaUrl();

switch ($metodo) {

    // ── GET: lista ou busca um ───────────────────────────────
    case 'GET':
        $pdo = db();

        if ($id) {
            $stmt = $pdo->prepare('SELECT * FROM projetos WHERE id = ?');
            $stmt->execute([$id]);
            $projeto = $stmt->fetch();
            if (!$projeto) resposta(['erro' => 'Projeto não encontrado'], 404);
            resposta($projeto);
        }

        $limit  = min((int) ($_GET['limit']  ?? 20), 100);
        $offset = (int) ($_GET['offset'] ?? 0);

        $stmt = $pdo->prepare('SELECT * FROM projetos ORDER BY criado_em DESC LIMIT ? OFFSET ?');
        $stmt->execute([$limit, $offset]);
        resposta($stmt->fetchAll());

    // ── POST: cria projeto ───────────────────────────────────
    case 'POST':
        requireAuth();
        $dados = body();

        $titulo      = trim($dados['titulo']    ?? '');
        $descricao   = trim($dados['descricao'] ?? '');
        $turma       = trim($dados['turma']     ?? '');
        $ano         = $dados['ano']      ? (int) $dados['ano']      : null;
        $categoria   = trim($dados['categoria'] ?? 'outro');
        $tecnologias = isset($dados['tecnologias']) ? json_encode($dados['tecnologias']) : null;
        $link        = trim($dados['link'] ?? '');

        if (!$titulo) {
            resposta(['erro' => 'Título é obrigatório'], 400);
        }

        $pdo  = db();
        $stmt = $pdo->prepare(
            'INSERT INTO projetos (titulo, turma, ano, categoria, descricao, tecnologias, link)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $titulo,
            $turma    ?: null,
            $ano,
            $categoria,
            $descricao ?: null,
            $tecnologias,
            $link     ?: null,
        ]);

        resposta(['id' => (int) $pdo->lastInsertId(), 'mensagem' => 'Projeto cadastrado!'], 201);

    // ── PUT: edita projeto ───────────────────────────────────
    case 'PUT':
        requireAuth();
        if (!$id) resposta(['erro' => 'ID obrigatório'], 400);

        $dados  = body();
        $campos = [];
        $params = [];

        foreach (['titulo', 'turma', 'ano', 'categoria', 'descricao', 'link'] as $campo) {
            if (array_key_exists($campo, $dados)) {
                $campos[] = "$campo = ?";
                $params[] = $dados[$campo] !== '' ? $dados[$campo] : null;
            }
        }
        if (array_key_exists('tecnologias', $dados)) {
            $campos[] = 'tecnologias = ?';
            $params[] = $dados['tecnologias'] ? json_encode($dados['tecnologias']) : null;
        }

        if (!$campos) resposta(['erro' => 'Nenhum campo para atualizar'], 400);

        $params[] = $id;
        $pdo = db();
        $pdo->prepare('UPDATE projetos SET ' . implode(', ', $campos) . ' WHERE id = ?')
            ->execute($params);

        resposta(['mensagem' => 'Projeto atualizado!']);

    // ── DELETE: remove projeto ───────────────────────────────
    case 'DELETE':
        requireAuth();
        if (!$id) resposta(['erro' => 'ID obrigatório'], 400);

        $pdo  = db();
        $stmt = $pdo->prepare('DELETE FROM projetos WHERE id = ?');
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) resposta(['erro' => 'Projeto não encontrado'], 404);

        resposta(['mensagem' => 'Projeto removido']);

    default:
        resposta(['erro' => 'Método não permitido'], 405);
}
