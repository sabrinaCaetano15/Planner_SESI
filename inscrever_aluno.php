<?php
session_start();
require_once 'conexao.php';

// 1. PROTEÇÃO DE ROTA: Só quem está logado e é ALUNO pode se inscrever
if (!isset($_SESSION['usuario_id']) || $_SESSION['usuario_tipo'] !== 'aluno') {
    die("Erro: Acesso negado. Apenas alunos logados podem se inscrever em modalidades.");
}

// 2. DADOS DE TESTE (Simulando o ID do esporte escolhido na tela)
// Como você rodou o 'cadastrar_evento.php', o banco gerou as modalidades com IDs (ex: 1, 2 ou 3)
$id_usuario_logado = $_SESSION['usuario_id']; // Pega o ID automaticamente da sessão do Lucas
$id_modalidade_escolhida = 1; // ID do Futsal Masculino no banco de dados

try {
    // 3. VALIDAÇÃO ANTECIPADA: Verifica se o aluno já está inscrito nesta modalidade
    $sql_checar = "SELECT id FROM inscricoes WHERE id_usuario = :id_user AND id_modalidade = :id_mod";
    $stmt_checar = $pdo->prepare($sql_checar);
    $stmt_checar->bindParam(':id_user', $id_usuario_logado);
    $stmt_checar->bindParam(':id_mod', $id_modalidade_escolhida);
    $stmt_checar->execute();

    if ($stmt_checar->rowCount() > 0) {
        die("Aviso: Você já está inscrito nesta modalidade esportiva!");
    }

    // 4. EFETUAR A INSCRIÇÃO
    $sql_inscricao = "INSERT INTO inscricoes (id_usuario, id_modalidade) VALUES (:id_user, :id_mod)";
    $stmt_ins = $pdo->prepare($sql_inscricao);
    $stmt_ins->bindParam(':id_user', $id_usuario_logado);
    $stmt_ins->bindParam(':id_mod', $id_modalidade_escolhida);
    $stmt_ins->execute();

    echo "Sucesso: Parabéns {$_SESSION['usuario_nome']}, sua inscrição na modalidade foi realizada!";

} catch (PDOException $e) {
    echo "Erro ao processar inscrição: " . $e->getMessage();
}
?>