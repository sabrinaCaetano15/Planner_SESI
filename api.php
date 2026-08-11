<?php

session_start();
require_once "conexao.php";

header("Content-Type: application/json");

$input = json_decode(file_get_contents("php://input"), true);

$acao = $input["acao"] ?? "";



/* ==========================================================
   LOGIN
========================================================== */

if ($acao == "login") {

    $usuario = trim($input["usuario"] ?? "");
    $senha = $input["senha"] ?? "";
    $tipo = $input["tipo"] ?? "";

    try {

        if ($tipo == "aluno") {

            $cpf = preg_replace('/\D/', '', $usuario);

            $sql = "SELECT *
                    FROM usuarios
                    WHERE cpf = ?
                    LIMIT 1";

            $stmt = $pdo->prepare($sql);
            $stmt->execute([$cpf]);

        } else {

            $sql = "SELECT *
                    FROM usuarios
                    WHERE nome = ?
                    AND tipo = ?
                    LIMIT 1";

            $stmt = $pdo->prepare($sql);
            $stmt->execute([$usuario,$tipo]);

        }

        $usuarioBanco = $stmt->fetch(PDO::FETCH_ASSOC);

        if(!$usuarioBanco){

            echo json_encode([
                "sucesso"=>false,
                "mensagem"=>"Usuário não encontrado."
            ]);

            exit;

        }

        if(!password_verify($senha,$usuarioBanco["senha"])){

            echo json_encode([
                "sucesso"=>false,
                "mensagem"=>"Senha incorreta."
            ]);

            exit;

        }

        $_SESSION["usuario"]=$usuarioBanco["id"];

        echo json_encode([
            "sucesso"=>true,
            "usuario"=>$usuarioBanco
        ]);

    } catch(PDOException $e){

        echo json_encode([
            "sucesso"=>false,
            "mensagem"=>$e->getMessage()
        ]);

    }

    exit;
}

/* ==========================================================
   INSCREVER EM EVENTO
========================================================== */

if ($acao == "inscreverEvento") {

    $idUsuario = $input["id_usuario"] ?? 0;
    $idEvento  = $input["id_evento"] ?? 0;

    if (!$idUsuario || !$idEvento) {

        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Dados inválidos."
        ]);

        exit;
    }

    // Verifica se já está inscrito
    $sql = $pdo->prepare("
        SELECT id
        FROM inscricoes
        WHERE id_usuario = ?
        AND id_evento = ?
    ");

    $sql->execute([$idUsuario, $idEvento]);

    if ($sql->fetch()) {

        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Você já está inscrito neste evento."
        ]);

        exit;
    }

    // Cria inscrição
    $sql = $pdo->prepare("
        INSERT INTO inscricoes
        (id_usuario,id_evento)
        VALUES (?,?)
    ");

    $sql->execute([
        $idUsuario,
        $idEvento
    ]);

    echo json_encode([
        "sucesso" => true
    ]);

    exit;

}

/* ==========================================================
   CADASTRAR ALUNO
========================================================== */

if ($acao == "cadastrar_aluno") {

    $nome = trim($input["nome"] ?? "");
    $cpf = preg_replace('/\D/', '', $input["cpf"] ?? "");
    $rg = trim($input["rg"] ?? "");
    $nascimento = $input["data_nascimento"] ?? "";
    $sexo = $input["sexo"] ?? "";
    $senha = $input["senha"] ?? "";

    $senhaHash = password_hash($senha,PASSWORD_DEFAULT);

    try{

        $sql="INSERT INTO usuarios
        (nome,cpf,rg,data_nascimento,sexo,senha,tipo)

        VALUES

        (?,?,?,?,?,?,'aluno')";

        $stmt=$pdo->prepare($sql);

        $stmt->execute([

            $nome,
            $cpf,
            $rg,
            $nascimento,
            $sexo,
            $senhaHash

        ]);

        echo json_encode([
            "sucesso"=>true
        ]);

    }catch(PDOException $e){

        echo json_encode([
            "sucesso"=>false,
            "mensagem"=>$e->getMessage()
        ]);

    }

    exit;

}

/* ==========================================================
   LISTAR MODALIDADES DO EVENTO
========================================================== */

if ($acao == "listar_modalidades") {

    $idEvento = $input["id_evento"] ?? 0;

    try {

        $sql = $pdo->prepare("
            SELECT *
            FROM modalidades
            WHERE id_evento = ?
            ORDER BY nome, sexo
        ");

        $sql->execute([$idEvento]);

        echo json_encode([
            "sucesso" => true,
            "modalidades" => $sql->fetchAll(PDO::FETCH_ASSOC)
        ]);

    } catch(PDOException $e){

        echo json_encode([
            "sucesso" => false,
            "mensagem" => $e->getMessage()
        ]);

    }

    exit;
}

/* ==========================================================
   SALVAR MODALIDADES
========================================================== */

if ($acao == "salvar_modalidades") {

    $modalidades = $input["modalidades"] ?? [];

    try {

        $sql = $pdo->prepare("
            UPDATE modalidades
            SET ativa = ?
            WHERE id = ?
        ");

        foreach ($modalidades as $modalidade) {

            $sql->execute([
                $modalidade["ativa"],
                $modalidade["id"]
            ]);

        }

        echo json_encode([
            "sucesso" => true
        ]);

    } catch (PDOException $e) {

        echo json_encode([
            "sucesso" => false,
            "mensagem" => $e->getMessage()
        ]);

    }

    exit;
}
/* ==========================================================
   ADICIONAR MODALIDADE
========================================================== */

if ($acao == "adicionar_modalidade") {

    $nome = trim($input["nome"] ?? "");
    $sexo = trim($input["sexo"] ?? "");
    $maximo = intval($input["maximo"] ?? 12);
    $idEvento = intval($input["id_evento"] ?? 0);

    if ($nome == "") {

        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Informe o nome da modalidade."
        ]);

        exit;
    }

    try {

        $sql = $pdo->prepare("
            INSERT INTO modalidades
            (id_evento, nome, sexo, max_participantes, ativa)

            VALUES (?, ?, ?, ?, 1)
        ");

        $sql->execute([
            $idEvento,
            $nome,
            $sexo,
            $maximo
        ]);

        echo json_encode([
            "sucesso" => true
        ]);

    } catch(PDOException $e){

        echo json_encode([
            "sucesso"=>false,
            "mensagem"=>$e->getMessage()
        ]);

    }

    exit;
}
/* ==========================================================
   EXCLUIR MODALIDADE
========================================================== */

if ($acao == "excluir_modalidade") {

    $id = $input["id"] ?? 0;

    try {

        $sql = $pdo->prepare("
            DELETE FROM modalidades
            WHERE id = ?
        ");

        $sql->execute([$id]);

        echo json_encode([
            "sucesso" => true
        ]);

    } catch (PDOException $e) {

        echo json_encode([
            "sucesso" => false,
            "mensagem" => $e->getMessage()
        ]);

    }

    exit;

}
/* ==========================================================
   LISTAR USUÁRIOS
========================================================== */

try{

    $usuarios=$pdo
        ->query("SELECT * FROM usuarios")
        ->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($usuarios);

}catch(PDOException $e){

    echo json_encode([]);

}
?>