function toggleSenha() {
    const tipo = document.getElementById("tipo").value;

    document.getElementById("group-senha").style.display =
        tipo === "professor" ? "block" : "none";
}

function login() {

    const usuario = document.getElementById("usuario").value.trim();
    const senha = document.getElementById("senha").value;
    const tipo = document.getElementById("tipo").value;

    if (usuario.length < 3) {
        return alert("Digite um nome válido.");
    }

    // LOGIN PROFESSOR
    if (tipo === "professor") {

        if (usuario === "prof" && senha === "123") {

            const dadosProfessor = {
                nome: "Prof. Marcos",
                tipo: "professor",
                cpf: "PROF001"
            };

            localStorage.setItem(
                "usuarioLogado",
                JSON.stringify(dadosProfessor)
            );

            window.location.href = "index.html";

        } else {
            alert("Usuário ou senha incorretos!");
        }

    } 
    
    // LOGIN ALUNO
    else {

        const dadosAluno = {
            nome: usuario,
            tipo: "aluno",
            cpf: "ALUNO_" + usuario
        };

        localStorage.setItem(
            "usuarioLogado",
            JSON.stringify(dadosAluno)
        );

        window.location.href = "index.html";
    }
}
