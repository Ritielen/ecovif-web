// public/js/comandaScript.js

const selectCardapio = document.getElementById("selectCardapio");
const quantidadeItem = document.getElementById("quantidadeItem");
const listaItensAdicionados = document.getElementById("listaItensAdicionados");
const totalComanda = document.getElementById("totalComanda");
const vazioItens = document.getElementById("vazioItens");
const formComanda = document.getElementById("formComanda");

let itensComanda = [];
let total = 0;

// ADICIONAR ITEM
document.querySelector(".btn-adicionar-item").addEventListener("click", () => {
  const optionSelecionada =
    selectCardapio.options[selectCardapio.selectedIndex];

  if (!optionSelecionada.value) {
    alert("Selecione um item");
    return;
  }

  const quantidade = parseInt(quantidadeItem.value);

  if (quantidade <= 0) {
    alert("Quantidade inválida");
    return;
  }

  const valor = optionSelecionada.value;
  const preco = parseFloat(optionSelecionada.dataset.preco);
  const tipo = optionSelecionada.dataset.tipo;

  const texto = optionSelecionada.text;

  const subtotal = preco * quantidade;

  // separa tipo e id
  const [tipoItem, itemId] = valor.split("_");

  const item = {
    id: Date.now(),
    tipo_item: tipo,
    item_id: itemId,
    nome: texto,
    preco,
    quantidade,
    subtotal,
  };

  itensComanda.push(item);

  renderizarItens();

  // limpa
  selectCardapio.value = "";
  quantidadeItem.value = 1;
});

// RENDERIZA LISTA
function renderizarItens() {
  listaItensAdicionados.innerHTML = "";

  if (itensComanda.length === 0) {
    listaItensAdicionados.innerHTML =
      '<p class="texto-vazio" id="vazioItens">Nenhum item adicionado</p>';

    totalComanda.innerText = "R$ 0,00";
    return;
  }

  total = 0;

  itensComanda.forEach((item) => {
    total += item.subtotal;

    const div = document.createElement("div");
    div.classList.add("item-comanda");

    div.innerHTML = `
      <div class="item-info">
        <span class="item-nome">
          ${item.nome}
        </span>

        <span class="item-detalhes">
          Quantidade: ${item.quantidade}
        </span>
      </div>

      <div class="item-acoes">
        <span class="item-subtotal">
          R$ ${item.subtotal.toFixed(2)}
        </span>

        <button 
          type="button"
          class="btn-remover-item"
          onclick="removerItem(${item.id})"
        >
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;

    listaItensAdicionados.appendChild(div);
  });

  totalComanda.innerText = `R$ ${total.toFixed(2)}`;
}

// REMOVER ITEM
function removerItem(id) {
  itensComanda = itensComanda.filter((item) => item.id !== id);

  renderizarItens();
}

// ENVIAR FORMULÁRIO
formComanda.addEventListener("submit", (e) => {
  if (itensComanda.length === 0) {
    e.preventDefault();
    alert("Adicione pelo menos um item");
    return;
  }

  // cria input hidden
  const inputItens = document.createElement("input");
  inputItens.type = "hidden";
  inputItens.name = "itens";
  inputItens.value = JSON.stringify(itensComanda);

  formComanda.appendChild(inputItens);

  // total
  const inputTotal = document.createElement("input");
  inputTotal.type = "hidden";
  inputTotal.name = "total";
  inputTotal.value = total.toFixed(2);

  formComanda.appendChild(inputTotal);
});
  
//função para atualizar status da comanda

  function atualizarStatusComanda(comandaId, novoStatus) {
  // Mapear status para os valores corretos do ENUM
  const statusMap = {
    'Em Preparo': 'em preparo',
    'Pronto': 'pronta',
    'Pendente': 'pendente',
    'Cancelada': 'cancelada'
  };

  const statusParaEnviar = statusMap[novoStatus] || novoStatus;

  fetch(`/admin/comanda/${comandaId}/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: statusParaEnviar })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      location.reload();
    } else {
      alert('Erro ao atualizar status: ' + data.message);
    }
  })
  .catch(error => {
    console.error('Erro:', error);
    alert('Erro ao conectar com o servidor');
  });
}
