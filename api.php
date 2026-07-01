<?php
session_start();
require_once 'conexao.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $acao = $input['acao'] ?? '';

    // ==========================================
    // ROTA: LOGIN VIA BACKEND
    // ==========================================
    if ($acao === 'login') {

    $usuario = trim($input['usuario'] ?? '');
    $senha = $input['senha'] ?? '';
    $tipo = $input['tipo'] ?? '';

    try {

        if ($tipo === "aluno") {

            // Aluno faz login pelo CPF
            $cpf = preg_replace('/\D/', '', $usuario);

            $sql = "SELECT id, nome, cpf, senha, tipo
                    FROM usuarios
                    WHERE cpf = :usuario
                    AND tipo = 'aluno'
                    LIMIT 1";

        } else {

            // Professor (e futuramente admin) faz login pelo nome
            $sql = "SELECT id, nome, cpf, senha, tipo
                    FROM usuarios
                    WHERE nome = :usuario
                    AND tipo = :tipo
                    LIMIT 1";
        }

        $stmt = $pdo->prepare($sql);

        if ($tipo === "aluno") {
            $stmt->bindValue(":usuario", $cpf);
        } else {
            $stmt->bindValue(":usuario", $usuario);
            $stmt->bindValue(":tipo", $tipo);
        }

        $stmt->execute();

        $dados = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$dados) {

            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Usuário não encontrado."
            ]);

            exit;
        }

        if (!password_verify($senha, $dados["senha"])) {

            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Senha incorreta."
            ]);

            exit;
        }

        $_SESSION["usuario"] = $dados["id"];

        echo json_encode([
            "sucesso" => true,
            "usuario" => [
                "id" => $dados["id"],
                "nome" => $dados["nome"],
                "cpf" => $dados["cpf"],
                "tipo" => $dados["tipo"]
            ]
        ]);

    } catch (PDOException $e) {

        echo json_encode([
            "sucesso" => false,
            "mensagem" => $e->getMessage()
        ]);
    }

    exit;
}
    // ==========================================
    // ROTA: REGISTRAR CONTA DE ALUNO
    // ==========================================
    if ($acao === 'cadastrar_aluno') {
        $nome = $input['nome'] ?? '';
        $cpfRaw = $input['cpf'] ?? '';
        $senhaPura = $input['senha'] ?? '';

        // Limpa a string do CPF mantendo apenas dígitos antes de salvar no banco
        $cpfLimpo = preg_replace('/\D/', '', $cpfRaw);

        // Gera o hash seguro com BCrypt para a senha do aluno
        $senhaHash = password_hash($senhaPura, PASSWORD_BCRYPT);

        try {
            $sql = "INSERT INTO usuarios (nome, cpf, tipo, senha) VALUES (:nome, :cpf, 'aluno', :senha)";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':nome', $nome);
            $stmt->bindParam(':cpf', $cpfLimpo);
            $stmt->bindParam(':senha', $senhaHash);
            $stmt->execute();

            echo json_encode(['sucesso' => true]);
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                echo json_encode(['sucesso' => false, 'mensagem' => 'Este CPF já está cadastrado no sistema!']);
            } else {
                echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao salvar no banco: ' . $e->getMessage()]);
            }
        }
        exit;
    }
}

// Se receber requisições do tipo GET, lista os usuários cadastrados
try {
    $sql = "SELECT nome, tipo, cpf FROM usuarios";
    $stmt = $pdo->query($sql);
    $atletas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($atletas);
} catch (PDOException $e) {
    echo json_encode([]);
}
?>
