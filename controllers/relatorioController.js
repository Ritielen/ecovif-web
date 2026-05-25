const db = require("../models");
const { Op } = require("sequelize");

//instalando dependências:
//npm install pdfkit

//  gerar pdf
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

//instalando dependências:
//npm install exceljs

// gerar planilha excel
const ExcelJS = require('exceljs');

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

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

function gerarAnos() {
  const anoAtual = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, i) => anoAtual + i);
}

function periodoMes(mes, ano) {
  const inicio = new Date(ano, mes - 1, 1);
  const fim = new Date(ano, mes, 0, 23, 59, 59);
  return { inicio, fim };
}

function verificarSessao(req, res) {
  if (!req.session?.usuarioId) {
    res.redirect("/login");
    return null;
  }
  return req.session.usuarioId;
}

// ─────────────────────────────────────────────
// FUNÇÃO 1 — DADOS DIÁRIOS (tabela por dia)
// ─────────────────────────────────────────────
//
// Retorna, para cada dia do mês selecionado:
//   - faturamento (soma das vendas do dia)
//   - despesas    (soma dos produtos cadastrados no dia)
//   - lucro       (faturamento - despesas)
//   - qtd_vendas  (número de vendas)
//
// Rota sugerida:
//   GET /admin/relatorio/diario?mes=05&ano=2025
//   Pode ser chamada via fetch/AJAX para atualizar a tabela sem recarregar a página.
// ─────────────────────────────────────────────

async function obterDadosDiarios(req, res) {
  try {
    const usuarioId = verificarSessao(req, res);
    if (!usuarioId) return;

    const mes = parseInt(req.query.mes);
    const ano = parseInt(req.query.ano);

    if (isNaN(mes) || isNaN(ano)) {
      return res.status(400).json({ erro: "Parâmetros mes e ano são obrigatórios." });
    }

    const { inicio, fim } = periodoMes(mes, ano);

    // Busca todas as vendas do mês
    const vendas = await db.Venda.findAll({
      where: {
        usuario_id: usuarioId,
        data_venda: { [Op.between]: [inicio, fim] },
      },
      attributes: ["data_venda", "total_final"],
    });

    // Busca todos os produtos cadastrados no mês (representam despesas)
    const produtos = await db.Produto.findAll({
      where: {
        usuario_id: usuarioId,
        created_at: { [Op.between]: [inicio, fim] },
      },
      attributes: ["created_at", "valor_compra"],
    });

    // Descobre quantos dias tem o mês
    const diasNoMes = new Date(ano, mes, 0).getDate();

    // Monta um objeto indexado por dia: { 1: {...}, 2: {...}, ... }
    const diasMap = {};
    for (let d = 1; d <= diasNoMes; d++) {
      diasMap[d] = { dia: d, faturamento: 0, despesas: 0, lucro: 0, qtd_vendas: 0 };
    }

    // Acumula vendas por dia
    for (const venda of vendas) {
      const dia = new Date(venda.data_venda).getDate();
      if (diasMap[dia]) {
        diasMap[dia].faturamento += parseFloat(venda.total_final || 0);
        diasMap[dia].qtd_vendas += 1;
      }
    }

    // Acumula despesas por dia
    for (const produto of produtos) {
      const dia = new Date(produto.created_at).getDate();
      if (diasMap[dia]) {
        diasMap[dia].despesas += parseFloat(produto.valor_compra || 0);
      }
    }

    // Calcula lucro e formata os valores
    const dadosDiarios = Object.values(diasMap).map((d) => ({
      dia: d.dia,
      faturamento: parseFloat(d.faturamento.toFixed(2)),
      despesas: parseFloat(d.despesas.toFixed(2)),
      lucro: parseFloat((d.faturamento - d.despesas).toFixed(2)),
      qtd_vendas: d.qtd_vendas,
    }));

    return res.json({ mes, ano, dadosDiarios });
  } catch (error) {
    console.error("[obterDadosDiarios]", error);
    return res.status(500).json({ erro: "Erro ao buscar dados diários." });
  }
}

// ─────────────────────────────────────────────
// FUNÇÃO 2 — RELATÓRIO CONSOLIDADO DO MÊS
// ─────────────────────────────────────────────
//
// Gera (ou atualiza via upsert) o relatório mensal com:
//   - faturamento bruto, despesas, lucro, margem, ticket médio
//   - ranking dos itens mais vendidos
//   - produtos com estoque crítico
//   - totais de itens vendidos
//
// Rota sugerida:
//   GET /admin/relatorio?mes=05&ano=2025
// ─────────────────────────────────────────────

async function gerarRelatorio(req, res) {
  try {
    const usuarioId = verificarSessao(req, res);
    if (!usuarioId) return;

    const anos = gerarAnos();
    const anoAtual = new Date().getFullYear();
    const mes = parseInt(req.query.mes);
    const ano = parseInt(req.query.ano);

    // Sem parâmetros → renderiza a página sem dados
    if (isNaN(mes) || isNaN(ano)) {
      return res.render("admin/relatorio", {
        relatorio: null,
        meses,
        anos,
        selectedMes: String(new Date().getMonth() + 1).padStart(2, "0"),
        selectedAno: anoAtual,
        rankingProdutos: [],
        produtosEstoqueBaixo: [],
        relatorioExiste: false,
        msg: "Selecione mês e ano",
      });
    }

    const { inicio, fim } = periodoMes(mes, ano);

    // ── VENDAS ──────────────────────────────────
    const vendas = await db.Venda.findAll({
      where: {
        usuario_id: usuarioId,
        data_venda: { [Op.between]: [inicio, fim] },
      },
    });

    const totalVendas = vendas.length;
    const faturamentoBruto = vendas.reduce(
      (acc, v) => acc + parseFloat(v.total_final || 0),
      0
    );
    const ticketMedio = totalVendas > 0 ? faturamentoBruto / totalVendas : 0;

    // ── DESPESAS (produtos cadastrados no período) ──
    const produtos = await db.Produto.findAll({
      where: {
        usuario_id: usuarioId,
        created_at: { [Op.between]: [inicio, fim] },
      },
    });

    const despesas = produtos.reduce(
      (acc, p) => acc + parseFloat(p.valor_compra || 0),
      0
    );

    // ── LUCRO E MARGEM ──────────────────────────
    const lucroLiquido = faturamentoBruto - despesas;
    const margemLucro =
      faturamentoBruto > 0 ? (lucroLiquido / faturamentoBruto) * 100 : 0;

    // ── ESTOQUE CRÍTICO ─────────────────────────
    const produtosEstoqueBaixo = await db.Produto.findAll({
      where: {
        usuario_id: usuarioId,
        quantidade: { [Op.lte]: db.Sequelize.col("quantidade_minima") },
      },
    });

    // ── RANKING DE ITENS VENDIDOS ────────────────
    //
    // Estrutura das associações:
    //   ItemComanda → Produto  (tipo_item = 'produto')  → produto.nome
    //   ItemComanda → Prato    (tipo_item = 'prato')    → prato.nome
    //   ItemComanda → Bebida   (tipo_item = 'bebida')   → bebida.produto.nome
    //     (Bebida não tem nome próprio — o nome vem do Produto associado via bebida.produto_id)
    //
    // Por causa do join aninhado (bebida → produto), o GROUP BY com Sequelize
    // fica complexo e propenso a erros. A solução mais robusta é buscar os
    // itens sem GROUP BY e agrupar em JavaScript, evitando conflitos de coluna.

    const itensComandaRaw = await db.ItemComanda.findAll({
      attributes: ["produto_id", "prato_id", "bebida_id", "tipo_item", "quantidade"],
      include: [
        {
          model: db.Comanda,
          as: "comanda",
          attributes: [],
          where: {
            usuario_id: usuarioId,
            created_at: { [Op.between]: [inicio, fim] },
          },
          required: true,
        },
        {
          model: db.Produto,
          as: "produto",
          attributes: ["id", "nome"],
          required: false,
        },
        {
          model: db.Prato,
          as: "prato",
          attributes: ["id", "nome"],
          required: false,
        },
        {
          // Bebida não tem nome — busca o Produto vinculado à Bebida para pegar o nome
          model: db.Bebida,
          as: "bebida",
          attributes: ["id", "produto_id"],
          required: false,
          include: [
            {
              model: db.Produto,
              as: "produto",
              attributes: ["id", "nome"],
              required: false,
            },
          ],
        },
      ],
    });

    // Agrupa por chave única (tipo_item + id do item) em JavaScript
    const agrupado = {};

    for (const item of itensComandaRaw) {
      const d = item.get({ plain: true });

      // Monta a chave e o nome conforme o tipo
      let chave, nomeItem;

      if (d.tipo_item === "produto" && d.produto) {
        chave    = `produto_${d.produto_id}`;
        nomeItem = d.produto.nome;
      } else if (d.tipo_item === "prato" && d.prato) {
        chave    = `prato_${d.prato_id}`;
        nomeItem = d.prato.nome;
      } else if (d.tipo_item === "bebida" && d.bebida) {
        chave    = `bebida_${d.bebida_id}`;
        // Nome vem do Produto associado à Bebida
        nomeItem = d.bebida.produto?.nome || `Bebida #${d.bebida_id}`;
      } else {
        chave    = `outro_${d.produto_id || d.prato_id || d.bebida_id}`;
        nomeItem = `Item #${d.produto_id || d.prato_id || d.bebida_id}`;
      }

      if (!agrupado[chave]) {
        agrupado[chave] = {
          produto_id:        d.produto_id,
          prato_id:          d.prato_id,
          bebida_id:         d.bebida_id,
          tipo_item:         d.tipo_item,
          nome:              nomeItem,
          quantidade_vendida: 0,
        };
      }

      agrupado[chave].quantidade_vendida += parseInt(d.quantidade || 0);
    }

    // Ordena por quantidade vendida (maior → menor)
    const rankingProdutos = Object.values(agrupado).sort(
      (a, b) => b.quantidade_vendida - a.quantidade_vendida
    );

    const quantidadeVendida = rankingProdutos.reduce(
      (acc, item) => acc + item.quantidade_vendida,
      0
    );

    // ── SALVA / ATUALIZA O RELATÓRIO NO BANCO ───
    await db.RelatorioMensal.upsert({
      mes,
      ano,
      faturamento_bruto: faturamentoBruto,
      despesas,
      lucro_liquido: lucroLiquido,
      margem_lucro: margemLucro,
      ticket_medio: ticketMedio,
      estoque_critico: produtosEstoqueBaixo.length,
      usuario_id: usuarioId,
    });

    const relatorio = await db.RelatorioMensal.findOne({
      where: { mes, ano, usuario_id: usuarioId },
    });

    return res.render("admin/relatorio", {
      relatorio,
      meses,
      anos,
      selectedMes: String(mes).padStart(2, "0"),
      selectedAno: ano,
      rankingProdutos,
      produtosEstoqueBaixo,
      quantidadeVendida,
      relatorioExiste: true,
      msg: "Relatório atualizado em tempo real",
    });
  } catch (error) {
    console.error("[gerarRelatorio]", error);
    const anos = gerarAnos();
    return res.render("admin/relatorio", {
      relatorio: null,
      meses,
      anos,
      selectedMes: "01",
      selectedAno: new Date().getFullYear(),
      rankingProdutos: [],
      produtosEstoqueBaixo: [],
      relatorioExiste: false,
      msg: "Erro ao gerar relatório",
    });
  }
}


// ─────────────────────────────────────────────
// FUNÇÃO 3 — EXPORTAR RELATÓRIO EM PDF
// ─────────────────────────────────────────────
//
// Gera um arquivo PDF com os dados do relatório mensal
// e faz o download automático
//
// Rota sugerida:
//   GET /admin/relatorio/pdf?mes=05&ano=2025
// ─────────────────────────────────────────────

async function exportarPDF(req, res) {
  try {
    const usuarioId = verificarSessao(req, res);
    if (!usuarioId) return;

    const mes = parseInt(req.query.mes);
    const ano = parseInt(req.query.ano);

    if (isNaN(mes) || isNaN(ano)) {
      return res.status(400).send("Parâmetros mes e ano são obrigatórios.");
    }

    const { inicio, fim } = periodoMes(mes, ano);
    const mesLabel = meses.find(m => m.valor === String(mes).padStart(2, '0'))?.label || `Mês ${mes}`;

    // Buscar dados do relatório
    const relatorio = await db.RelatorioMensal.findOne({
      where: { mes, ano, usuario_id: usuarioId }
    });

    if (!relatorio) {
      return res.status(404).send("Relatório não encontrado para este período.");
    }

    // Buscar ranking de produtos
    const itensComandaRaw = await db.ItemComanda.findAll({
      attributes: ["produto_id", "prato_id", "bebida_id", "tipo_item", "quantidade"],
      include: [
        {
          model: db.Comanda,
          as: "comanda",
          attributes: [],
          where: {
            usuario_id: usuarioId,
            created_at: { [Op.between]: [inicio, fim] },
          },
          required: true,
        },
        {
          model: db.Produto,
          as: "produto",
          attributes: ["id", "nome"],
          required: false,
        },
        {
          model: db.Prato,
          as: "prato",
          attributes: ["id", "nome"],
          required: false,
        },
        {
          model: db.Bebida,
          as: "bebida",
          attributes: ["id", "produto_id"],
          required: false,
          include: [
            {
              model: db.Produto,
              as: "produto",
              attributes: ["id", "nome"],
              required: false,
            },
          ],
        },
      ],
    });

    // Agrupar produtos
    const agrupado = {};
    for (const item of itensComandaRaw) {
      const d = item.get({ plain: true });
      let chave, nomeItem;

      if (d.tipo_item === "produto" && d.produto) {
        chave = `produto_${d.produto_id}`;
        nomeItem = d.produto.nome;
      } else if (d.tipo_item === "prato" && d.prato) {
        chave = `prato_${d.prato_id}`;
        nomeItem = d.prato.nome;
      } else if (d.tipo_item === "bebida" && d.bebida) {
        chave = `bebida_${d.bebida_id}`;
        nomeItem = d.bebida.produto?.nome || `Bebida #${d.bebida_id}`;
      } else {
        continue;
      }

      if (!agrupado[chave]) {
        agrupado[chave] = {
          nome: nomeItem,
          quantidade_vendida: 0,
        };
      }
      agrupado[chave].quantidade_vendida += parseInt(d.quantidade || 0);
    }

    const rankingProdutos = Object.values(agrupado)
      .sort((a, b) => b.quantidade_vendida - a.quantidade_vendida)
      .slice(0, 10); // Top 10

    // Buscar produtos com estoque baixo
    const produtosEstoqueBaixo = await db.Produto.findAll({
      where: {
        usuario_id: usuarioId,
        quantidade: { [Op.lte]: db.Sequelize.col("quantidade_minima") },
      },
      attributes: ["nome", "quantidade", "quantidade_minima"],
      limit: 10,
    });

    // Criar PDF
    const doc = new PDFDocument({ margin: 50 });
    const filename = `relatorio_${mes}_${ano}.pdf`;
    
    // Configurar headers para download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    
    // Pipe do PDF para a resposta
    doc.pipe(res);

    // Cabeçalho
    doc.fontSize(20).font('Helvetica-Bold').text('Relatório Mensal', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).font('Helvetica').text(`${mesLabel} de ${ano}`, { align: 'center' });
    doc.moveDown(2);

    // Linha separadora
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    // Resumo Financeiro
    doc.fontSize(16).font('Helvetica-Bold').text('Resumo Financeiro');
    doc.moveDown();
    doc.fontSize(12).font('Helvetica');

    const dadosFinanceiros = [
      { label: 'Faturamento Bruto:', valor: `R$ ${parseFloat(relatorio.faturamento_bruto).toFixed(2)}` },
      { label: 'Despesas:', valor: `R$ ${parseFloat(relatorio.despesas).toFixed(2)}` },
      { label: 'Lucro Líquido:', valor: `R$ ${parseFloat(relatorio.lucro_liquido).toFixed(2)}` },
      { label: 'Margem de Lucro:', valor: `${parseFloat(relatorio.margem_lucro).toFixed(2)}%` },
      { label: 'Ticket Médio:', valor: `R$ ${parseFloat(relatorio.ticket_medio).toFixed(2)}` },
      { label: 'Produtos em Estoque Crítico:', valor: relatorio.estoque_critico },
    ];

    dadosFinanceiros.forEach(({ label, valor }) => {
      doc.text(`${label} `, { continued: true }).font('Helvetica-Bold').text(valor);
      doc.moveDown(0.5);
    });

    doc.moveDown(2);

    // Ranking de Produtos Mais Vendidos
    if (rankingProdutos.length > 0) {
      doc.fontSize(16).font('Helvetica-Bold').text('Top 10 - Produtos Mais Vendidos');
      doc.moveDown();
      doc.fontSize(12).font('Helvetica');

      // Tabela
      const tableTop = doc.y;
      const col1 = 50;
      const col2 = 350;
      const col3 = 450;

      // Cabeçalho da tabela
      doc.font('Helvetica-Bold');
      doc.text('Posição', col1, tableTop);
      doc.text('Produto', col2, tableTop);
      doc.text('Qtd. Vendida', col3, tableTop);
      doc.moveDown();
      
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);

      doc.font('Helvetica');
      rankingProdutos.forEach((item, index) => {
        const y = doc.y;
        doc.text(`${index + 1}º`, col1, y);
        doc.text(item.nome.substring(0, 30), col2, y);
        doc.text(item.quantidade_vendida.toString(), col3, y);
        doc.moveDown(0.5);
      });
    }

    doc.moveDown(2);

    // Produtos com Estoque Baixo
    if (produtosEstoqueBaixo.length > 0) {
      doc.fontSize(16).font('Helvetica-Bold').text('Produtos com Estoque Crítico');
      doc.moveDown();
      doc.fontSize(12).font('Helvetica');

      produtosEstoqueBaixo.forEach(produto => {
        doc.text(`• ${produto.nome} - Estoque: ${produto.quantidade} (Mínimo: ${produto.quantidade_minima})`);
        doc.moveDown(0.5);
      });
    }

    // Rodapé
    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();
    doc.fontSize(10).font('Helvetica').text(
      `Relatório gerado em ${new Date().toLocaleString('pt-BR')}`,
      { align: 'center' }
    );

    // Finalizar o documento
    doc.end();

  } catch (error) {
    console.error("[exportarPDF]", error);
    if (!res.headersSent) {
      res.status(500).send("Erro ao gerar PDF");
    }
  }
}

// ─────────────────────────────────────────────
// FUNÇÃO 4 — EXPORTAR RELATÓRIO EM EXCEL
// ─────────────────────────────────────────────
//
// Gera um arquivo Excel com múltiplas abas:
//   - Resumo Financeiro
//   - Ranking de Produtos
//   - Estoque Crítico
//   - Dados Diários (detalhamento por dia)
//
// Rota sugerida:
//   GET /admin/relatorio/excel?mes=05&ano=2025
// ─────────────────────────────────────────────

async function exportarExcel(req, res) {
  try {
    const usuarioId = verificarSessao(req, res);
    if (!usuarioId) return;

    const mes = parseInt(req.query.mes);
    const ano = parseInt(req.query.ano);

    if (isNaN(mes) || isNaN(ano)) {
      return res.status(400).send("Parâmetros mes e ano são obrigatórios.");
    }

    const { inicio, fim } = periodoMes(mes, ano);
    const mesLabel = meses.find(m => m.valor === String(mes).padStart(2, '0'))?.label || `Mês ${mes}`;

    // Buscar dados do relatório consolidado
    const relatorio = await db.RelatorioMensal.findOne({
      where: { mes, ano, usuario_id: usuarioId }
    });

    if (!relatorio) {
      return res.status(404).send("Relatório não encontrado para este período.");
    }

    // Buscar dados diários
    const vendas = await db.Venda.findAll({
      where: {
        usuario_id: usuarioId,
        data_venda: { [Op.between]: [inicio, fim] },
      },
      attributes: ["data_venda", "total_final"],
    });

    const produtos = await db.Produto.findAll({
      where: {
        usuario_id: usuarioId,
        created_at: { [Op.between]: [inicio, fim] },
      },
      attributes: ["created_at", "valor_compra"],
    });

    // Calcular dados diários
    const diasNoMes = new Date(ano, mes, 0).getDate();
    const diasMap = {};
    for (let d = 1; d <= diasNoMes; d++) {
      diasMap[d] = { dia: d, faturamento: 0, despesas: 0, qtd_vendas: 0 };
    }

    for (const venda of vendas) {
      const dia = new Date(venda.data_venda).getDate();
      if (diasMap[dia]) {
        diasMap[dia].faturamento += parseFloat(venda.total_final || 0);
        diasMap[dia].qtd_vendas += 1;
      }
    }

    for (const produto of produtos) {
      const dia = new Date(produto.created_at).getDate();
      if (diasMap[dia]) {
        diasMap[dia].despesas += parseFloat(produto.valor_compra || 0);
      }
    }

    const dadosDiarios = Object.values(diasMap).map(d => ({
      dia: d.dia,
      faturamento: parseFloat(d.faturamento.toFixed(2)),
      despesas: parseFloat(d.despesas.toFixed(2)),
      lucro: parseFloat((d.faturamento - d.despesas).toFixed(2)),
      qtd_vendas: d.qtd_vendas,
    }));

    // Buscar ranking de produtos
    const itensComandaRaw = await db.ItemComanda.findAll({
      attributes: ["produto_id", "prato_id", "bebida_id", "tipo_item", "quantidade"],
      include: [
        {
          model: db.Comanda,
          as: "comanda",
          attributes: [],
          where: {
            usuario_id: usuarioId,
            created_at: { [Op.between]: [inicio, fim] },
          },
          required: true,
        },
        {
          model: db.Produto,
          as: "produto",
          attributes: ["id", "nome"],
          required: false,
        },
        {
          model: db.Prato,
          as: "prato",
          attributes: ["id", "nome"],
          required: false,
        },
        {
          model: db.Bebida,
          as: "bebida",
          attributes: ["id", "produto_id"],
          required: false,
          include: [
            {
              model: db.Produto,
              as: "produto",
              attributes: ["id", "nome"],
              required: false,
            },
          ],
        },
      ],
    });

    // Agrupar produtos
    const agrupado = {};
    for (const item of itensComandaRaw) {
      const d = item.get({ plain: true });
      let chave, nomeItem, tipoItem;

      if (d.tipo_item === "produto" && d.produto) {
        chave = `produto_${d.produto_id}`;
        nomeItem = d.produto.nome;
        tipoItem = "Produto";
      } else if (d.tipo_item === "prato" && d.prato) {
        chave = `prato_${d.prato_id}`;
        nomeItem = d.prato.nome;
        tipoItem = "Prato";
      } else if (d.tipo_item === "bebida" && d.bebida) {
        chave = `bebida_${d.bebida_id}`;
        nomeItem = d.bebida.produto?.nome || `Bebida #${d.bebida_id}`;
        tipoItem = "Bebida";
      } else {
        continue;
      }

      if (!agrupado[chave]) {
        agrupado[chave] = {
          nome: nomeItem,
          tipo: tipoItem,
          quantidade_vendida: 0,
        };
      }
      agrupado[chave].quantidade_vendida += parseInt(d.quantidade || 0);
    }

    const rankingProdutos = Object.values(agrupado)
      .sort((a, b) => b.quantidade_vendida - a.quantidade_vendida);

    // Buscar produtos com estoque baixo
    const produtosEstoqueBaixo = await db.Produto.findAll({
      where: {
        usuario_id: usuarioId,
        quantidade: { [Op.lte]: db.Sequelize.col("quantidade_minima") },
      },
      attributes: ["nome", "quantidade", "quantidade_minima", "valor_compra"],
    });

    // ── CRIAR WORKBOOK EXCEL ──────────────────
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema de Gestão';
    workbook.created = new Date();

    // Função helper para aplicar estilo em cabeçalhos
    function aplicarEstiloCabecalho(worksheet, row, colunas) {
      const headerRow = worksheet.getRow(row);
      headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4472C4' },
      };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
      
      // Borda nos cabeçalhos
      for (let col = 1; col <= colunas; col++) {
        headerRow.getCell(col).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      }
    }

    // Função helper para adicionar bordas em células
    function adicionarBordas(worksheet, startRow, endRow, colunas) {
      for (let row = startRow; row <= endRow; row++) {
        for (let col = 1; col <= colunas; col++) {
          worksheet.getRow(row).getCell(col).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        }
      }
    }

    // ─────────────────────────────────────────
    // ABA 1: RESUMO FINANCEIRO
    // ─────────────────────────────────────────
    const wsResumo = workbook.addWorksheet('Resumo Financeiro');
    
    // Título
    wsResumo.mergeCells('A1:C1');
    const tituloCell = wsResumo.getCell('A1');
    tituloCell.value = `Relatório Mensal - ${mesLabel} de ${ano}`;
    tituloCell.font = { bold: true, size: 16, color: { argb: '2F5496' } };
    tituloCell.alignment = { horizontal: 'center', vertical: 'middle' };
    wsResumo.getRow(1).height = 30;

    // Espaçamento
    wsResumo.addRow([]);

    // Dados financeiros
    const dadosFinanceiros = [
      ['Indicador', 'Valor', 'Percentual'],
      ['Faturamento Bruto', parseFloat(relatorio.faturamento_bruto), '100%'],
      ['Despesas', parseFloat(relatorio.despesas), `${((relatorio.despesas / relatorio.faturamento_bruto) * 100).toFixed(2)}%`],
      ['Lucro Líquido', parseFloat(relatorio.lucro_liquido), `${parseFloat(relatorio.margem_lucro).toFixed(2)}%`],
      ['Ticket Médio', parseFloat(relatorio.ticket_medio), '-'],
      ['Produtos em Estoque Crítico', relatorio.estoque_critico, '-'],
    ];

    dadosFinanceiros.forEach((row, index) => {
      const excelRow = wsResumo.addRow(row);
      if (index === 0) {
        aplicarEstiloCabecalho(wsResumo, excelRow.number, 3);
      }
    });

    // Formatar valores monetários
    for (let i = 4; i <= 8; i++) {
      const cell = wsResumo.getRow(i).getCell(2);
      if (i !== 8) { // Não formatar "Produtos em Estoque Crítico" como moeda
        cell.numFormat = 'R$ #,##0.00';
      }
      cell.alignment = { horizontal: 'center' };
    }

    // Ajustar largura das colunas
    wsResumo.getColumn(1).width = 30;
    wsResumo.getColumn(2).width = 20;
    wsResumo.getColumn(3).width = 15;

    // Centralizar dados
    wsResumo.getColumn(2).alignment = { horizontal: 'center' };
    wsResumo.getColumn(3).alignment = { horizontal: 'center' };

    // Bordas na tabela
    adicionarBordas(wsResumo, 3, 8, 3);

    // ─────────────────────────────────────────
    // ABA 2: DADOS DIÁRIOS
    // ─────────────────────────────────────────
    const wsDiario = workbook.addWorksheet('Dados Diários');

    // Título
    wsDiario.mergeCells('A1:E1');
    const tituloDiario = wsDiario.getCell('A1');
    tituloDiario.value = `Movimentação Diária - ${mesLabel} de ${ano}`;
    tituloDiario.font = { bold: true, size: 14, color: { argb: '2F5496' } };
    tituloDiario.alignment = { horizontal: 'center' };
    wsDiario.getRow(1).height = 25;

    wsDiario.addRow([]);

    // Cabeçalhos
    const headersDiario = ['Dia', 'Faturamento', 'Despesas', 'Lucro', 'Qtd. Vendas'];
    const headerRowDiario = wsDiario.addRow(headersDiario);
    aplicarEstiloCabecalho(wsDiario, headerRowDiario.number, 5);

    // Dados
    let totalFaturamento = 0;
    let totalDespesas = 0;
    let totalLucro = 0;
    let totalVendas = 0;

    dadosDiarios.forEach(d => {
      wsDiario.addRow([
        d.dia,
        d.faturamento,
        d.despesas,
        d.lucro,
        d.qtd_vendas,
      ]);
      totalFaturamento += d.faturamento;
      totalDespesas += d.despesas;
      totalLucro += d.lucro;
      totalVendas += d.qtd_vendas;
    });

    // Linha de totais
    const totalRow = wsDiario.addRow([
      'TOTAL',
      totalFaturamento,
      totalDespesas,
      totalLucro,
      totalVendas,
    ]);
    totalRow.font = { bold: true };
    totalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'D9E2F3' },
    };

    // Formatar colunas monetárias
    for (let i = 4; i <= 4 + dadosDiarios.length + 1; i++) {
      wsDiario.getRow(i).getCell(2).numFormat = 'R$ #,##0.00';
      wsDiario.getRow(i).getCell(3).numFormat = 'R$ #,##0.00';
      wsDiario.getRow(i).getCell(4).numFormat = 'R$ #,##0.00';
    }

    // Ajustar largura das colunas
    wsDiario.getColumn(1).width = 10;
    wsDiario.getColumn(2).width = 18;
    wsDiario.getColumn(3).width = 18;
    wsDiario.getColumn(4).width = 18;
    wsDiario.getColumn(5).width = 15;

    // Centralizar
    wsDiario.getColumn(1).alignment = { horizontal: 'center' };
    wsDiario.getColumn(5).alignment = { horizontal: 'center' };

    // Bordas
    adicionarBordas(wsDiario, 3, 3 + dadosDiarios.length + 1, 5);

    // ─────────────────────────────────────────
    // ABA 3: RANKING DE PRODUTOS
    // ─────────────────────────────────────────
    const wsRanking = workbook.addWorksheet('Ranking de Produtos');

    // Título
    wsRanking.mergeCells('A1:D1');
    const tituloRanking = wsRanking.getCell('A1');
    tituloRanking.value = `Produtos Mais Vendidos - ${mesLabel} de ${ano}`;
    tituloRanking.font = { bold: true, size: 14, color: { argb: '2F5496' } };
    tituloRanking.alignment = { horizontal: 'center' };
    wsRanking.getRow(1).height = 25;

    wsRanking.addRow([]);

    // Cabeçalhos
    const headersRanking = ['Posição', 'Produto', 'Tipo', 'Quantidade Vendida'];
    const headerRowRanking = wsRanking.addRow(headersRanking);
    aplicarEstiloCabecalho(wsRanking, headerRowRanking.number, 4);

    // Dados
    rankingProdutos.forEach((item, index) => {
      wsRanking.addRow([
        `${index + 1}º`,
        item.nome,
        item.tipo,
        item.quantidade_vendida,
      ]);
    });

    // Ajustar largura das colunas
    wsRanking.getColumn(1).width = 10;
    wsRanking.getColumn(2).width = 35;
    wsRanking.getColumn(3).width = 15;
    wsRanking.getColumn(4).width = 20;

    // Centralizar
    wsRanking.getColumn(1).alignment = { horizontal: 'center' };
    wsRanking.getColumn(3).alignment = { horizontal: 'center' };
    wsRanking.getColumn(4).alignment = { horizontal: 'center' };

    // Bordas
    const lastRowRanking = 3 + rankingProdutos.length;
    adicionarBordas(wsRanking, 3, lastRowRanking, 4);

    // ─────────────────────────────────────────
    // ABA 4: ESTOQUE CRÍTICO
    // ─────────────────────────────────────────
    const wsEstoque = workbook.addWorksheet('Estoque Crítico');

    // Título
    wsEstoque.mergeCells('A1:D1');
    const tituloEstoque = wsEstoque.getCell('A1');
    tituloEstoque.value = `Produtos com Estoque Baixo - ${mesLabel} de ${ano}`;
    tituloEstoque.font = { bold: true, size: 14, color: { argb: '2F5496' } };
    tituloEstoque.alignment = { horizontal: 'center' };
    wsEstoque.getRow(1).height = 25;

    wsEstoque.addRow([]);

    // Cabeçalhos
    const headersEstoque = ['Produto', 'Estoque Atual', 'Estoque Mínimo', 'Preço Venda'];
    const headerRowEstoque = wsEstoque.addRow(headersEstoque);
    aplicarEstiloCabecalho(wsEstoque, headerRowEstoque.number, 4);

    // Dados
    produtosEstoqueBaixo.forEach(produto => {
      wsEstoque.addRow([
        produto.nome,
        produto.quantidade,
        produto.quantidade_minima,
        parseFloat(produto.valor_compra || 0),
      ]);
    });

    // Formatar coluna de preço
    for (let i = 4; i <= 4 + produtosEstoqueBaixo.length; i++) {
      wsEstoque.getRow(i).getCell(4).numFormat = 'R$ #,##0.00';
    }

    // Destacar estoque crítico em vermelho
    for (let i = 4; i <= 4 + produtosEstoqueBaixo.length; i++) {
      const cell = wsEstoque.getRow(i).getCell(2);
      cell.font = { color: { argb: 'FF0000' }, bold: true };
    }

    // Ajustar largura das colunas
    wsEstoque.getColumn(1).width = 35;
    wsEstoque.getColumn(2).width = 18;
    wsEstoque.getColumn(3).width = 18;
    wsEstoque.getColumn(4).width = 18;

    // Centralizar
    wsEstoque.getColumn(2).alignment = { horizontal: 'center' };
    wsEstoque.getColumn(3).alignment = { horizontal: 'center' };
    wsEstoque.getColumn(4).alignment = { horizontal: 'center' };

    // Bordas
    if (produtosEstoqueBaixo.length > 0) {
      const lastRowEstoque = 3 + produtosEstoqueBaixo.length;
      adicionarBordas(wsEstoque, 3, lastRowEstoque, 4);
    }

    // ─────────────────────────────────────────
    // GERAR ARQUIVO E ENVIAR
    // ─────────────────────────────────────────
    const filename = `relatorio_${mes}_${ano}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("[exportarExcel]", error);
    if (!res.headersSent) {
      res.status(500).send("Erro ao gerar arquivo Excel");
    }
  }
}


// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────

module.exports = { gerarRelatorio, obterDadosDiarios, exportarPDF, exportarExcel  };