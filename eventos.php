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

(nome,descricao,inicio_inscricao,fim_inscricao,local,data_inicio,data_fim,status)

VALUES

(?,?,?,?,?,?,?,?)
    ");

    $sql->execute([

$dados["nome"],
$dados["descricao"],
$dados["inicio_inscricao"],
$dados["fim_inscricao"],
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

    if(
        empty($dados["id"]) ||
        empty($dados["nome"]) ||
        empty($dados["local"]) ||
        empty($dados["inicio"]) ||
        empty($dados["fim"])
    ){

        echo json_encode([
            "sucesso"=>false,
            "mensagem"=>"Dados inválidos."
        ]);

        exit;

    }

    $sql = $pdo->prepare("

       UPDATE eventos

SET

nome = ?,
descricao = ?,
inicio_inscricao = ?,
fim_inscricao = ?,
local = ?,
data_inicio = ?,
data_fim = ?

WHERE id = ?

    ");

    $sql->execute([

$dados["nome"],
$dados["descricao"],
$dados["inicio_inscricao"],
$dados["fim_inscricao"],
$dados["local"],
$dados["inicio"],
$dados["fim"],
$dados["id"]

]);

    echo json_encode([
        "sucesso"=>true
    ]);

    exit;

}