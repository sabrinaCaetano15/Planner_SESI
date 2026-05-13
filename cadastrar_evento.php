<?php
session_start();
require_once 'conexao.php';

// 1. PROTEÇÃO DE ROTA: Apenas usuários logados e que NÃO sejam alunos podem criar eventos
if (!isset($_SESSION['usuario_id']) || $_SESSION['usuario_tipo'] === 'aluno') {
    die("Erro: Acesso negado. Apenas professores ou influencers podem cadastrar eventos.");
}

// 2. DADOS DE TESTE (Simulando o que viria de um formulário)
$nome_evento = "Jogos Escolares SESI 2026";
$local_evento = "Quadra Coberta - Bloco B";
$data_evento = "2026-06-15"; // Formato padrão do MySQL: AAAA-MM-DD

// Lista de modalidades que serão criadas automaticamente vinculadas a este evento
$modalidades = ["Futsal Masculino", "Voleibol Misto", "Handebol Feminino"];

try {
    // Inicia uma Transação no banco (Garante que se um insert falhar, desfaz tudo)
    $pdo->beginTransaction();

    // 3. INSERIR O EVENTO
    $sql_evento = "INSERT INTO eventos (nome, local, data) VALUES (:nome, :local, :data)";
    $stmt_evento = $pdo->prepare($sql_evento);
    $stmt_evento->bindParam(':nome', $nome_evento);
    $stmt_evento->bindParam(':local', $local_evento);
    $stmt_evento->bindParam(':data', $data_evento);
    $stmt_evento->execute();

    // Recupera o ID do evento que acabou de ser gerado no banco de dados
    $id_evento_criado = $pdo->lastInsertId();

    // 4. INSERIR AS MODALIDADES VINCULADAS AO EVENTO
    $sql_modalidade = "INSERT INTO modalidades (nome, id_evento) VALUES (:nome_mod, :id_eve)";
    $stmt_mod = $pdo->prepare($sql_modalidade);

    foreach ($modalidades as $nome_da_modalidade) {
        $stmt_mod->bindParam(':nome_mod', $nome_da_modalidade);
        $stmt_mod->bindParam(':id_eve', $id_evento_criado);
        $stmt_mod->execute();
    }

    // Confirma todas as inserções no banco de dados de uma vez só
    $pdo->commit();
    
    echo "Sucesso: O evento '{$nome_evento}' e suas modalidades foram cadastrados com sucesso!";

} catch (PDOException $e) {
    // Se algo der errado, desfaz as alterações para não corromper o banco
    $pdo->rollBack();
    echo "Erro ao cadastrar evento e modalidades: " . $e->getMessage();
}
?>
