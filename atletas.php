<?php

require_once "conexao.php";

header("Content-Type: application/json");

$metodo = $_SERVER["REQUEST_METHOD"];

/* ==========================
   LISTAR
========================== */

if($metodo=="GET"){

    $sql=$pdo->query("SELECT * FROM atletas ORDER BY nome");

    echo json_encode($sql->fetchAll(PDO::FETCH_ASSOC));

    exit;

}

/* ==========================
   RECEBE JSON
========================== */

$dados=json_decode(file_get_contents("php://input"),true);

$acao=$dados["acao"] ?? "";

/* ==========================
   INSERIR
========================== */

if($acao=="criar"){

    $sql=$pdo->prepare("

        INSERT INTO atletas
        (nome,turma,posicao,modalidade,sexo,evento)

        VALUES

        (?,?,?,?,?,?)

    ");

    $sql->execute([

        $dados["nome"],
        $dados["turma"],
        $dados["posicao"],
        $dados["modalidade"],
        $dados["sexo"],
        $dados["evento"]

    ]);

    echo json_encode([
        "sucesso"=>true
    ]);

    exit;

}

/* ==========================
   EXCLUIR
========================== */

if($acao=="excluir"){

    $sql=$pdo->prepare("DELETE FROM atletas WHERE id=?");

    $sql->execute([
        $dados["id"]
    ]);

    echo json_encode([
        "sucesso"=>true
    ]);

    exit;

}

/* ==========================
   EDITAR
========================== */

if($acao=="editar"){

    $sql=$pdo->prepare("

        UPDATE atletas

        SET

        nome=?,
        turma=?,
        posicao=?

        WHERE id=?

    ");

    $sql->execute([

        $dados["nome"],
        $dados["turma"],
        $dados["posicao"],
        $dados["id"]

    ]);

    echo json_encode([
        "sucesso"=>true
    ]);

    exit;

}