const db = require("../models");
const { Op } = require("sequelize");

// ============================================================
// MOSTRA RELATÓRIO NA TELA
// ============================================================

async function mostrarRelatorio(req, res) {
  const anoAtual = new Date().getFullYear();
  const meses = [
    { valor: "01", label: "JAN" },
    { valor: "02", label: "FEV" },
    { valor: "03", label: "MAR" },
    { valor: "04", label: "ABR" },
    { valor: "05", label: "MAI" },
    { valor: "06", label: "JUN" },
    { valor: "07", label: "JUL" },
    { valor: "08", label: "AGO" },
    { valor: "09", label: "SET" },
    { valor: "10", label: "OUT" },
    { valor: "11", label: "NOV" },
    { valor: "12", label: "DEZ" },
  ];

  try {
    const selectedRankingMes   = Number(req.query.rankingMes)    || new Date().getMonth() + 1;
    const selectedRankingAno   = Number(req.query.rankingAno)    || anoAtual;
    const selectedRelatorioMes = Number(req.query.relatorioMes)  || new Date().getMonth() + 1;
    const selectedRelatorioAno = Number(req.query.relatorioAno)  || anoAtual;
    const usuarioId            = req.session?.usuarioId;

    const [relatorioRanking, relatorioMensal] = await Promise.all([
      db.RelatorioMensal.findOne({
        where: { usuario_id: usuarioId, mes: selectedRankingMes, ano: selectedRankingAno },
        include: [
          {
            model: db.RankingProdutosMensal,
            as: "ranking_produtos",
            include: [{ model: db.Produto, as: "produto" }],
          },
        ],
      }),
      db.RelatorioMensal.findOne({
        where: { usuario_id: usuarioId, mes: selectedRelatorioMes, ano: selectedRelatorioAno },
      }),
    ]);

    const rankingProdutos = relatorioRanking?.ranking_produtos
      ? relatorioRanking.ranking_produtos
          .map((item) => ({
            posicao: item.posicao,
            nome: item.produto?.nome || "Produto não encontrado",
            tipo: item.tipo_item,
            quantidade_vendida: Number(item.quantidade_vendida || 0),
            faturamento_produto: Number(item.faturamento_produto || 0),
          }))
          .sort((a, b) => a.posicao - b.posicao)
      : [];

    res.render("admin/relatorio", {
      meses,
      anos: [anoAtual - 2, anoAtual - 1, anoAtual, anoAtual + 1],
      selectedRankingMes,
      selectedRankingAno,
      selectedRelatorioMes,
      selectedRelatorioAno,
      faturamentoBruto : Number(relatorioMensal?.faturamento_bruto || 0),
      despesas         : Number(relatorioMensal?.despesas          || 0),
      lucroLiquido     : Number(relatorioMensal?.lucro_liquido     || 0),
      margemLucro      : Number(relatorioMensal?.margem_lucro      || 0),
      ticketMedio      : Number(relatorioMensal?.ticket_medio      || 0),
      totalVendas      : Number(relatorioMensal?.total_vendas      || 0),
      relatorioExiste  : !!relatorioMensal,
      rankingProdutos,
    });
  } catch (error) {
    console.error("❌ Erro em mostrarRelatorio:", error.message);
    res.render("admin/relatorio", {
      meses,
      anos: [anoAtual - 2, anoAtual - 1, anoAtual, anoAtual + 1],
      selectedRankingMes   : new Date().getMonth() + 1,
      selectedRankingAno   : anoAtual,
      selectedRelatorioMes : new Date().getMonth() + 1,
      selectedRelatorioAno : anoAtual,
      faturamentoBruto: 0,
      despesas        : 0,
      lucroLiquido    : 0,
      margemLucro     : 0,
      ticketMedio     : 0,
      totalVendas     : 0,
      relatorioExiste : false,
      rankingProdutos : [],
    });
  }
}


module.exports = {
  mostrarRelatorio,
  
};