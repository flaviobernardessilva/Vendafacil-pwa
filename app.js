let clientes = JSON.parse(localStorage.getItem("clientesVendaFacil")) || [
  { nome: "Auto Peças Exemplo", telefone: "", vendedor: "Flavio", segmento: "Linha leve", vendaAnterior: 18000, vendaAtual: 9500, queda: 47.2, status: "Em recuperação" }
];
let deferredPrompt;

function moeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function salvar() {
  localStorage.setItem("clientesVendaFacil", JSON.stringify(clientes));
}

function adicionarCliente() {
  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const vendedor = document.getElementById("vendedor").value.trim();
  const segmento = document.getElementById("segmento").value.trim();
  const vendaAnterior = Number(document.getElementById("vendaAnterior").value);
  const vendaAtual = Number(document.getElementById("vendaAtual").value);

  if (!nome || !vendaAnterior || vendaAnterior <= 0) {
    alert("Informe pelo menos nome e venda do ano anterior.");
    return;
  }

  const queda = vendaAtual < vendaAnterior ? ((vendaAnterior - vendaAtual) / vendaAnterior) * 100 : 0;

  clientes.push({
    nome,
    telefone,
    vendedor,
    segmento,
    vendaAnterior,
    vendaAtual,
    queda: Number(queda.toFixed(1)),
    status: queda > 0 ? "Em recuperação" : "Recuperado"
  });

  document.querySelectorAll("input").forEach(i => i.value = "");
  salvar();
  renderizar();
}

function textoWhatsApp(c) {
  return `Olá, ${c.nome}! Tudo bem? Notei uma redução no volume de compras e queria entender como podemos ajudar com melhores condições, mix de produtos e oportunidades. Posso conversar com você hoje?`;
}

function linkWhatsApp(c) {
  const numero = (c.telefone || "").replace(/\D/g, "");
  const base = numero ? `https://wa.me/55${numero}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(textoWhatsApp(c))}`;
}

function alterarStatus(index, status) {
  clientes[index].status = status;
  salvar();
  renderizar();
}

function excluirCliente(index) {
  if (confirm("Excluir este cliente?")) {
    clientes.splice(index, 1);
    salvar();
    renderizar();
  }
}

function classeStatus(status) {
  if (status === "Recuperado") return "recuperado";
  if (status === "Negociação") return "negociacao";
  return "";
}

function renderizar() {
  const filtro = document.getElementById("filtro")?.value || "todos";
  const lista = document.getElementById("listaClientes");
  lista.innerHTML = "";

  const filtrados = clientes.filter(c => filtro === "todos" || c.status === filtro);

  filtrados
    .sort((a, b) => b.queda - a.queda)
    .forEach((c) => {
      const indexReal = clientes.indexOf(c);
      const potencial = Math.max(0, c.vendaAnterior - c.vendaAtual);
      lista.innerHTML += `
        <article class="cliente ${classeStatus(c.status)}">
          <h3>${c.nome}</h3>
          <span class="badge">${c.status}</span>
          <span class="badge">${c.segmento || "Sem segmento"}</span>
          <p><strong>Vendedor:</strong> ${c.vendedor || "Não informado"}</p>
          <p><strong>Venda anterior:</strong> ${moeda(c.vendaAnterior)} | <strong>Atual:</strong> ${moeda(c.vendaAtual)}</p>
          <p><strong>Queda:</strong> ${c.queda}% | <strong>Potencial:</strong> ${moeda(potencial)}</p>
          <div class="actions">
            <a href="${linkWhatsApp(c)}" target="_blank"><button>WhatsApp</button></a>
            <button class="warning" onclick="alterarStatus(${indexReal}, 'Negociação')">Negociação</button>
            <button class="secondary" onclick="alterarStatus(${indexReal}, 'Recuperado')">Recuperado</button>
            <button class="danger-btn" onclick="excluirCliente(${indexReal})">Excluir</button>
          </div>
        </article>`;
    });

  document.getElementById("totalClientes").innerText = clientes.length;
  document.getElementById("clientesQueda").innerText = clientes.filter(c => c.queda > 0 && c.status !== "Recuperado").length;
  document.getElementById("recuperados").innerText = clientes.filter(c => c.status === "Recuperado").length;
  const potencial = clientes.reduce((s, c) => s + Math.max(0, c.vendaAnterior - c.vendaAtual), 0);
  document.getElementById("potencial").innerText = moeda(potencial);
}

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById("installBtn");
  btn.hidden = false;
  btn.onclick = async () => {
    btn.hidden = true;
    deferredPrompt.prompt();
    deferredPrompt = null;
  };
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

renderizar();
