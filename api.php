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
        $usuario = $input['usuario'] ?? ''; 
        $senha = $input['senha'] ?? '';
        $tipo = $input['tipo'] ?? '';

        try {
            if ($tipo === 'professor') {
                if ($usuario === 'prof' && $senha === '123') {
                    echo json_encode([
                        'sucesso' => true,
                        'usuario' => [
                            'nome' => 'Prof. Jomar',
                            'tipo' => 'professor',
                            'cpf' => 'PROF'
                        ]
                    ]);
                } else {
                    echo json_encode(['sucesso' => false, 'mensagem' => 'Senha ou usuário do professor incorretos!']);
                }
            } else {
                $cpfLimpo = preg_replace('/\D/', '', $usuario);

                // Formata com pontos e traço caso o banco de dados exija a formatação exata
                $cpfFormatado = '';
                if (strlen($cpfLimpo) === 11) {
                    $cpfFormatado = substr($cpfLimpo, 0, 3) . '.' . 
                                    substr($cpfLimpo, 3, 3) . '.' . 
                                    substr($cpfLimpo, 6, 3) . '-' . 
                                    substr($cpfLimpo, 9, 2);
                }

                // Busca o aluno combinando o CPF puro ou formatado
                $sql = "SELECT nome, tipo, cpf, senha FROM usuarios WHERE (cpf = :cpfLimpo OR cpf = :cpfFormatado) AND tipo = 'aluno' LIMIT 1";
                $stmt = $pdo->prepare($sql);
                $stmt->bindParam(':cpfLimpo', $cpfLimpo);
                $stmt->bindParam(':cpfFormatado', $cpfFormatado);
                $stmt->execute();
                $aluno = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($aluno) {
                    // Confere se a senha condiz com o hash armazenado no BCrypt
                    if (!empty($aluno['senha']) && !password_verify($senha, $aluno['senha'])) {
                        echo json_encode(['sucesso' => false, 'mensagem' => 'Senha incorreta para este CPF!']);
                        exit;
                    }

                    echo json_encode([
                        'sucesso' => true,
                        'usuario' => [
                            'nome' => $aluno['nome'], 
                            'tipo' => 'aluno',
                            'cpf' => $aluno['cpf']
                        ]
                    ]);
                } else {
                    echo json_encode(['sucesso' => false, 'mensagem' => 'CPF não encontrado no banco de dados!']);
                }
            }
        } catch (PDOException $e) {
            echo json_encode(['sucesso' => false, 'mensagem' => 'Erro no servidor: ' . $e->getMessage()]);
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
