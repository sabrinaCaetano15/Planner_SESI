(function aplicarTemaSalvo() {
    const temaSalvo = localStorage.getItem("temaEscuro");
    if (temaSalvo === "ativo") {
        document.documentElement.setAttribute("data-theme", "dark");
    }
})();

function toggleDarkMode() {
    const htmlElement = document.documentElement;
    const btn = document.getElementById("darkModeBtn");
    
    if (htmlElement.getAttribute("data-theme") === "dark") {
        htmlElement.removeAttribute("data-theme");
        localStorage.setItem("temaEscuro", "inativo");
        if (btn) btn.innerText = "🌙";
    } else {
        htmlElement.setAttribute("data-theme", "dark");
        localStorage.setItem("temaEscuro", "ativo");
        if (btn) btn.innerText = "☀️";
    }
}

function inicializarTemaBotao() {
    const btnDark = document.getElementById("darkModeBtn");
    if (btnDark) {
        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        btnDark.innerText = isDark ? "☀️" : "🌙";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    inicializarTemaBotao();

    if (!document.getElementById("tabela-alunos")) return;

    const dadosUsuario = localStorage.getItem("usuarioLogado");
    eventoAtual = localStorage.getItem("eventoSelecionado");

    if (!eventoAtual) {
        alert("Por favor, selecione um evento primeiro.");
        window.location.href = "eventos.html";
        return;
    }
    
    if (!dadosUsuario) {
        alert("Acesso negado. Por favor, faça login.");
        window.location.href = "login.html";
        return;
    }

    usuarioLogado = JSON.parse(dadosUsuario);
    document.getElementById("nomeEventoAtual").innerText = eventoAtual;
    
    configurarPerfilInterface();
    configurarEventosFiltros();
    atualizarDashboard();
    inicializarPlacarDashboard();
});

let usuarioLogado = null;
let modalidadeAtiva = "Vôlei";
let sexoAtivo = "Masculino";
let eventoAtual = "";
let atletas = JSON.parse(localStorage.getItem("atletasInscritos")) || [];

function configurarPerfilInterface() {
    document.getElementById("nomeExibicao").innerText = usuarioLogado.nome;
    const isProf = usuarioLogado.tipo === "professor";
    document.getElementById("formProfessor").style.display = isProf ? "grid" : "none";
    document.getElementById("btnInscricaoAluno").style.display = isProf ? "none" : "block";
}

function configurarEventosFiltros() {
    document.querySelectorAll(".cards .card").forEach(card => {
        card.addEventListener("click", (e) => {
            document.querySelectorAll(".cards .card").forEach(c => c.classList.remove("active"));
            e.target.classList.add("active");
            modalidadeAtiva = e.target.innerText;
            atualizarDashboard();
        });
    });

    document.querySelectorAll(".sexo-toggle .sexo-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll(".sexo-toggle .sexo-btn").forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            sexoAtivo = e.target.innerText;
            atualizarDashboard();
        });
    });
}

function atualizarDashboard() {
    renderTabela();
    
    const totalCategoria = atletas.filter(a => a.evento === eventoAtual && a.modalidade === modalidadeAtiva && a.sexo === sexoAtivo).length;
    document.getElementById("contador").innerText = `${totalCategoria}/12 jogadores`;

    const totalInscritosGeral = atletas.filter(a => a.evento === eventoAtual).length;
    document.getElementById("totalGeral").innerText = totalInscritosGeral;
    document.getElementById("vagasRestantes").innerText = Math.max(0, 48 - totalInscritosGeral);
}

function renderTabela() {
    const tbody = document.getElementById("tabela-alunos");
    const buscaTexto = document.getElementById("busca").value.toLowerCase();
    tbody.innerHTML = "";

    const atletasFiltrados = atletas.filter(a => {
        const escopoCorreto = a.evento === eventoAtual && a.modalidade === modalidadeAtiva && a.sexo === sexoAtivo;
        const buscaCorreta = a.nome.toLowerCase().includes(buscaTexto) || a.turma.toLowerCase().includes(buscaTexto);
        return escopoCorreto && buscaCorreta;
    });

    atletasFiltrados.forEach(atleta => {
        const tr = document.createElement("tr");
        const classeBadge = atleta.posicao.toLowerCase() === "titular" ? "titular" : "reserva";
        const podeDeletar = usuarioLogado.tipo === "professor" || usuarioLogado.nome === atleta.criadorInscricao;

        tr.innerHTML = `
            <td><strong>${atleta.nome}</strong></td>
            <td>${atleta.turma}</td>
            <td><span class="badge ${classeBadge}">${atleta.posicao}</span></td>
            <td style="text-align:right">
                ${podeDeletar ? `<button onclick="removerAtleta(${atleta.id})" class="action-btn" style="background:none; border:none; cursor:pointer; color:var(--vermelho)">🗑️</button>` : `<span style="color:#94a3b8; font-size:0.8rem;">Bloqueado</span>`}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function adicionarAluno() {
    let nome, turma, posicao, criadorInscricao;

    if (usuarioLogado.tipo === "professor") {
        nome = document.getElementById("nomeAluno").value.trim();
        turma = document.getElementById("turmaAluno").value.trim();
        posicao = document.getElementById("posicaoAluno").value;
        criadorInscricao = "PROFESSOR";
        if (!nome || !turma) return alert("Preencha todos os campos!");
    } else {
        nome = usuarioLogado.nome;
        criadorInscricao = usuarioLogado.nome;
        posicao = "Reserva";

        const jaInscrito = atletas.some(a => a.evento === eventoAtual && a.criadorInscricao === criadorInscricao && a.modalidade === modalidadeAtiva && a.sexo === sexoAtivo);
        if (jaInscrito) return alert("Você já está inscrito nesta modalidade para este evento!");

        const inputTurma = prompt("Digite a sua turma (Ex: 1º Ano A):");
        if (!inputTurma || inputTurma.trim() === "") return alert("Inscrição cancelada. A turma é obrigatória!");
        turma = inputTurma.trim();
    }

    const totalCategoria = atletas.filter(a => a.evento === eventoAtual && a.modalidade === modalidadeAtiva && a.sexo === sexoAtivo).length;
    if (totalCategoria >= 12) return alert("Modalidade lotada nesta categoria (máx 12 atletas)!");

    atletas.push({ 
        id: Date.now(), 
        nome, 
        turma, 
        posicao, 
        modalidade: modalidadeAtiva, 
        sexo: sexoAtivo, 
        criadorInscricao, 
        evento: eventoAtual 
    });
    
    localStorage.setItem("atletasInscritos", JSON.stringify(atletas));
    atualizarDashboard();

    if (usuarioLogado.tipo === "professor") {
        document.getElementById("nomeAluno").value = "";
        document.getElementById("turmaAluno").value = "";
    } else {
        alert("Inscrição realizada com sucesso!");
    }
}

function removerAtleta(id) {
    if (confirm("Deseja realmente remover este atleta?")) {
        atletas = atletas.filter(a => a.id !== id);
        localStorage.setItem("atletasInscritos", JSON.stringify(atletas));
        atualizarDashboard();
    }
}

function logout() {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "login.html";
}

// --- SISTEMA DE CONTROLE EXCLUSIVO DO PLACAR NO DASHBOARD ---
function inicializarPlacarDashboard() {
    const evento = localStorage.getItem("eventoSelecionado") || "Geral";
    const placaresPadrao = { "Interclasse": "0 x 0", "Intersesi": "0 x 0" };
    const placares = JSON.parse(localStorage.getItem("placaresEventos")) || placaresPadrao;
    
    const placarElement = document.getElementById("placarDashboard");
    if (placarElement) {
        placarElement.innerText = placares[evento] || "0 x 0";
    }

    const btnEditar = document.getElementById("btnEditarPlacarDash");
    if (btnEditar && usuarioLogado && usuarioLogado.tipo === "professor") {
        btnEditar.style.display = "block";
    }
}

function editarPlacarDashboard() {
    const evento = localStorage.getItem("eventoSelecionado") || "Geral";
    const placaresPadrao = { "Interclasse": "0 x 0", "Intersesi": "0 x 0" };
    const placares = JSON.parse(localStorage.getItem("placaresEventos")) || placaresPadrao;
    
    const novoPlacar = prompt(`Digite o novo placar para o evento ${evento}:`, placares[evento] || "0 x 0");
    
    if (novoPlacar !== null && novoPlacar.trim() !== "") {
        placares[evento] = novoPlacar.trim();
        localStorage.setItem("placaresEventos", JSON.stringify(placares));
        
        const placarElement = document.getElementById("placarDashboard");
        if (placarElement) {
            placarElement.innerText = novoPlacar.trim();
        }
    }
}
