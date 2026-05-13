<?php
// O arquivo de cadastro inicial não deve ter travas de login, senão você não consegue criar o primeiro usuário!
require_once 'conexao.php';

// --- CONFIGURAÇÃO DE TESTE (Mude aqui para testar) ---
$nome = "Lucas Aluno";
$cpf = "111.111.111-11";
$turma = "3º Ano B";
$tipo = "aluno"; // Altere para 'professor' quando for testar o Passo 2
// -----------------------------------------------------

$email = null;
$senha_criptografada = null;

// Se NÃO for aluno, define e-mail e senha com hash de segurança
if ($tipo !== 'aluno') {
    $email = "joao@sistema.com"; // E-mail padrão para professores/influencers
    $senha_pura = "senha123";
    $senha_criptografada = password_hash($senha_pura, PASSWORD_BCRYPT);
}

try {
    $sql = "INSERT INTO usuarios (nome, cpf, turma, tipo, email, senha) 
            VALUES (:nome, :cpf, :turma, :tipo, :email, :senha)";
            
    $stmt = $pdo->prepare($sql);
    
    $stmt->bindParam(':nome', $nome);
    $stmt->bindParam(':cpf', $cpf);
    $stmt->bindParam(':turma', $turma);
    $stmt->bindParam(':tipo', $tipo);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':senha', $senha_criptografada);
    
    $stmt->execute();
    echo "Usuário ({$nome} - {$tipo}) cadastrado com sucesso!<br>";
    
} catch (PDOException $e) {
    echo "Erro ao cadastrar: " . $e->getMessage();
}
?>

