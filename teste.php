<?php
echo "<h2>Teste de conexão PostgreSQL</h2>";

// Verifica se PDO pgsql está disponível
if (!extension_loaded('pdo_pgsql')) {
    echo "<p style='color:red'>❌ Extensão pdo_pgsql NÃO está carregada!</p>";
} else {
    echo "<p style='color:green'>✅ Extensão pdo_pgsql carregada!</p>";
}

// Tenta conectar
try {
    $pdo = new PDO(
        'pgsql:host=localhost;port=5432;dbname=sistema_chamados',
        'postgres',
        '123456'
    );
    echo "<p style='color:green'>✅ Conexão com PostgreSQL OK!</p>";
} catch (PDOException $e) {
    echo "<p style='color:red'>❌ Erro: " . $e->getMessage() . "</p>";
}
?>