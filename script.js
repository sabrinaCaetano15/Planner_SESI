const tipoUsuario = localStorage.getItem("tipo");
const nomeLogado = localStorage.getItem("nomeAlunoLogado");
const LIMITE = 12;

let dados = JSON.parse(localStorage.getItem("jogos")) || {
    "Vôlei": { Masculino: [], Feminino: [] }, "Handebol": { Masculino: [], Feminino: [] },
    "Futsal": { Masculino: [], Feminino: [] }, "Basquete": { Masculino: [], Feminino: [] }
};

let modalidadeAtual = "Vôlei";
let sexoAtual = "Masculino";
let editIndex = null;

if (!tipoUsuario) window.location.href = "login.html";
document.getElementById("nomeExibicao").innerText = tipoUsuario === "professor" ? "Professor" : nomeLogado;

document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => {
        document.querySelector(".card.active").classList.remove("active");
        card.classList.add("active");
        modalidadeAtual = card.textContent;
        renderTabela();
    });
});

document.querySelectorAll(".sexo-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".sexo-btn.active").classList.remove("active");
        btn.classList.add("active");
        sexoAtual = btn.textContent;
        renderTabela();
    });
});

function adicionarAluno() {
    const nome = document.getElementById("nomeAluno").value.trim();
    const turma = document.getElementById("turmaAluno").value.trim();
    const posicao = document.getElementById("posicaoAluno").value;

    if (!nome || !turma) return alert("Preencha todos os campos.");
    const lista = dados[modalidadeAtual][sexoAtual];

    if (editIndex !== null) {
        lista[editIndex] = { nome, turma, posicao };
        editIndex = null;
        document.getElementById("btnSalvar").innerText = "Salvar Atleta";
    } else {
        if (lista.length >= LIMITE) return alert("Vagas esgotadas!");
        lista.push({ nome, turma, posicao });
    }

    localStorage.setItem("jogos", JSON.stringify(dados));
    renderTabela();
    document.getElementById("nomeAluno").value = "";
    document.getElementById("turmaAluno").value = "";
}

function renderTabela() {
    const tabela = document.getElementById("tabela-alunos");
    const busca = document.getElementById("busca").value.toLowerCase();
    const lista = dados[modalidadeAtual][sexoAtual];
    tabela.innerHTML = "";

    lista.forEach((aluno, index) => {
        if (!aluno.nome.toLowerCase().includes(busca)) return;
        let botoes = tipoUsuario === "professor" ? 
            `<button class="action-btn" onclick="editarAluno(${index})">✏️</button>
             <button class="action-btn" onclick="removerAluno(${index})">🗑️</button>` :
            (aluno.nome === nomeLogado ? `<button class="action-btn" onclick="removerAluno(${index})">❌ Sair</button>` : "");

        tabela.innerHTML += `<tr>
            <td><strong>${aluno.nome}</strong></td>
            <td>${aluno.turma}</td>
            <td><span class="badge ${aluno.posicao.toLowerCase()}">${aluno.posicao}</span></td>
            <td style="text-align:right">${botoes}</td>
        </tr>`;
    });

    document.getElementById("tituloLista").innerText = `${modalidadeAtual} - ${sexoAtual}`;
    document.getElementById("contador").innerText = `${lista.length}/${LIMITE} jogadores`;
    atualizarDashboard();
}

function atualizarDashboard() {
    let total = 0;
    for (let mod in dados) total += (dados[mod].Masculino.length + dados[mod].Feminino.length);
    document.getElementById("totalGeral").innerText = total;
    document.getElementById("vagasRestantes").innerText = 48 - total;
    document.getElementById("esporteLider").innerText = total > 0 ? "Em andamento" : "Aguardando";
}

function editarAluno(index) {
    const aluno = dados[modalidadeAtual][sexoAtual][index];
    document.getElementById("nomeAluno").value = aluno.nome;
    document.getElementById("turmaAluno").value = aluno.turma;
    document.getElementById("posicaoAluno").value = aluno.posicao;
    editIndex = index;
    document.getElementById("btnSalvar").innerText = "Atualizar";
}

function removerAluno(index) {
    if (confirm("Remover registro?")) {
        dados[modalidadeAtual][sexoAtual].splice(index, 1);
        localStorage.setItem("jogos", JSON.stringify(dados));
        renderTabela();
    }
}

function logout() { localStorage.clear(); window.location.href = "login.html"; }
document.getElementById("busca").addEventListener("input", renderTabela);
renderTabela();
