<?php
/**
 * chamados.php
 * Endpoints de gerenciamento de chamados: criar, listar, editar
 * Método: POST / GET (JSON via AJAX)
 * Sistema de Chamados - TMS1391 - Desenvolvimento Web
 */

require_once 'config.php';

session_start();

$input  = json_decode(file_get_contents('php://input'), true) ?? [];
$action = $input['action'] ?? $_GET['action'] ?? '';

// Todos os endpoints de chamados requerem login
requireLogin();

$usuarioId = (int) $_SESSION['usuario_id'];

// Valores permitidos para validação
$departamentosValidos = ['TI', 'RH', 'Financeiro'];
$regioesValidas       = ['Sudeste', 'Sul', 'Norte'];
$statusValidos        = ['Em aberto', 'Em análise', 'Resolvido'];

switch ($action) {

    // ======================================================
    // LISTAR CHAMADOS DO USUÁRIO LOGADO
    // ======================================================
    case 'listar':
        $db  = getDB();
        $sql = "SELECT id, titulo, descricao, departamento, regiao,
                       responsavel, status,
                       TO_CHAR(criado_em, 'DD/MM/YYYY HH24:MI') AS criado_em
                FROM chamados
                WHERE usuario_id = :uid
                ORDER BY criado_em DESC";

        $stmt = $db->prepare($sql);
        $stmt->execute([':uid' => $usuarioId]);
        $chamados = $stmt->fetchAll();

        // Contagens para o dashboard
        $abertos = array_filter($chamados, fn($c) => $c['status'] === 'Em aberto');

        jsonResponse([
            'sucesso'          => true,
            'chamados'         => $chamados,
            'total'            => count($chamados),
            'total_abertos'    => count($abertos),
        ]);
        break;

    // ======================================================
    // CADASTRAR CHAMADO
    // ======================================================
    case 'cadastrar':
        $titulo       = trim($input['titulo']       ?? '');
        $descricao    = trim($input['descricao']    ?? '');
        $departamento = trim($input['departamento'] ?? '');
        $regiao       = trim($input['regiao']       ?? '');
        $responsavel  = trim($input['responsavel']  ?? '');
        $status       = trim($input['status']       ?? 'Em aberto');

        // Validações
        if (empty($titulo) || empty($descricao) || empty($departamento)
            || empty($regiao) || empty($responsavel)) {
            jsonResponse(['erro' => 'Todos os campos são obrigatórios.'], 400);
        }

        if (!in_array($departamento, $departamentosValidos)) {
            jsonResponse(['erro' => 'Departamento inválido.'], 400);
        }

        if (!in_array($regiao, $regioesValidas)) {
            jsonResponse(['erro' => 'Região inválida.'], 400);
        }

        // Status inicial é sempre "Em aberto" ao criar
        $status = 'Em aberto';

        $db  = getDB();
        $sql = "INSERT INTO chamados
                    (usuario_id, titulo, descricao, departamento, regiao, responsavel, status)
                VALUES
                    (:uid, :titulo, :descricao, :departamento, :regiao, :responsavel, :status)
                RETURNING id, TO_CHAR(criado_em, 'DD/MM/YYYY HH24:MI') AS criado_em";

        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':uid'          => $usuarioId,
            ':titulo'       => $titulo,
            ':descricao'    => $descricao,
            ':departamento' => $departamento,
            ':regiao'       => $regiao,
            ':responsavel'  => $responsavel,
            ':status'       => $status,
        ]);

        $novo = $stmt->fetch();

        jsonResponse([
            'sucesso'  => true,
            'chamado'  => [
                'id'           => $novo['id'],
                'titulo'       => $titulo,
                'descricao'    => $descricao,
                'departamento' => $departamento,
                'regiao'       => $regiao,
                'responsavel'  => $responsavel,
                'status'       => $status,
                'criado_em'    => $novo['criado_em'],
            ]
        ]);
        break;

    // ======================================================
    // EDITAR CHAMADO
    // ======================================================
    case 'editar':
        $id           = (int) ($input['id']          ?? 0);
        $titulo       = trim($input['titulo']        ?? '');
        $descricao    = trim($input['descricao']     ?? '');
        $departamento = trim($input['departamento']  ?? '');
        $regiao       = trim($input['regiao']        ?? '');
        $responsavel  = trim($input['responsavel']   ?? '');
        $status       = trim($input['status']        ?? '');

        if ($id <= 0) {
            jsonResponse(['erro' => 'ID do chamado inválido.'], 400);
        }

        if (empty($titulo) || empty($descricao) || empty($departamento)
            || empty($regiao) || empty($responsavel) || empty($status)) {
            jsonResponse(['erro' => 'Todos os campos são obrigatórios.'], 400);
        }

        if (!in_array($departamento, $departamentosValidos)) {
            jsonResponse(['erro' => 'Departamento inválido.'], 400);
        }

        if (!in_array($regiao, $regioesValidas)) {
            jsonResponse(['erro' => 'Região inválida.'], 400);
        }

        if (!in_array($status, $statusValidos)) {
            jsonResponse(['erro' => 'Status inválido.'], 400);
        }

        $db = getDB();

        // Garante que o chamado pertence ao usuário logado
        $stmtCheck = $db->prepare(
            "SELECT id FROM chamados WHERE id = :id AND usuario_id = :uid LIMIT 1"
        );
        $stmtCheck->execute([':id' => $id, ':uid' => $usuarioId]);
        if (!$stmtCheck->fetch()) {
            jsonResponse(['erro' => 'Chamado não encontrado ou sem permissão.'], 403);
        }

        $sql = "UPDATE chamados
                SET titulo = :titulo, descricao = :descricao,
                    departamento = :departamento, regiao = :regiao,
                    responsavel = :responsavel, status = :status,
                    atualizado_em = NOW()
                WHERE id = :id AND usuario_id = :uid";

        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':titulo'       => $titulo,
            ':descricao'    => $descricao,
            ':departamento' => $departamento,
            ':regiao'       => $regiao,
            ':responsavel'  => $responsavel,
            ':status'       => $status,
            ':id'           => $id,
            ':uid'          => $usuarioId,
        ]);

        jsonResponse(['sucesso' => true]);
        break;

    default:
        jsonResponse(['erro' => 'Ação inválida.'], 400);
}
