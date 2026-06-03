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
        btnDark.innerText = document.documentElement.getAttribute("data-theme") === "dark" ? "☀️" : "🌙";
    }
}

let usuarioLogado = null;
let modalidadeAtiva = "Vôlei";
let sexoAtivo = "Masculino";
let eventoAtual = "";
let atletas = [];

document.addEventListener("DOMContentLoaded", () => {
    inicializarTemaBotao();
    if (!document.getElementById("tabela-alunos")) return;

    // --- CORREÇÃO DO RECONHECIMENTO DE LOGIN ---
    // Verifica tanto o formato de Objeto Estruturado quanto os dados Simples do novo Login
    let dadosUsuario = localStorage.getItem("usuarioLogado");
    const tipoSimples = localStorage.getItem("tipo");
    const nomeSimples = localStorage.getItem("nomeAlunoLogado");

    if (!dadosUsuario && tipoSimples) {
        // Reconstrói o objeto esperado pelo sistema caso venha do novo login sem senha
        const nomeFormatado = tipoSimples === "professor" ? "Prof. Marcos" : (nomeSimples || "Aluno");
        const cpfFormatado = tipoSimples === "professor" ? "PROF" : "ALUNO_SEM_CPF";
        
        const backupSession = { nome: nomeFormatado, tipo: tipoSimples, cpf: cpfFormatado };
        localStorage.setItem("usuarioLogado", JSON.stringify(backupSession));
        dadosUsuario = JSON.stringify(backupSession);
    }

    eventoAtual = localStorage.getItem("eventoSelecionado") || "Interclasse";

    if (!dadosUsuario) {
        alert("Acesso negado. Por favor, faça login.");
        window.location.href = "login.html";
        return;
    }

    usuarioLogado = JSON.parse(dadosUsuario);
    atletas = JSON.parse(localStorage.getItem("atletasInscritos")) || [];
    
    const elemEvento = document.getElementById("nomeEventoAtual");
    if (elemEvento) elemEvento.innerText = eventoAtual;
    
    configurarPerfilInterface();
    configurarEventosFiltros();
    atualizarDashboard();
    atualizarPlacarInterface();
});

function configurarPerfilInterface() {
    if (!usuarioLogado) return;
    const elemExibicao = document.getElementById("nomeExibicao");
    if (elemExibicao) elemExibicao.innerText = usuarioLogado.nome;
    
    const isProf = usuarioLogado.tipo === "professor";
    
    const formProf = document.getElementById("formProfessor");
    if (formProf) formProf.style.display = isProf ? "grid" : "none";
    
    const btnInsc = document.getElementById("btnInscricaoAluno");
    if (btnInsc) btnInsc.style.display = isProf ? "none" : "block";
    
    const painelControles = document.getElementById("controlesPlacar");
    if (painelControles) {
        painelControles.style.display = isProf ? "flex" : "none";
    }
}

function configurarEventosFiltros() {
    document.querySelectorAll(".cards .card").forEach(card => {
        card.addEventListener("click", (e) => {
            document.querySelectorAll(".cards .card").forEach(c => c.classList.remove("active"));
            e.target.classList.add("active");
            modalidadeAtiva = e.target.innerText;
            atualizarDashboard();
            atualizarPlacarInterface();
        });
    });

    document.querySelectorAll(".sexo-toggle .sexo-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll(".sexo-toggle .sexo-btn").forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            sexoAtivo = e.target.innerText;
            atualizarDashboard();
            atualizarPlacarInterface();
        });
    });
}

function atualizarDashboard() {
    renderTabela();
    const totalCategoria = atletas.filter(a => a.evento === eventoAtual && a.modalidade === modalidadeAtiva && (a.sexo === sexoAtivo || a.genero === sexoAtivo)).length;
    const elemContador = document.getElementById("contador");
    if (elemContador) elemContador.innerText = `${totalCategoria}/12 jogadores`;

    const totalInscritosGeral = atletas.filter(a => a.evento === eventoAtual).length;
    const elemGeral = document.getElementById("totalGeral");
    if (elemGeral) elemGeral.innerText = totalInscritosGeral;
    const elemVagas = document.getElementById("vagasRestantes");
    if (elemVagas) elemVagas.innerText = Math.max(0, 94 - totalInscritosGeral);
}

function renderTabela() {
    const tbody = document.getElementById("tabela-alunos");
    if (!tbody) return;
    const elemBusca = document.getElementById("busca");
    const buscaTexto = elemBusca ? elemBusca.value.toLowerCase() : "";
    tbody.innerHTML = "";

    const atletasFiltrados = atletas.filter(a => {
        const escopoCorreto = a.evento === eventoAtual && a.modalidade === modalidadeAtiva && (a.sexo === sexoAtivo || a.genero === sexoAtivo);
        const buscaCorreta = a.nome.toLowerCase().includes(buscaTexto) || a.turma.toLowerCase().includes(buscaTexto);
        return escopoCorreto && buscaCorreta;
    });

    atletasFiltrados.forEach(atleta => {
        const tr = document.createElement("tr");
        const classeBadge = atleta.posicao.toLowerCase() === "titular" ? "titular" : "reserva";
        
        const donoInscricao = atleta.criadorInscricao || atleta.cpfCriador;
        const podeDeletar = usuarioLogado && (usuarioLogado.tipo === "professor" || donoInscricao === usuarioLogado.cpf || donoInscricao === usuarioLogado.nome);

        tr.innerHTML = `
            <td><strong>${atleta.nome}</strong></td>
            <td>${atleta.turma}</td>
            <td><span class="badge ${classeBadge}">${atleta.posicao}</span></td>
            <td style="text-align:right">
                ${podeDeletar ? `<button onclick="removerAtleta(${atleta.id})" class="action-btn" style="background:none; border:none; cursor:pointer; color:var(--vermelho)">🗑️</button>` : `<span style="color:var(--text-sub); font-size:0.8rem;">Bloqueado</span>`}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function adicionarAluno() {
    if (!usuarioLogado) return;
    let nome, turma, posicao, criadorInscricao;

    if (usuarioLogado.tipo === "professor") {
        nome = document.getElementById("nomeAluno").value.trim();
        turma = document.getElementById("turmaAluno").value.trim();
        posicao = document.getElementById("posicaoAluno").value;
        criadorInscricao = "PROFESSOR";
        if (!nome || !turma) {
            alert("Preencha todos os campos do aluno!");
            return;
        }
    } else {
        nome = usuarioLogado.nome;
        criadorInscricao = usuarioLogado.cpf || usuarioLogado.nome; 
        posicao = "Reserva";

        const jaInscrito = atletas.some(a => a.evento === eventoAtual && (a.criadorInscricao === criadorInscricao || a.cpfCriador === criadorInscricao) && a.modalidade === modalidadeAtiva && (a.sexo === sexoAtivo || a.genero === sexoAtivo));
        if (jaInscrito) return alert("Você já está inscrito nesta modalidade para este evento!");

        const inputTurma = prompt("Digite a sua turma (Ex: 1º Ano A):");
        if (!inputTurma || inputTurma.trim() === "") return alert("Inscrição cancelada. A turma é obrigatória!");
        turma = inputTurma.trim();
    }

    atletas.push({ 
        id: Date.now(), 
        nome, 
        turma, 
        posicao, 
        modalidade: modalidadeAtiva, 
        sexo: sexoAtivo, 
        genero: sexoAtivo, 
        criadorInscricao, 
        cpfCriador: criadorInscricao, 
        evento: eventoAtual 
    });
    
    localStorage.setItem("atletasInscritos", JSON.stringify(atletas));
    
    if (usuarioLogado.tipo === "professor") {
        document.getElementById("nomeAluno").value = "";
        document.getElementById("turmaAluno").value = "";
    } else {
        alert("Inscrição realizada com sucesso!");
    }

    atualizarDashboard();
}

function removerAtleta(id) {
    if (confirm("Deseja realmente remover este atleta?")) {
        atletas = atletas.filter(a => a.id !== id);
        localStorage.setItem("atletasInscritos", JSON.stringify(atletas));
        atualizarDashboard();
    }
}

/* ==========================================================================
   SISTEMA DE GERENCIAMENTO DE PLACAR AO VIVO (CORRIGIDO)
   ========================================================================== */
function obterBancoPlacares() {
    return JSON.parse(localStorage.getItem("bancoPlacaresJogos")) || {};
}

function obterChaveUnica() {
    return `${eventoAtual}_${modalidadeAtiva}_${sexoAtivo}`;
}

function atualizarPlacarInterface() {
    const banco = obterBancoPlacares();
    const chave = obterChaveUnica();
    const dadosPlacar = banco[chave] || { timeA: "2º A", timeB: "3º B", pontoA: 0, pontoB: 0 };

    const elemNomeA = document.getElementById("nomeTimeA");
    const elemNomeB = document.getElementById("nomeTimeB");
    const elemPontoA = document.getElementById("pontoTimeA");
    const elemPontoB = document.getElementById("pontoTimeB");

    if (elemNomeA) elemNomeA.innerText = dadosPlacar.timeA;
    if (elemNomeB) elemNomeB.innerText = dadosPlacar.timeB;
    if (elemPontoA) elemPontoA.innerText = dadosPlacar.pontoA;
    if (elemPontoB) elemPontoB.innerText = dadosPlacar.pontoB;
}

function modificarPlacar(time, valor) {
Use o código com cuidado.if (!usuarioLogado || usuarioLogado.tipo !== "professor") return;const banco = obterBancoPlacares();const chave = obterChaveUnica();if (!banco[chave]) {banco[chave] = { timeA: "2º A", timeB: "3º B", pontoA: 0, pontoB: 0 };}if (time === 'A') {banco[chave].pontoA = Math.max(0, banco[chave].pontoA + valor);} else if (time === 'B') {banco[chave].pontoB = Math.max(0, banco[chave].pontoB + valor);}localStorage.setItem("bancoPlacaresJogos", JSON.stringify(banco));atualizarPlacarInterface();}// --- CORREÇÃO DO SALVAMENTO DE NOMES DOS TIMES ---function alterarNomeTime(time) {if (!usuarioLogado || usuarioLogado.tipo !== "professor") {alert("Apenas professores podem alterar o nome das equipes.");return;}const banco = obterBancoPlacares();const chave = obterChaveUnica();if (!banco[chave]) {banco[chave] = { timeA: "2º A", timeB: "3º B", pontoA: 0, pontoB: 0 };}const nomeAtual = time === 'A' ? banco[chave].timeA : banco[chave].timeB;const novoNome = prompt(Digite o nome do Time ${time}:, nomeAtual);if (!novoNome || novoNome.trim() === "") return;if (time === 'A') banco[chave].timeA = novoNome.trim();if (time === 'B') banco[chave].timeB = novoNome.trim();localStorage.setItem("bancoPlacaresJogos", JSON.stringify(banco));atualizarPlacarInterface();}function resetarPlacar() {if (!usuarioLogado || usuarioLogado.tipo !== "professor") return;if (!confirm("Deseja zerar as pontuações e redefinir as equipes deste jogo?")) return;const banco = obterBancoPlacares();const chave = obterChaveUnica();banco[chave] = { timeA: "2º A", timeB: "3º B", pontoA: 0, pontoB: 0 };localStorage.setItem("bancoPlacaresJogos", JSON.stringify(banco));atualizarPlacarInterface();}function logout() {localStorage.removeItem("usuarioLogado");localStorage.removeItem("tipo");localStorage.removeItem("nomeAlunoLogado");window.location.href = "login.html";}