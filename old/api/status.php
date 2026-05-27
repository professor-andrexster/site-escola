<?php
require_once __DIR__ . '/config.php';
setCORS();

resposta([
    'status' => 'ok',
    'jornal' => 'Informativo JB',
    'versao' => '2.0.0',
    'backend' => 'PHP/MySQL',
]);
