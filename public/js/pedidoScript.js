document.addEventListener("DOMContentLoaded", () => {

  // =============================================
  // CARDS
  // =============================================

  function pegarComandas() {
    return document.querySelectorAll(".card-pedido");
  }

  // =============================================
  // FILTROS
  // =============================================

  const botoesFiltroCozinha =
    document.querySelectorAll(".btn-filtro-cozinha");

  botoesFiltroCozinha.forEach(btn => {

    btn.addEventListener("click", () => {

      botoesFiltroCozinha.forEach(b =>
        b.classList.remove("active")
      );

      btn.classList.add("active");

      const texto =
        btn.textContent.trim().toLowerCase();

      pegarComandas().forEach(card => {

        const badge =
          card.querySelector(".badge-status");

        const status =
          badge?.textContent.trim().toLowerCase();

        if (texto.includes("todos")) {

          card.style.display = "block";

        } else if (
          texto.includes("pendente") &&
          status === "pendente"
        ) {

          card.style.display = "block";

        } else if (
          texto.includes("preparo") &&
          status === "em preparo"
        ) {

          card.style.display = "block";

        } else if (
          texto.includes("pronto") &&
          status === "pronta"
        ) {

          card.style.display = "block";

        } else {

          card.style.display = "none";

        }

      });

    });

  });

  // =============================================
  // PESQUISA
  // =============================================

  const inputPesquisa =
    document.getElementById("inputPesquisa");

  const btnPesquisar =
    document.getElementById("btnPesquisar");

  const btnLimpar =
    document.getElementById("btnLimparFiltro");

  const msgSemResultado =
    document.getElementById("msgSemResultado");

  const termoPesquisado =
    document.getElementById("termoPesquisado");

  function executarPesquisa() {

    const termo =
      inputPesquisa.value.trim().toLowerCase();

    let encontrou = false;

    pegarComandas().forEach(card => {

      const textoCard =
        card.textContent.toLowerCase();

      if (
        !termo ||
        textoCard.includes(termo)
      ) {

        card.style.display = "block";
        encontrou = true;

      } else {

        card.style.display = "none";

      }

    });

    if (!encontrou && termo) {

      termoPesquisado.textContent =
        inputPesquisa.value.trim();

      msgSemResultado.style.display = "block";

    } else {

      msgSemResultado.style.display = "none";

    }

  }

  btnPesquisar.addEventListener(
    "click",
    executarPesquisa
  );

  inputPesquisa.addEventListener(
    "keydown",
    (e) => {

      if (e.key === "Enter") {
        executarPesquisa();
      }

    }
  );

  btnLimpar.addEventListener("click", () => {

    inputPesquisa.value = "";

    msgSemResultado.style.display = "none";

    pegarComandas().forEach(card => {
      card.style.display = "block";
    });

    botoesFiltroCozinha.forEach(b =>
      b.classList.remove("active")
    );

    if (botoesFiltroCozinha[0]) {
      botoesFiltroCozinha[0].classList.add("active");
    }

  });

  // =============================================
  // STATUS
  // =============================================

  async function atualizarStatus(
    comandaId,
    novoStatus,
    btn
  ) {

    try {

      btn.disabled = true;

      const response = await fetch(
        `/pedidoCozinha/${comandaId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            status: novoStatus
          })
        }
      );

      if (!response.ok) {
        throw new Error();
      }

      const card =
        btn.closest(".card-pedido");

      const badge =
        card.querySelector(".badge-status");

      badge.textContent = novoStatus;

      badge.className =
        `badge-status ${novoStatus}`;

    } catch (error) {

      console.error(error);

      alert("Erro ao atualizar status");

      btn.disabled = false;

    }

  }

  // =============================================
  // EVENTOS DOS BOTÕES
  // =============================================

  const listaPedidos =
    document.getElementById("listaPedidos");

  listaPedidos.addEventListener("click", (e) => {

    const card =
      e.target.closest(".card-pedido");

    if (!card) return;

    const comandaId = card.dataset.id;

    if (
      e.target.closest(".btn-em-preparo")
    ) {

      atualizarStatus(
        comandaId,
        "em preparo",
        e.target.closest(".btn-em-preparo")
      );

    }

    if (
      e.target.closest(".btn-pronto")
    ) {

      atualizarStatus(
        comandaId,
        "pronta",
        e.target.closest(".btn-pronto")
      );

    }

  });

});