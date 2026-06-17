/* =========================================================
   TEMA
========================================================= */

(function aplicarTemaSalvo() {
    if (localStorage.getItem("temaEscuro") === "ativo") {
        document.documentElement.setAttribute("data-theme", "dark");
    }
})();

function toggleDarkMode() {
    const html = document.documentElement;
    const btn = document.getElementById("darkModeBtn");

    if (html.getAttribute("data-theme") === "dark") {
        html.removeAttribute("data-theme");
        localStorage.setItem("temaEscuro", "inativo");
        if (btn) btn.innerText = "🌙";
    } else {
        html.setAttribute("data-theme", "dark");
        localStorage.setItem("temaEscuro", "ativo");
        if (btn) btn.innerText = "☀️";
    }
}

function inicializarTemaBotao() {
    const btn = document.getElementById("darkModeBtn");

    if (btn) {
        btn.innerText =
            document.documentElement.getAttribute("data-theme") === "dark"
                ? "☀️"
                : "🌙";
    }
}

/* =========================================================
   VARIÁVEIS
========================================================= */

let usuarioLogado = null;
let modalidadeAtiva = "Vôlei";
let sexoAtivo = "Masculino";
let eventoAtual = "";
let atletas = [];

/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    inicializarTemaBotao();

    if (!document.getElementById("tabela-alunos")) return;

    carregarUsuario();

    eventoAtual =
        localStorage.getItem("eventoSelecionado") || "Interclasse";

    atletas =
        JSON.parse(localStorage.getItem("atletasInscritos")) || [];

    document.getElementById("nomeEventoAtual").innerText = eventoAtual;

    configurarPerfil();
    configurarFiltros();

    atualizarDashboard();
    atualizarPlacar();
});

/* =========================================================
   LOGIN
========================================================= */

function carregarUsuario() {
    const dadosSessao = localStorage.getItem("usuarioLogado");

    // Debug Técnico: Mostra no console exatamente o que veio do login assim que a página abre
    console.log("DADOS DA SESSÃO CARREGADOS NO INDEX:", dadosSessao);

    if (!dadosSessao) {
        console.warn("Nenhum usuário logado encontrado. Redirecionando para login.html...");
        window.location.href = "login.html";
        return;
    }

    usuarioLogado = JSON.parse(dadosSessao);
}




/* =========================================================
   PERFIL
========================================================= */

function configurarPerfil() {

    document.getElementById("nomeExibicao").innerText =
        usuarioLogado.nome;

    const professor = usuarioLogado.tipo === "professor";

    document.getElementById("formProfessor").style.display =
        professor ? "grid" : "none";

    document.getElementById("btnInscricaoAluno").style.display =
        professor ? "none" : "block";

    document.getElementById("controlesPlacar").style.display =
        professor ? "flex" : "none";
}

/* =========================================================
   FILTROS
========================================================= */

function configurarFiltros() {

    document.querySelectorAll(".card").forEach(card => {

        card.addEventListener("click", () => {

            document.querySelectorAll(".card")
                .forEach(c => c.classList.remove("active"));

            card.classList.add("active");

            modalidadeAtiva = card.innerText;

            atualizarDashboard();
            atualizarPlacar();
        });
    });

    document.querySelectorAll(".sexo-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            document.querySelectorAll(".sexo-btn")
                .forEach(b => b.classList.remove("active"));

            btn.classList.add("active");

            sexoAtivo = btn.innerText;

            atualizarDashboard();
            atualizarPlacar();
        });
    });
}

/* =========================================================
   DASHBOARD
========================================================= */

function atualizarDashboard() {

    renderTabela();

    const total = atletas.filter(a =>
        a.evento === eventoAtual &&
        a.modalidade === modalidadeAtiva &&
        a.sexo === sexoAtivo
    ).length;

    document.getElementById("contador").innerText =
        `${total}/12 jogadores`;

    const totalGeral = atletas.filter(a =>
        a.evento === eventoAtual
    ).length;

    document.getElementById("totalGeral").innerText =
        totalGeral;

    document.getElementById("vagasRestantes").innerText =
        Math.max(0, 94 - totalGeral);
}

/* =========================================================
   TABELA
========================================================= */

function renderTabela() {

    const tbody = document.getElementById("tabela-alunos");

    tbody.innerHTML = "";

    const busca =
        document.getElementById("busca")
        .value
        .toLowerCase();

    const filtrados = atletas.filter(a => {

        return (
            a.evento === eventoAtual &&
            a.modalidade === modalidadeAtiva &&
            a.sexo === sexoAtivo &&
            (
                a.nome.toLowerCase().includes(busca) ||
                a.turma.toLowerCase().includes(busca)
            )
        );
    });

    filtrados.forEach(atleta => {

        const tr = document.createElement("tr");

        const professor =
            usuarioLogado.tipo === "professor";

        tr.innerHTML = `
            <td><strong>${atleta.nome}</strong></td>

            <td>${atleta.turma}</td>

            <td>
                <span class="badge ${atleta.posicao.toLowerCase()}">
                    ${atleta.posicao}
                </span>
            </td>

            <td style="text-align:right;">

                ${
                    professor
                    ?
                    `
                    <button onclick="editarAtleta(${atleta.id})"
                    class="action-btn">✏️</button>

                    <button onclick="removerAtleta(${atleta.id})"
                    class="action-btn">🗑️</button>
                    `
                    :
                    `<span style="color:gray;">Bloqueado</span>`
                }

            </td>
        `;

        tbody.appendChild(tr);
    });
}

/* =========================================================
   ADICIONAR
========================================================= */

function adicionarAluno() {

    if (!usuarioLogado) return;

    let nome;
    let turma;
    let posicao;

    if (usuarioLogado.tipo === "professor") {

        nome =
            document.getElementById("nomeAluno").value.trim();

        turma =
            document.getElementById("turmaAluno").value.trim();

        posicao =
            document.getElementById("posicaoAluno").value;

        if (!nome || !turma) {
            alert("Preencha todos os campos.");
            return;
        }

    } else {

        nome = usuarioLogado.nome;

        turma = prompt("Digite sua turma:");

        if (!turma) return;

        posicao = "Reserva";
    }

    atletas.push({
        id: Date.now(),
        nome,
        turma,
        posicao,
        modalidade: modalidadeAtiva,
        sexo: sexoAtivo,
        evento: eventoAtual
    });

    localStorage.setItem(
        "atletasInscritos",
        JSON.stringify(atletas)
    );

    atualizarDashboard();

    if (usuarioLogado.tipo === "professor") {

        document.getElementById("nomeAluno").value = "";
        document.getElementById("turmaAluno").value = "";
    }
}

/* =========================================================
   EDITAR
========================================================= */

function editarAtleta(id) {

    if (usuarioLogado.tipo !== "professor") return;

    const atleta = atletas.find(a => a.id === id);

    if (!atleta) return;

    const novoNome =
        prompt("Editar nome:", atleta.nome);

    if (!novoNome) return;

    const novaTurma =
        prompt("Editar turma:", atleta.turma);

    if (!novaTurma) return;

    atleta.nome = novoNome;
    atleta.turma = novaTurma;

    localStorage.setItem(
        "atletasInscritos",
        JSON.stringify(atletas)
    );

    atualizarDashboard();
}

/* =========================================================
   REMOVER
========================================================= */

function removerAtleta(id) {

    if (usuarioLogado.tipo !== "professor") return;

    if (!confirm("Remover atleta?")) return;

    atletas = atletas.filter(a => a.id !== id);

    localStorage.setItem(
        "atletasInscritos",
        JSON.stringify(atletas)
    );

    atualizarDashboard();
}

/* =========================================================
   PLACAR
========================================================= */

function obterBancoPlacares() {
    return JSON.parse(
        localStorage.getItem("bancoPlacaresJogos")
    ) || {};
}

function obterChavePlacar() {
    return `${eventoAtual}_${modalidadeAtiva}_${sexoAtivo}`;
}

function atualizarPlacar() {

    const banco = obterBancoPlacares();

    const chave = obterChavePlacar();

    if (!banco[chave]) {

        banco[chave] = {
            timeA: "Turma A",
            timeB: "Turma B",
            pontoA: 0,
            pontoB: 0
        };

        localStorage.setItem(
            "bancoPlacaresJogos",
            JSON.stringify(banco)
        );
    }

    document.getElementById("nomeTimeA").innerText =
        banco[chave].timeA;

    document.getElementById("nomeTimeB").innerText =
        banco[chave].timeB;

    document.getElementById("pontoTimeA").innerText =
        banco[chave].pontoA;

    document.getElementById("pontoTimeB").innerText =
        banco[chave].pontoB;
}

/* =========================================================
   ALTERAR NOME DOS TIMES
========================================================= */

function alterarNomeTime(time) {

    if (usuarioLogado.tipo !== "professor") {
        alert("Somente o professor pode alterar.");
        return;
    }

    const banco = obterBancoPlacares();

    const chave = obterChavePlacar();

    const atual =
        time === "A"
            ? banco[chave].timeA
            : banco[chave].timeB;

    const novo =
        prompt(`Novo nome do Time ${time}:`, atual);

    if (!novo) return;

    if (time === "A") {
        banco[chave].timeA = novo;
    } else {
        banco[chave].timeB = novo;
    }

    localStorage.setItem(
        "bancoPlacaresJogos",
        JSON.stringify(banco)
    );

    atualizarPlacar();
}

/* =========================================================
   MODIFICAR PLACAR
========================================================= */

function modificarPlacar(time, valor) {

    if (usuarioLogado.tipo !== "professor") return;

    const banco = obterBancoPlacares();

    const chave = obterChavePlacar();

    if (time === "A") {

        banco[chave].pontoA =
            Math.max(0, banco[chave].pontoA + valor);

    } else {

        banco[chave].pontoB =
            Math.max(0, banco[chave].pontoB + valor);
    }

    localStorage.setItem(
        "bancoPlacaresJogos",
        JSON.stringify(banco)
    );

    atualizarPlacar();
}

/* =========================================================
   RESETAR PLACAR
========================================================= */

function resetarPlacar() {

    if (usuarioLogado.tipo !== "professor") return;

    if (!confirm("Resetar placar?")) return;

    const banco = obterBancoPlacares();

    const chave = obterChavePlacar();

    banco[chave] = {
        timeA: "Turma A",
        timeB: "Turma B",
        pontoA: 0,
        pontoB: 0
    };

    localStorage.setItem(
        "bancoPlacaresJogos",
        JSON.stringify(banco)
    );

    atualizarPlacar();
}

/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("tipo");
    localStorage.removeItem("nomeAlunoLogado");

    window.location.href = "login.html";
<<<<<<< HEAD
}
=======
}
/* =========================================================
   LOGOUT
========================================================= */
function logout() {
    localStorage.clear(); // Limpa todos os dados salvos de login antigo
    window.location.href = "login.html"; // Manda de volta de forma segura
}

function mudarInterface() {
    const t = document.getElementById("tipo").value;
    const input = document.getElementById("usuario");
    
    document.getElementById("labelUser").innerText = t === "professor" ? "Usuário Professor" : "CPF do Aluno";
    input.placeholder = t === "professor" ? "Usuário de acesso" : "Apenas números";
    input.maxLength = t === "professor" ? 50 : 11;
    document.getElementById("linkCad").style.display = t === "professor" ? "none" : "block";
    
    // CORREÇÃO VISUAL: Deixe o campo de senha sempre visível para os dois tipos
    document.getElementById("group-senha").style.display = "block"; 
    
    input.value = "";
    document.getElementById("senha").value = "";
}
>>>>>>> 29b41b3f2c99a8e424eab7636ff762683ae6dd1f
