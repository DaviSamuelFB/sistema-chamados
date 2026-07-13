-- ============================================================
-- Script SQL - Sistema de Chamados
-- Disciplina: TMS1391 - Desenvolvimento Web
-- Banco: PostgreSQL
-- ============================================================

-- Criação do banco (executar separadamente se necessário)
-- CREATE DATABASE sistema_chamados;

-- Extensão para UUID (opcional, mas útil)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABELA: usuarios
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id          SERIAL PRIMARY KEY,
    nome        VARCHAR(150)        NOT NULL,
    email       VARCHAR(150)        NOT NULL UNIQUE,
    telefone    VARCHAR(20)         NOT NULL,
    cpf         VARCHAR(14)         NOT NULL UNIQUE,
    senha       VARCHAR(255)        NOT NULL,
    criado_em   TIMESTAMP           DEFAULT NOW()
);

-- ============================================================
-- TABELA: chamados
-- ============================================================
CREATE TABLE IF NOT EXISTS chamados (
    id              SERIAL PRIMARY KEY,
    usuario_id      INTEGER             NOT NULL,
    titulo          VARCHAR(200)        NOT NULL,
    descricao       TEXT                NOT NULL,
    departamento    VARCHAR(50)         NOT NULL,  -- TI, RH, Financeiro
    regiao          VARCHAR(50)         NOT NULL,  -- Sudeste, Sul, Norte
    responsavel     VARCHAR(150)        NOT NULL,
    status          VARCHAR(30)         NOT NULL DEFAULT 'Em aberto',
                                                   -- Em aberto | Em análise | Resolvido
    criado_em       TIMESTAMP           DEFAULT NOW(),
    atualizado_em   TIMESTAMP           DEFAULT NOW(),

    CONSTRAINT fk_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

-- ============================================================
-- ÍNDICES para performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_chamados_usuario ON chamados(usuario_id);
CREATE INDEX IF NOT EXISTS idx_chamados_status  ON chamados(status);

-- ============================================================
-- DADOS DE EXEMPLO (opcional - para testes)
-- ============================================================
-- Senha: 123456 (hash gerado com password_hash)
INSERT INTO usuarios (nome, email, telefone, cpf, senha)
VALUES (
    'João da Silva',
    'joao@email.com',
    '(11) 98765-4321',
    '123.456.789-00',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
) ON CONFLICT DO NOTHING;

-- Chamados de exemplo vinculados ao usuário acima
INSERT INTO chamados (usuario_id, titulo, descricao, departamento, regiao, responsavel, status)
SELECT
    u.id,
    'Computador não liga',
    'Ao pressionar o botão de ligar, nada acontece. Já testei outra tomada.',
    'TI', 'Sudeste', 'Carlos', 'Em aberto'
FROM usuarios u WHERE u.email = 'joao@email.com'
ON CONFLICT DO NOTHING;

INSERT INTO chamados (usuario_id, titulo, descricao, departamento, regiao, responsavel, status)
SELECT
    u.id,
    'Reembolso de viagem',
    'Solicitação de reembolso da viagem feita no mês passado para São Paulo.',
    'Financeiro', 'Sudeste', 'Marina', 'Em análise'
FROM usuarios u WHERE u.email = 'joao@email.com'
ON CONFLICT DO NOTHING;

INSERT INTO chamados (usuario_id, titulo, descricao, departamento, regiao, responsavel, status)
SELECT
    u.id,
    'Atualização de cadastro',
    'Atualizei meu endereço residencial e preciso confirmar o registro no RH.',
    'RH', 'Sul', 'Patrícia', 'Resolvido'
FROM usuarios u WHERE u.email = 'joao@email.com'
ON CONFLICT DO NOTHING;
