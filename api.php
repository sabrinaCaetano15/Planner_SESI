<?php
session_start();
require_once 'conexao.php';

header('Content-Type: application/json');

// Se for uma requisição para salvar um novo atleta
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $acao = $input['acao'] ?? '';

    if ($acao === 'salvar') {
        try {
            // Cria um CPF fictício automático baseado no tempo para não dar erro de CPF duplicado no banco
            $cpf_ficticio = "999." . rand(100, 999) . "." . rand(100, 999) . "-" . rand(10, 99);
            
            // Insere o atleta direto na tabela de USUARIOS como 'aluno'
            $sql = "INSERT INTO usuarios (nome, cpf, turma, tipo) VALUES (:nome, :cpf, :turma, 'aluno')";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':nome', $input['nome']);
            $stmt->bindParam(':cpf', $cpf_ficticio);
            $stmt->bindParam(':turma', $input['turma']);
            $stmt->execute();
            
            echo json_encode(['sucesso' => true]);
        } catch (PDOException $e) {
            echo json_encode(['sucesso' => false, 'erro' => $e->getMessage()]);
        }
    }
    exit;
}

// Se for apenas listagem (Requisição GET)
try {
    $sql = "SELECT nome, tipo, cpf FROM usuarios";
    $stmt = $pdo->query($sql);
    $atletas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($atletas);
} catch (PDOException $e) {
    echo json_encode([]);
}
?>
