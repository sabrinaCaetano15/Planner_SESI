<?php
$host = "localhost";
$banco = "sistema_esportivo";
$usuario = "root"; // Altere se o seu usuário do MySQL for diferente
$senha = "";     

try {
    // Cria a conexão com o banco usando PDO
    $pdo = new PDO("mysql:host=$host;dbname=$banco;charset=utf8mb4", $usuario, $senha);
    
    // Configura o PDO para lançar erros em caso de falhas nas consultas SQL
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // Se a conexão falhar, exibe o erro e para a execução
    die("Erro ao conectar ao banco de dados: " . $e->getMessage());
}
?>
