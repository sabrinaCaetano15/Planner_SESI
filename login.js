function toggleSenha() {
    const tipo = document.getElementById("tipo").value;

    document.getElementById("group-senha").style.display =
        tipo === "professor" ? "block" : "none";
}

// Versão atualizada e integrada com o seu Backend PHP
async function login() {
    const usuario = document.getElementById("usuario").value.trim();
    const senha = document.getElementById("senha").value;
    const tipo = document.getElementById("tipo").value;

    if (usuario.length < 3) {
        return alert("Digite um nome válido.");
    }

    try {
        // Dispara a requisição assíncrona para o seu arquivo api.php
        const resposta = await fetch("api.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                acao: "login", // Diz ao PHP que a intenção é fazer login
                usuario: usuario, 
                senha: senha, 
                tipo: tipo 
            })
        });

        // Transforma a resposta do PHP em um objeto legível para o JS
        const dados = await resposta.json();

        if (dados.sucesso) {
            // O Backend validou! Salva o objeto retornado pelo PHP na sessão local
            localStorage.setItem("usuarioLogado", JSON.stringify(dados.usuario));
            
            // Direciona o usuário para o Dashboard estabilizado
            window.location.href = "index.html";
        } else {
            // Se o aluno não existir ou a senha do prof estiver errada, exibe o aviso do PHP
            alert(dados.mensagem); 
        }

    } catch (erro) {
        console.error("Erro na requisição:", erro);
        alert("Não foi possível conectar ao backend PHP. Verifique se o Apache no XAMPP está ligado!");
    }
}