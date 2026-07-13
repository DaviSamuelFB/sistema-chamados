<?php
/**
 * usuarios.php
 * Endpoints de gerenciamento de usuários: cadastrar e editar
 * Método: POST (JSON via AJAX)
 * Sistema de Chamados - TMS1391 - Desenvolvimento Web
 */

require_once 'config.php';

session_start();

$input  = json_decode(file_get_contents('php://input'), true) ?? [];
$action = $input['action'] ?? $_GET['action'] ?? '';

switch ($action) {

    // ======================================================
    // CADASTRAR USUÁRIO
    // ======================================================
    case 'cadastrar':
        $nome     = trim($input['nome']     ?? '');
        $email    = trim($input['email']    ?? '');
        $telefone = trim($input['telefone'] ?? '');
        $cpf      = trim($input['cpf']      ?? '');
        $senha    = $input['senha']          ?? '';

        // Validação de campos obrigatórios
        if (empty($nome) || empty($email) || empty($telefone)
            || empty($cpf) || empty($senha)) {
            jsonResponse(['erro' => 'Todos os campos são obrigatórios.'], 400);
        }

        // Validação de formato de e-mail
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            jsonResponse(['erro' => 'Formato de e-mail inválido.'], 400);
        }

        // Remove formatação do CPF (mantém apenas dígitos) e valida 11 dígitos
        $cpfLimpo = preg_replace('/\D/', '', $cpf);
        if (strlen($cpfLimpo) !== 11) {
            jsonResponse(['erro' => 'CPF inválido. Informe 11 dígitos numéricos.'], 400);
        }

        $db = getDB();

        // Verifica e-mail duplicado
        $stmtCheck = $db->prepare("SELECT id FROM usuarios WHERE email = :email LIMIT 1");
        $stmtCheck->execute([':email' => $email]);
        if ($stmtCheck->fetch()) {
            jsonResponse(['erro' => 'Este e-mail já está cadastrado.'], 409);
        }

        // Verifica CPF duplicado
        $stmtCpf = $db->prepare("SELECT id FROM usuarios WHERE cpf = :cpf LIMIT 1");
        $stmtCpf->execute([':cpf' => $cpf]);
        if ($stmtCpf->fetch()) {
            jsonResponse(['erro' => 'Este CPF já está cadastrado.'], 409);
        }

        // Hash da senha
        $senhaHash = password_hash($senha, PASSWORD_BCRYPT);

        // Insere usuário
        $sql = "INSERT INTO usuarios (nome, email, telefone, cpf, senha)
                VALUES (:nome, :email, :telefone, :cpf, :senha)
                RETURNING id";

        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':nome'     => $nome,
            ':email'    => $email,
            ':telefone' => $telefone,
            ':cpf'      => $cpf,
            ':senha'    => $senhaHash,
        ]);

        $novo = $stmt->fetch();

        // Cria sessão automaticamente após cadastro
        $_SESSION['usuario_id']   = $novo['id'];
        $_SESSION['usuario_nome'] = $nome;

        jsonResponse([
            'sucesso' => true,
            'usuario' => [
                'id'       => $novo['id'],
                'nome'     => $nome,
                'email'    => $email,
                'telefone' => $telefone,
                'cpf'      => $cpf,
            ]
        ]);
        break;

    // ======================================================
    // EDITAR USUÁRIO (requer login)
    // ======================================================
    case 'editar':
        requireLogin();

        $id       = (int) $_SESSION['usuario_id'];
        $nome     = trim($input['nome']     ?? '');
        $email    = trim($input['email']    ?? '');
        $telefone = trim($input['telefone'] ?? '');
        $cpf      = trim($input['cpf']      ?? '');
        $senha    = $input['senha']          ?? '';  // Opcional: só atualiza se informado

        if (empty($nome) || empty($email) || empty($telefone) || empty($cpf)) {
            jsonResponse(['erro' => 'Nome, e-mail, telefone e CPF são obrigatórios.'], 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            jsonResponse(['erro' => 'Formato de e-mail inválido.'], 400);
        }

        $db = getDB();

        // Verifica e-mail duplicado (exceto o próprio)
        $stmtCheck = $db->prepare(
            "SELECT id FROM usuarios WHERE email = :email AND id <> :id LIMIT 1"
        );
        $stmtCheck->execute([':email' => $email, ':id' => $id]);
        if ($stmtCheck->fetch()) {
            jsonResponse(['erro' => 'Este e-mail já está em uso por outro usuário.'], 409);
        }

        // Verifica CPF duplicado (exceto o próprio)
        $stmtCpf = $db->prepare(
            "SELECT id FROM usuarios WHERE cpf = :cpf AND id <> :id LIMIT 1"
        );
        $stmtCpf->execute([':cpf' => $cpf, ':id' => $id]);
        if ($stmtCpf->fetch()) {
            jsonResponse(['erro' => 'Este CPF já está em uso por outro usuário.'], 409);
        }

        // Monta SQL dinamicamente (senha é opcional)
        if (!empty($senha)) {
            $senhaHash = password_hash($senha, PASSWORD_BCRYPT);
            $sql = "UPDATE usuarios
                    SET nome = :nome, email = :email, telefone = :telefone,
                        cpf = :cpf, senha = :senha
                    WHERE id = :id";
            $params = [
                ':nome'     => $nome,
                ':email'    => $email,
                ':telefone' => $telefone,
                ':cpf'      => $cpf,
                ':senha'    => $senhaHash,
                ':id'       => $id,
            ];
        } else {
            $sql = "UPDATE usuarios
                    SET nome = :nome, email = :email, telefone = :telefone, cpf = :cpf
                    WHERE id = :id";
            $params = [
                ':nome'     => $nome,
                ':email'    => $email,
                ':telefone' => $telefone,
                ':cpf'      => $cpf,
                ':id'       => $id,
            ];
        }

        $stmt = $db->prepare($sql);
        $stmt->execute($params);

        // Atualiza nome na sessão
        $_SESSION['usuario_nome'] = $nome;

        jsonResponse([
            'sucesso' => true,
            'usuario' => [
                'id'       => $id,
                'nome'     => $nome,
                'email'    => $email,
                'telefone' => $telefone,
                'cpf'      => $cpf,
            ]
        ]);
        break;

    default:
        jsonResponse(['erro' => 'Ação inválida.'], 400);
}
