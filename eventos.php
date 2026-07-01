<?php

require_once 'conexao.php';

header('Content-Type: application/json');

$metodo = $_SERVER['REQUEST_METHOD'];


//==============================
// LISTAR EVENTOS
//==============================

if($metodo == "GET"){

    $sql = "SELECT * FROM eventos ORDER BY data_inicio";

    $stmt = $pdo->query($sql);

    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

    exit;
}


//==============================
// CRIAR EVENTO
//==============================

$dados = json_decode(file_get_contents("php://input"),true);

$acao = $dados["acao"] ?? "";


if($acao=="criar"){

    $sql = $pdo->prepare("

    INSERT INTO eventos

    (nome,descricao,local,data_inicio,data_fim,status)

    VALUES

    (?,?,?,?,?,?)

    ");

    $sql->execute([

        $dados["nome"],
        "",
        $dados["local"],
        $dados["inicio"],
        $dados["fim"],
        "Aberto"

    ]);

    echo json_encode(["sucesso"=>true]);

    exit;

}



//==============================
// EXCLUIR
//==============================

if($acao=="excluir"){

    $sql=$pdo->prepare("DELETE FROM eventos WHERE id=?");

    $sql->execute([$dados["id"]]);

    echo json_encode(["sucesso"=>true]);

    exit;

}



//==============================
// EDITAR
//==============================

if($acao=="editar"){

    $sql=$pdo->prepare("

    UPDATE eventos

    SET

    nome=?,

    local=?,

    data_inicio=?,

    data_fim=?

    WHERE id=?

    ");

    $sql->execute([

        $dados["nome"],
        $dados["local"],
        $dados["inicio"],
        $dados["fim"],
        $dados["id"]

    ]);

    echo json_encode(["sucesso"=>true]);

}