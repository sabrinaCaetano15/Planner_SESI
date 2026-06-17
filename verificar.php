<?php
// Inclui a sua conexão correta
require_once 'conexao.php';

try {
    // Busca os usuários usando o PDO
    $sql = "SELECT nome, tipo, cpf FROM usuarios";
    $stmt = $pdo->query($sql);
    
    echo "<h2>Usuários Cadastrados no Banco:</h2>";
    
    // Lista os resultados na tela
    while ($linha = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "Nome: <strong>" . $linha['nome'] . "</strong> | ";
        echo "Tipo: " . $linha['tipo'] . " | ";
        echo "CPF: " . $linha['cpf'] . "<br>";
        echo "-----------------------------------<br>";
    }

} catch (PDOException $e) {
    echo "Erro ao buscar dados: " . $e->getMessage();
}
?>

