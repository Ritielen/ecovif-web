const db = require("../models");
const { Op } = require("sequelize");

async function gerarRelatorio(req, res) {
  try {
    if (!req.session?.usuarioId) {
      return res.redirect("/login?msg=Faça login para continuar");
    }

    const meses = [
      { valor: "01", label: "Janeiro" },
      { valor: "02", label: "Fevereiro" },
      { valor: "03", label: "Março" },
      { valor: "04", label: "Abril" },
      { valor: "05", label: "Maio" },
      { valor: "06", label: "Junho" },
      { valor: "07", label: "Julho" },
      { valor: "08", label: "Agosto" },
      { valor: "09", label: "Setembro" },
      { valor: "10", label: "Outubro" },
      { valor: "11", label: "Novembro" },
      { valor: "12", label: "Dezembro" },
    ];

    const anos = [2024, 2025, 2026];

    const mes = parseInt(req.query.mes, 10);
    const ano = parseInt(req.query.ano, 10);

    if (isNaN(mes) || isNaN(ano)) {
      return res.render("admin/relatorio", {
        relatorio: null,
        msg: "Selecione mês e ano",

        meses,
        anos,

        selectedMes: "01",
        selectedAno: 2026,

        rankingProdutos: [],
        relatorioExiste: false,
        produtosEstoqueBaixo: [],
      });
    }

    const inicio = new Date(ano, mes - 1, 1);

    const fim = new Date(ano, mes, 0, 23, 59, 59);

    const vendas = await db.Venda.findAll({
      where: {
        created_at: {
          [Op.between]: [inicio, fim],
        },
      },
    });

    const produtos = await db.Produto.findAll({
      where: {
        created_at: {
          [Op.between]: [inicio, fim],
        },
      },
    });

   const faturamentoBruto = vendas.reduce(
  (acc, v) => acc + parseFloat(v.total_final || 0),
  0
);

const despesas = produtos.reduce(
  (acc, p) => acc + parseFloat(p.valor_compra || 0),
  0
);

const lucroLiquido = faturamentoBruto - despesas;

const margemLucro =
  faturamentoBruto > 0
    ? (lucroLiquido / faturamentoBruto) * 100
    : 0;

const quantidadeVendida = vendas.reduce(
  (acc, venda) => acc + 1,
  0
);

const ticketMedio =
  quantidadeVendida > 0
    ? faturamentoBruto / quantidadeVendida
    : 0;

const produtosEstoqueBaixo = await db.Produto.findAll({
  where: {
    quantidade: {
      [Op.lte]: db.Sequelize.col("quantidade_minima"),
    },
  },
});

const rankingProdutos = await db.ItemComanda.findAll({
  attributes: [
    "produto_id",
    
    "tipo_item",
    [
      db.Sequelize.fn(
        "COUNT",
        db.Sequelize.col("produto_id")
      ),
      "quantidade",
    ],
  ],

  group: [
    "produto_id",
    "quantidade",
    "tipo_item",
  ],

  order: [
    [
      db.Sequelize.literal("quantidade"),
      "DESC",
    ],
  ],
});

const produtoTop = rankingProdutos[0];

let relatorio = await db.RelatorioMensal.findOne({
  where: {
    mes,
    ano,
    usuario_id: req.session.usuarioId,
  },
});

const dadosRelatorio = {
  mes,
  ano,

  faturamento_bruto: faturamentoBruto,

  despesas,

  lucro_liquido: lucroLiquido,

  margem_lucro: margemLucro,

  ticket_medio: ticketMedio,

  estoque_critico: produtosEstoqueBaixo.length,

  posicao: 1,

  quantidade_vendida:
    produtoTop?.dataValues?.quantidade_vendida || 0,

  tipo_item:
    produtoTop?.tipo_item || "produto",

  produto_id:
    produtoTop?.produto_id || null,

  venda_id:
    vendas[0]?.id || null,

  usuario_id: req.session.usuarioId,
};

       
if (!relatorio) {
   
    relatorio = await db.RelatorioMensal.upsert({
      mes,
      ano,
      faturamento_bruto: faturamentoBruto,
      despesas,
      lucro_liquido: lucroLiquido,
      margem_lucro: margemLucro,
      ticket_medio: ticketMedio,
      estoque_critico: 0,
      posicao: 1,
      quantidade_vendida: quantidadeVendida,
      tipo_item: "prato",
      usuario_id: req.session.usuarioId,
    });
  }

    return res.render("admin/relatorio", {
      relatorio,
      msg: "Relatório gerado com sucesso",

      meses,
      anos,

      selectedMes: String(mes).padStart(2, "0"),
      selectedAno: ano,

      rankingProdutos: [],
      relatorioExiste: true,
      produtosEstoqueBaixo: [],
    });

  } catch (error) {
    console.error(error);

    return res.render("admin/relatorio", {
      relatorio: null,
      msg: "Erro ao gerar relatório",

      meses: [],
      anos: [],

      selectedMes: "01",
      selectedAno: 2026,

      rankingProdutos: [],
      relatorioExiste: false,
      produtosEstoqueBaixo: [],
    });
  }
}

module.exports = {
  gerarRelatorio,
};