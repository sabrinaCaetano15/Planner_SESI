<?php
session_start();

// Se o usuário não tiver uma sessão ativa, barra o acesso
if (!isset($_SESSION['usuario_id'])) {
    die("Acesso negado! Você precisa fazer login primeiro.");
}

// Se chegou aqui, deu certo!
echo "<h1>Área Restrita do Sistema</h1>";
echo "Parabéns! O Back-end validou sua sessão.<br>";
echo "ID do Usuário Logado: " . $_SESSION['usuario_id'] . "<br>";
echo "Nome do Usuário: " . $_SESSION['usuario_nome'] . "<br>";
echo "Tipo de Conta: " . $_SESSION['usuario_tipo'] . "<br>";
echo "<a href='sair.php'>Sair do Sistema</a>";
?>