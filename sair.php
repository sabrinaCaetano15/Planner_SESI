<?php
session_start();
session_unset(); // Remove todas as variáveis da sessão
session_destroy(); // Destrói a sessão no servidor

// Redireciona de volta para a página de login
header("Location: login.php");
exit();
?>