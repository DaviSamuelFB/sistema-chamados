<?php
/**
 * auth.php
 * Endpoints de autenticação: login e logout
 * Método: POST (JSON via AJAX)
 * Sistema de Chamados - TMS1391 - Desenvolvimento Web
 */

require_once 'config.php';

session_start();

// Lê JSON enviado via AJAX
$input  = json_decode(file_get_contents('php://input'), true) ?? [];
$action = $input['action'] ?? $_GET['action'] ?? '';

// ----------------------------------------------------------
// Roteamento de ações
// ----------------------------------------------------------
switch ($action) {

    // ======================================================
    // LOGIN
    // ======================================================
    case 'login':
        $email = trim($input['email'] ?? '');
        $senha = $input['senha'] ?? '';

        // Validação básica
        if (empty($email) || empty($senha)) {
            jsonResponse(['erro' => 'E-mail e senha são obrigatórios.'], 400);
        }

        $db  = getDB();
        $sql = "SELECT id, nome, email, telefone, cpf, senha
                FROM usuarios
                WHERE email = :email
                LIMIT 1";

        $stmt = $db->prepare($sql);
        $stmt->execute([':email' => $email]);
        $usuario = $stmt->fetch();

        // Valida senha com hash
        if (!$usuario || !password_verify($senha, $usuario['senha'])) {
            jsonResponse(['erro' => 'E-mail ou senha inválidos.'], 401);
        }

        // Cria sessão
        $_SESSION['usuario_id']   = $usuario['id'];
        $_SESSION['usuario_nome'] = $usuario['nome'];

        // Remove senha da resposta
        unset($usuario['senha']);

        jsonResponse(['sucesso' => true, 'usuario' => $usuario]);
        break;

    // ======================================================
    // LOGOUT
    // ======================================================
    case 'logout':
        $_SESSION = [];
        session_destroy();
        jsonResponse(['sucesso' => true]);
        break;

    // ======================================================
    // VERIFICA SESSÃO
    // ======================================================
    case 'check':
        if (!empty($_SESSION['usuario_id'])) {
            $db  = getDB();
            $sql = "SELECT id, nome, email, telefone, cpf
                    FROM usuarios WHERE id = :id LIMIT 1";
            $stmt = $db->prepare($sql);
            $stmt->execute([':id' => $_SESSION['usuario_id']]);
            $usuario = $stmt->fetch();
            jsonResponse(['autenticado' => true, 'usuario' => $usuario]);
        } else {
            jsonResponse(['autenticado' => false]);
        }
        break;

    default:
        jsonResponse(['erro' => 'Ação inválida.'], 400);
}
