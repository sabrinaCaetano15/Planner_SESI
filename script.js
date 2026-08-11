let eventoEditando = null;
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
let modalidadesEvento = [];
let eventoAtual = "";
let atletas = [];

/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    inicializarTemaBotao();

    if (!document.getElementById("tabela-alunos")) return;

    carregarUsuario();

    const eventoSalvo = JSON.parse(
        localStorage.getItem("eventoSelecionado")
    );

    if (!eventoSalvo) {

        alert("Selecione um evento antes de continuar.");

        window.location.href = "eventos.html";

        return;

    }

    eventoAtual = eventoSalvo;

    document.getElementById("nomeEventoAtual").innerText =
        eventoAtual.nome;

    configurarPerfil();

    await carregarModalidades();

    renderizarModalidades();

    configurarFiltros();

    await carregarAtletas();

    atualizarDashboard();

    atualizarPlacar();

});
/* =========================================================
   LOGIN
========================================================= */

function carregarUsuario() {

    const dadosSessao = localStorage.getItem("usuarioLogado");

    console.log("usuarioLogado =", dadosSessao);

    if (!dadosSessao) {

        alert("Nenhum usuário encontrado!");

        window.location.href = "login.html";
        return;
    }

    usuarioLogado = JSON.parse(dadosSessao);

    console.log(usuarioLogado);
}

/* =========================================================
   PERFIL
========================================================= */

function configurarPerfil() {

    document.getElementById("nomeExibicao").innerText =
        usuarioLogado.nome || "Usuário";

    const professor = usuarioLogado.tipo === "professor";

    document.getElementById("formProfessor").style.display =
        professor ? "grid" : "none";

    document.getElementById("btnInscricaoAluno").style.display =
        professor ? "none" : "block";

    document.getElementById("btnGerenciarModalidades").style.display =
    professor ? "block" : "none";

    document.getElementById("controlesPlacar").style.display =
        professor ? "flex" : "none";

}
/* =========================================================
   FILTROS
========================================================= */

function configurarFiltros() {

    /* ==========================
       MODALIDADES
    ========================== */

    document.querySelectorAll(".card").forEach(card => {

        card.addEventListener("click", async () => {

            document.querySelectorAll(".card")
                .forEach(c => c.classList.remove("active"));

            card.classList.add("active");

            modalidadeAtiva = card.dataset.modalidade;

            atualizarBotoesSexo();

            await carregarAtletas();

            atualizarPlacar();

        });

    });

    /* ==========================
       SEXO
    ========================== */

    document.querySelectorAll(".sexo-btn").forEach(botao => {

        botao.addEventListener("click", async () => {

            document.querySelectorAll(".sexo-btn")
                .forEach(b => b.classList.remove("active"));

            botao.classList.add("active");

            sexoAtivo = botao.dataset.sexo;

            await carregarAtletas();

            atualizarPlacar();

        });

    });

    /* ==========================
       BUSCA
    ========================== */

    const busca = document.getElementById("busca");

    if (busca) {

        busca.addEventListener("input", renderTabela);

    }

}

async function carregarModalidades() {

    try {

        const resposta = await fetch("api.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                acao: "listar_modalidades",
                id_evento: eventoAtual.id
            })
        });

 const texto = await resposta.text();
console.log("Resposta da API:", texto);

const dados = JSON.parse(texto);

console.log(dados);

console.log("Modalidades recebidas:", dados.modalidades);

if (!dados.sucesso) {
    alert("Erro ao carregar modalidades.");
    return;
}

modalidadesEvento = dados.modalidades;

console.log("Antes de renderizar");

renderizarModalidades();

console.log("Depois de renderizar");

} catch (e) {

    console.error(e);

    alert("Erro ao carregar modalidades.");

}

}

function renderizarModalidades() {

    const container = document.getElementById("listaModalidades");

    if (!container) return;

    container.innerHTML = "";

    // Remove modalidades repetidas (Basquete M/F vira um único card)
    const modalidadesUnicas = [
        ...new Map(
            modalidadesEvento.map(m => [m.nome, m])
        ).values()
    ];

    // Define a primeira modalidade como ativa
    if (!modalidadeAtiva && modalidadesUnicas.length > 0) {
        modalidadeAtiva = modalidadesUnicas[0].nome;
    }

    modalidadesUnicas.forEach((modalidade) => {

        const card = document.createElement("div");

        card.className = "card";

        if (modalidade.nome === modalidadeAtiva) {
            card.classList.add("active");
        }

        card.dataset.modalidade = modalidade.nome;
        card.innerText = modalidade.nome;

        card.onclick = () => {

            modalidadeAtiva = modalidade.nome;

            renderizarModalidades();
            renderFiltroSexo();
            renderTabela();

        };

        container.appendChild(card);

    });

    // Atualiza o filtro de sexo apenas uma vez
    renderFiltroSexo();

}
function renderFiltroSexo() {

    const container = document.getElementById("filtroSexo");

    if (!container) return;

    container.innerHTML = "";

    // Procura todas as modalidades com o mesmo nome
    const modalidades = modalidadesEvento.filter(
        m => m.nome === modalidadeAtiva
    );

    if (modalidades.length === 0) return;

   const modalidadeMista = modalidades.find(
    m => m.sexo === "Misto"
);

if (!modalidadeMista) {

    sexoAtivo = modalidades[0].sexo;

    return;

}

    // Se for Misto cria os botões

    sexoAtivo = "Todos";

    console.log("Modalidade ativa:", modalidadeAtiva);
    console.log("Evento atual:", eventoAtual.nome);
    console.log("Atletas:", atletas);

    const atletasModalidade = atletas.filter(a =>
    (a.modalidade || "").trim() === (modalidadeAtiva || "").trim() &&
    (a.evento || "").trim() === (eventoAtual.nome || "").trim()
);
const total = atletasModalidade.length;

const femininos = atletasModalidade.filter(
    a => a.sexo === "Feminino"
).length;

const masculinos = atletasModalidade.filter(
    a => a.sexo === "Masculino"
).length;

console.log("Atletas da modalidade:", atletasModalidade);


container.innerHTML = `

<div class="sexo-toggle">

    <button class="sexo-btn active" data-sexo="Todos">
        Todos (${total})
    </button>

    <button class="sexo-btn" data-sexo="Feminino">
        Feminino (${femininos})
    </button>

    <button class="sexo-btn" data-sexo="Masculino">
        Masculino (${masculinos})
    </button>

</div>

`;

    document.querySelectorAll(".sexo-btn").forEach(botao => {

        botao.addEventListener("click", () => {

            document.querySelectorAll(".sexo-btn")
                .forEach(b => b.classList.remove("active"));

            botao.classList.add("active");

            sexoAtivo = botao.dataset.sexo;

            renderTabela();

        });

    });

}
/* =========================================================
   TABELA
========================================================= */

function renderTabela() {

    const tbody = document.getElementById("tabela-alunos");

    tbody.innerHTML = "";

    console.log("================================");
    console.log("Evento Atual:", eventoAtual);
    console.log("Modalidade Atual:", modalidadeAtiva);
    console.log("Sexo Atual:", sexoAtivo);
    console.log("Todos os atletas:", atletas);

    const busca = document
        .getElementById("busca")
        .value
        .toLowerCase();

    const filtrados = atletas.filter(atleta =>

        (atleta.evento || "").trim() === (eventoAtual.nome || "").trim() &&
        (atleta.modalidade || "").trim() === (modalidadeAtiva || "").trim() &&
        (
            sexoAtivo === "Todos" ||
            (atleta.sexo || "").trim() === (sexoAtivo || "").trim()
        )&&
        (
            (atleta.nome || "").toLowerCase().includes(busca) ||
            (atleta.turma || "").toLowerCase().includes(busca)
        )

    );

    console.log("Atletas filtrados:", filtrados);

    filtrados.forEach(atleta => {

        const tr = document.createElement("tr");

        const professor = usuarioLogado.tipo === "professor";

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
                    <button onclick="editarAtleta(${atleta.id})" class="action-btn">
                        ✏️
                    </button>

                    <button onclick="removerAtleta(${atleta.id})" class="action-btn">
                        🗑️
                    </button>
                    `
                    :
                    `<span style="color:gray;">Bloqueado</span>`
                }

            </td>
        `;

        tbody.appendChild(tr);

    });
atualizarContadorJogadores();
}
function atualizarContadorJogadores() {

    const contador = document.getElementById("contador");

    if (!contador) return;

    const modalidade = modalidadesEvento.find(
        m =>
            m.nome === modalidadeAtiva &&
            (
                m.sexo === sexoAtivo ||
                m.sexo === "Misto" ||
                sexoAtivo === "Todos"
            )
    );

    const maximo = modalidade
        ? modalidade.max_participantes
        : 0;

    const inscritos = atletas.filter(atleta => {

        if (
            atleta.evento !== eventoAtual.nome ||
            atleta.modalidade !== modalidadeAtiva
        ) {
            return false;
        }

        if (
            modalidade &&
            modalidade.sexo === "Misto" &&
            sexoAtivo === "Todos"
        ) {
            return true;
        }

        return atleta.sexo === sexoAtivo;

    }).length;

    contador.innerText = `${inscritos}/${maximo} jogadores`;

}
/* =========================================================
   ADICIONAR
========================================================= */

async function adicionarAluno() {

    if (!usuarioLogado) return;

    let nome;
    let turma;
    let posicao;

    if (usuarioLogado.tipo === "professor") {

        nome = document.getElementById("nomeAluno").value.trim();
        turma = document.getElementById("turmaAluno").value.trim();
        posicao = document.getElementById("posicaoAluno").value;

        if (!nome || !turma) {

            alert("Preencha todos os campos.");

            return;

        }

    } else {

        nome = usuarioLogado.nome;

        turma = prompt("Digite sua turma:");

        if (!turma) return;

        posicao = prompt("Escolha a posição (Titular ou Reserva):", "Reserva");

        if (!posicao) return;

        posicao = posicao.trim();

        if (posicao !== "Titular" && posicao !== "Reserva") {
        alert("Escolha apenas Titular ou Reserva.");
        return;
}

    }

    try {

        const resposta = await fetch("atletas.php", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                acao: "criar",

                nome: nome,
                turma: turma,
                posicao: posicao,
                modalidade: modalidadeAtiva,
                sexo: sexoAtivo,
                evento: eventoAtual.nome

            })

        });

        const retorno = await resposta.json();

        console.log(retorno);

        if (retorno.sucesso) {

        alert("Atleta inscrito com sucesso!");

        await carregarAtletas();

        if (usuarioLogado.tipo === "professor") {

            document.getElementById("nomeAluno").value = "";
            document.getElementById("turmaAluno").value = "";

    }

}   else {

        alert(retorno.mensagem);

}

    } catch (erro) {

        console.error(erro);

        alert("Erro ao conectar com o servidor.");

    }

}

/* =========================================================
   EDITAR
========================================================= */

async function editarAtleta(id) {

    if (usuarioLogado.tipo !== "professor") return;

    const atleta = atletas.find(a => a.id == id);

    if (!atleta) return;

    const novoNome = prompt("Editar nome:", atleta.nome);
    if (novoNome === null) return;

    const novaTurma = prompt("Editar turma:", atleta.turma);
    if (novaTurma === null) return;

    const novaPosicao = prompt(
        "Posição (Titular ou Reserva):",
        atleta.posicao
    );

    if (novaPosicao === null) return;

    try {

        const resposta = await fetch("atletas.php", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                acao: "editar",

                id: atleta.id,

                nome: novoNome,

                turma: novaTurma,

                posicao: novaPosicao

            })

        });

        const retorno = await resposta.json();

        if (retorno.sucesso) {

            alert("Atleta atualizado!");

            await carregarAtletas();

        } else {

            alert("Erro ao atualizar.");

        }

    } catch (erro) {

        console.error(erro);

        alert("Erro de conexão.");

    }

}

/* =========================================================
   REMOVER
========================================================= */

async function removerAtleta(id) {

    if (usuarioLogado.tipo !== "professor") return;

    if (!confirm("Remover atleta?")) return;

    try {

        const resposta = await fetch("atletas.php", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                acao: "excluir",
                id: id

            })

        });

        const retorno = await resposta.json();

        if (retorno.sucesso) {

            await carregarAtletas();

        } else {

            alert("Erro ao excluir atleta.");

        }

    } catch (erro) {

        console.error(erro);

        alert("Erro ao conectar com o servidor.");

    }

}

/* =========================================================
   CARREGAR ATLETAS
========================================================= */

async function carregarAtletas() {

    try {

        const resposta = await fetch("atletas.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                acao: "listar"
            })
        });

        const texto = await resposta.text();
console.log(texto);

const dados = JSON.parse(texto);

        atletas = dados.atletas || [];

        renderFiltroSexo();

        renderTabela();

        atualizarDashboard();

    } catch (erro) {

        console.error(erro);

        alert("Erro ao carregar atletas.");

    }

}

/* =========================================================
   DASHBOARD
========================================================= */

function atualizarDashboard() {

    const filtrados = atletas.filter(atleta =>

        (atleta.evento || "").trim() === (eventoAtual.nome || "").trim() &&
        (atleta.modalidade || "").trim() === modalidadeAtiva &&
        (atleta.sexo || "").trim() === sexoAtivo

    );

    document.getElementById("totalGeral").innerText = filtrados.length;

    let vagas = 94 - filtrados.length;

    if (vagas < 0) vagas = 0;

    document.getElementById("vagasRestantes").innerText = vagas;

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
    return `${eventoAtual.id}_${modalidadeAtiva}_${sexoAtivo}`;
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
function abrirModalModalidades() {

    const lista = document.getElementById("listaModalidadesProfessor");

    lista.innerHTML = "";

    modalidadesEvento.forEach((modalidade) => {

        lista.innerHTML += `

            <div class="item-modalidade">

                <div class="info-modalidade">

                    <strong>${modalidade.nome}</strong>

                    <span>
                        ${modalidade.sexo}
                    </span>

                    <small>
                        Máx. participantes: ${modalidade.max_participantes}
                    </small>

                </div>

                <button
                    class="btn-excluir-modalidade"
                    onclick="excluirModalidade(${modalidade.id})"
                >
                    🗑️
                </button>

            </div>

        `;

    });

    document.getElementById("modalModalidades").style.display = "flex";

}
async function excluirModalidade(id) {

    if (!confirm("Deseja realmente excluir esta modalidade?")) {
        return;
    }

    try {

        const resposta = await fetch("api.php", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                acao: "excluir_modalidade",
                id: id

            })

        });

        const dados = await resposta.json();

        if (dados.sucesso) {

            alert("Modalidade excluída com sucesso!");

            await carregarModalidades();

            abrirModalModalidades();

            renderizarModalidades();

        } else {

            alert(dados.mensagem);

        }

    } catch (erro) {

        console.error(erro);

        alert("Erro ao excluir modalidade.");

    }

}
function fecharModalModalidades() {
    document.getElementById("modalModalidades").style.display = "none";
}

async function salvarModalidadesProfessor() {

    const checkboxes = document.querySelectorAll(
        "#listaModalidadesProfessor input[type='checkbox']"
    );

    const modalidades = [];

    checkboxes.forEach(cb => {

        modalidades.push({
            id: modalidadesEvento[cb.dataset.index].id,
            ativa: cb.checked ? 1 : 0
        });

    });

    try {

        const resposta = await fetch("api.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                acao: "salvar_modalidades",
                modalidades: modalidades
            })
        });

        const texto = await resposta.text();
console.log(texto);

const dados = JSON.parse(texto);
        if (dados.sucesso) {

            alert("Modalidades atualizadas!");

            await carregarModalidades();

            fecharModalModalidades();

        } else {

            alert(dados.mensagem);

        }

    } catch (e) {

    console.error(e);

    console.error(e.stack);

    alert(e.message);

}

}
async function adicionarModalidade() {

    const nome = document.getElementById("novaModalidadeNome").value.trim();
    const sexo = document.getElementById("novaModalidadeSexo").value;
    const maximo = document.getElementById("novaModalidadeMax").value;

    if (nome == "") {

        alert("Digite o nome da modalidade.");
        return;

    }

    try {

        const resposta = await fetch("api.php", {

            method: "POST",

            headers: {
                "Content-Type":"application/json"
            },

            body: JSON.stringify({

                acao:"adicionar_modalidade",

                id_evento:eventoAtual.id,

                nome:nome,

                sexo:sexo,

                maximo:maximo

            })

        });

        const dados = await resposta.json();

        if(dados.sucesso){

            document.getElementById("novaModalidadeNome").value="";
            document.getElementById("novaModalidadeMax").value=12;

            await carregarModalidades();

            abrirModalModalidades();

        }else{

            alert(dados.mensagem);

        }

    } catch(e){

        console.error(e);

        alert("Erro ao adicionar modalidade.");

    }

}
function atualizarBotoesSexo() {

    const container = document.querySelector(".sexo-toggle");

    if (!container) return;

    const modalidades = modalidadesEvento.filter(
        m => m.nome === modalidadeAtiva
    );

    const sexos = modalidades.map(m => m.sexo);

    container.innerHTML = "";

    if (sexos.includes("Masculino")) {

        container.innerHTML += `
            <button
                class="sexo-btn"
                data-sexo="Masculino">
                Masculino
            </button>
        `;

    }

    if (sexos.includes("Feminino")) {

        container.innerHTML += `
            <button
                class="sexo-btn"
                data-sexo="Feminino">
                Feminino
            </button>
        `;

    }

    if (sexos.includes("Misto")) {

        sexoAtivo = "Misto";

    } else {

        sexoAtivo = sexos[0];

    }

    configurarFiltros();

}

/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("tipo");
    localStorage.removeItem("nomeAlunoLogado");

    window.location.href = "login.html";
}

