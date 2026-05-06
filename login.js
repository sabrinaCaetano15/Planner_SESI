function toggleSenha() {
    const tipo = document.getElementById("tipo").value;
    document.getElementById("group-senha").style.display = tipo === "professor" ? "block" : "none";
}

function login() {
    const usuario = document.getElementById("usuario").value.trim();
    const senha = document.getElementById("senha").value;
    const tipo = document.getElementById("tipo").value;

    if (usuario.length < 3) return alert("Por favor, digite um nome válido.");

    if (tipo === "professor") {
        if (usuario === "prof" && senha === "123") {
            localStorage.setItem("tipo", "professor");
            window.location.href = "index.html";
        } else { alert("Senha ou usuário de professor incorreta!"); }
    } else {
        localStorage.setItem("tipo", "aluno");
        localStorage.setItem("nomeAlunoLogado", usuario);
        window.location.href = "index.html";
    }
}
