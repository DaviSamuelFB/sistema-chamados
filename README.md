<h1 align="center">🎫 Sistema de Chamados</h1>

<p align="center">
  Aplicação web full stack para registro e gerenciamento de solicitações de suporte (chamados).
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/Bootstrap_5-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" alt="Bootstrap" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white" alt="PHP" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>

---

## 📌 Sobre o projeto

O **Sistema de Chamados** é uma aplicação web completa que permite o cadastro e a autenticação de usuários, a abertura e o acompanhamento de chamados de suporte e o gerenciamento seguro dos dados pessoais. O projeto integra as principais camadas de uma aplicação moderna: **frontend responsivo**, **backend em PHP** e **persistência em banco de dados relacional PostgreSQL**.

O desenvolvimento foi dividido em duas etapas complementares:

- **Etapa 1 – Interface (Frontend):** construção de todas as telas com HTML5, CSS3 e Bootstrap 5, com layout responsivo e validações em JavaScript puro.
- **Etapa 2 – Sistema funcional com persistência (Backend):** implementação da lógica de negócio em PHP com PDO, autenticação com sessões, operações CRUD e comunicação assíncrona (AJAX) entre frontend e backend via **Fetch API** em formato JSON.

---

## ✨ Funcionalidades

### 🔐 Autenticação e sessão
- Login por e-mail e senha, com validação no banco de dados.
- Senhas armazenadas com hash **bcrypt** (`password_hash()`) e validadas com `password_verify()`.
- Controle de sessão com `session_start()` e proteção das rotas autenticadas.
- Endpoints de logout e de verificação de sessão ativa.

### 👤 Cadastro e dados do usuário
- Cadastro com nome, e-mail, telefone, CPF, senha e confirmação de senha.
- Validação de CPF pelo algoritmo oficial dos dígitos verificadores, com máscara `000.000.000-00`.
- Validação de telefone com máscara `(XX) XXXXX-XXXX` e verificação de DDD.
- Indicador visual, em tempo real, dos critérios de senha (mínimo 8 caracteres, número e letra).
- Edição de dados pessoais em modal, com alteração segura de senha (confirmação da senha atual no backend).

### 🎫 Gestão de chamados
- Abertura de chamado com título, descrição, departamento (TI, RH, Financeiro), região (Sudeste, Sul, Norte) e responsável.
- Status inicial **"Em aberto"** atribuído automaticamente.
- Listagem dos chamados do usuário logado, com data e hora de criação.
- Edição de chamados com alteração de status (**Em aberto**, **Em análise** ou **Resolvido**).
- Cada chamado é vinculado ao usuário criador por chave estrangeira (FK).

### 💡 Melhorias de experiência
- Tela de recuperação de senha.
- Validações inline com destaque visual em vermelho nos campos inválidos.
- Toasts de sucesso e erro.
- Botão flutuante "Voltar ao topo" na listagem.
- Estados de carregamento nos botões durante o processamento.

---

## 🧑‍💻 Tecnologias

- **HTML5** — estrutura das páginas
- **CSS3** — estilização e identidade visual
- **Bootstrap 5** — layout responsivo e componentes
- **JavaScript (puro)** — validações, máscaras e interatividade
- **AJAX / Fetch API** — comunicação assíncrona em JSON
- **PHP** — camada de negócio e autenticação
- **PDO** — acesso ao banco com prepared statements (proteção contra SQL Injection)
- **PostgreSQL** — banco de dados relacional

---

## 🗄️ Banco de dados

O banco foi implementado em **PostgreSQL** e é composto por duas tabelas relacionadas, `usuarios` e `chamados`. O relacionamento é **um para muitos (1:N)**: um usuário pode possuir vários chamados, e cada chamado pertence a exatamente um usuário, através da chave estrangeira `usuario_id` com `ON DELETE CASCADE`.

**Tabela `usuarios`**

| Coluna | Tipo | Observação |
| --- | --- | --- |
| id | SERIAL | Chave primária |
| nome | VARCHAR(150) | Obrigatório |
| email | VARCHAR(150) | Único, obrigatório |
| telefone | VARCHAR(20) | Obrigatório |
| cpf | VARCHAR(14) | Único, obrigatório |
| senha | VARCHAR(255) | Hash bcrypt |
| criado_em | TIMESTAMP | Padrão `NOW()` |

**Tabela `chamados`**

| Coluna | Tipo | Observação |
| --- | --- | --- |
| id | SERIAL | Chave primária |
| usuario_id | INTEGER | FK → `usuarios(id)` |
| titulo | VARCHAR(200) | Obrigatório |
| descricao | TEXT | Obrigatório |
| departamento | VARCHAR(50) | TI, RH ou Financeiro |
| regiao | VARCHAR(50) | Sudeste, Sul ou Norte |
| responsavel | VARCHAR(150) | Obrigatório |
| status | VARCHAR(30) | Em aberto / Em análise / Resolvido |
| criado_em | TIMESTAMP | Padrão `NOW()` |
| atualizado_em | TIMESTAMP | Padrão `NOW()` |

O script completo de criação das tabelas está em [`sql/banco.sql`](sql/banco.sql).

---

## 📁 Estrutura do projeto

```
sistema-chamados/
├── index.html            # Página inicial
├── login.html            # Tela de login
├── cadastro.html         # Cadastro de usuário
├── recuperar-senha.html  # Recuperação de senha
├── dashboard.html        # Área do usuário logado
├── chamados.html         # Abertura e listagem de chamados
├── css/
│   └── style.css         # Estilos da aplicação
├── js/
│   └── app.js            # Validações, máscaras e chamadas AJAX
├── php/
│   ├── config.php        # Conexão PDO com o PostgreSQL
│   ├── auth.php          # Login, logout e verificação de sessão
│   ├── usuarios.php      # Cadastro e edição de usuários
│   └── chamados.php      # CRUD de chamados
└── sql/
    └── banco.sql         # Script de criação do banco
```

---

## ▶️ Como executar

1. Clone o repositório:
   ```bash
   git clone https://github.com/DaviSamuelFB/sistema-chamados.git
   ```
2. Crie o banco de dados no PostgreSQL e execute o script [`sql/banco.sql`](sql/banco.sql).
3. Ajuste as credenciais de conexão em [`php/config.php`](php/config.php) (host, porta, nome do banco, usuário e senha).
4. Sirva o projeto com o PHP embutido a partir da pasta do projeto:
   ```bash
   php -S localhost:8000
   ```
5. Acesse no navegador: [http://localhost:8000](http://localhost:8000)

> É necessário ter o **PHP** (com a extensão PDO_PGSQL) e o **PostgreSQL** instalados.

---

## 📩 Contato

Desenvolvido por **Davi Samuel Ferreira Bego**.

[![GitHub](https://img.shields.io/badge/GitHub-DaviSamuelFB-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/DaviSamuelFB)
