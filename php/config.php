<?php
/**
 * config.php
 * Configuração da conexão com o banco de dados PostgreSQL via PDO
 * Sistema de Chamados - TMS1391 - Desenvolvimento Web
 */

// -------------------------------------------------------
// Configurações do banco - ajuste conforme seu ambiente
// -------------------------------------------------------
define('DB_HOST',   'localhost');
define('DB_PORT',   '5432');
define('DB_NAME',   'sistema_chamados');
define('DB_USER',   'postgres');
define('DB_PASS',   '123456');   // ← Altere para sua senha

// Fuso horário
date_default_timezone_set('America/Sao_Paulo');

/**
 * Retorna uma instância PDO conectada ao PostgreSQL.
 * Em caso de falha, retorna JSON de erro e encerra.
 */
function getDB(): PDO
{
    $dsn = sprintf(
        'pgsql:host=%s;port=%s;dbname=%s',
        DB_HOST, DB_PORT, DB_NAME
    );

    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(['erro' => 'Erro de conexão com o banco de dados.']);
        exit;
    }
}

/**
 * Helper: envia resposta JSON e encerra.
 */
function jsonResponse(array $data, int $code = 200): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Helper: verifica se a sessão está ativa; redireciona se não estiver.
 */
function requireLogin(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    if (empty($_SESSION['usuario_id'])) {
        jsonResponse(['erro' => 'Não autenticado.'], 401);
    }
}
