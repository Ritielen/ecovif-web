const bcrypt = require("bcrypt");
const db = require("../models");
const passport = require('../config/passport');
const { sendMail, sendSupportContact } = require("../config/mailer");
const {Op} = require("sequelize");

 async function renderizarEstoque(req, res) {
    try {
        // Buscamos os produtos e inclusão da contagem de movimentações para cada um
        const produtos = await db.Produto.findAll({ 
            include: [{
                model: db.MovimentacaoProduto,
                as: 'movimentacoes' 
            }],
            order: [['id', 'DESC']] 
        });
        res.render("admin/estoque", { produtos });
    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        res.render("admin/estoque", { produtos: [] });
    }
}

async function cadastrarProduto(req, res) {
  const {
    tipo_item,
    nome,
    categoria,
    unidade,
    quantidade,
    quantidade_minima,
    data_validade,
    valor_compra,
    tamanho, 
    tipo_vinho
  } = req.body;

  // Validações 
  if (!tipo_item || !nome || !unidade) {
    return res.redirect("/estoque?erro=Tipo, nome e unidade são obrigatórios");
  }

  // Conversões 
  const qtd = quantidade ? parseFloat(quantidade) : 0;
  const qtdMin = quantidade_minima ? parseInt(quantidade_minima) : 0;
  const tamanhoFinal = tamanho ? parseFloat(tamanho) : null;
  
  // Tratamento do valor_compra: Se não houver valor ou for inválido, salva 0
  const valorCompraLimpo = valor_compra ? parseFloat(valor_compra.toString().replace(',', '.')) : 0;

  try {
    // VERIFICAÇÃO DE SESSÃO
    if (!req.session || !req.session.usuarioId) {
      return res.redirect("/login?erro=Faça login para continuar");
    }
    const usuarioId = req.session.usuarioId;
    const usuarioRegistrado = await db.Usuario.findByPk(usuarioId);
    if (!usuarioRegistrado) {
      return res.redirect("/login?erro=Usuário não encontrado");
    }

    // Criação do produto
    await db.Produto.create({
      tipo_item,
      nome,
      categoria,
      unidade,
      tipo_vinho,
      data_validade: data_validade || null,
      quantidade_inicial: qtd, // SALVA O VALOR INICIAL AQUI (TRAVADO)
      quantidade: qtd,         // SALVA O SALDO ATUAL AQUI (DINÂMICO)
      quantidade_minima: qtdMin,
      valor_compra: valorCompraLimpo, 
      tamanho: tamanhoFinal,
      usuario_id: usuarioRegistrado.id,
    });
    return res.redirect("/estoque?sucesso=Produto cadastrado com sucesso!");
  } catch (error) {
    console.error("Erro ao cadastrar produto:", error.message);
    return res.redirect("/estoque?erro=Erro interno ao cadastrar");
  }
}

//buscar produto por nome
function buscarProdutos(lista, termo) {
  return lista.filter(produto =>
    produto.nome.toLowerCase().includes(termo.toLowerCase())
  );
}

async function excluirProduto(req, res) {
  const { id } = req.params; 
  try {
    await db.Produto.destroy({ where: { id } });
    res.redirect("/estoque?sucesso=Produto excluído com sucesso!");
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    res.redirect("/estoque?erro=Erro ao excluir produto");
  }
}

//adicionar novas quantidades no estoque
async function mostrarEstoque(req, res) {
    const { id } = req.params; // pega o id da rota
    try {
        const produto = await db.Produto.findByPk(id);
        if (!produto) {
            return res.redirect("/estoque?erro=Produto não encontrado");
        }
       // busca movimentações relacionadas ao produto
    const movimentacoes = await db.MovimentacaoProduto.findAll({
      where: { produto_id: id },
    });
    res.render("admin/estoqueAdicionar", { produto, movimentacoes });
  } catch (error) {
    console.error("Erro ao carregar produto:", error);
    res.redirect("/estoque?erro=Erro ao carregar produto");
  }
}

async function editarProduto(req, res) {
  const { id } = req.params;
  const { 
    nome, 
    categoria, 
    quantidade_minima, 
    nova_data_validade, 
    nova_quantidade, 
    novo_valor_compra 
  } = req.body;

  try {
    const produto = await db.Produto.findByPk(id);
    if (!produto) return res.redirect("/estoque?erro=Produto não encontrado");

    const usuarioId = req.session.usuarioId;

    //  Cálculos de Acúmulo
    const qtdAdicionada = Number(nova_quantidade) || 0;
    const valorAdicionado = Number(novo_valor_compra) || 0;

    // Estoque Atual = O que já tinha + o que chegou agora
    const estoqueAtualizado = Number(produto.quantidade) + qtdAdicionada;
    
    // Valor Total = O que já tinha + o custo novo
    const valorTotalAtualizado = parseFloat((Number(produto.valor_compra) + valorAdicionado).toFixed(2));

    //  Tratar a nova data de validade (se não informada, fica null no histórico)
    let dataValidadeMovimentacao = null;
    if (nova_data_validade) {
      const data = new Date(nova_data_validade);
      if (!isNaN(data)) dataValidadeMovimentacao = data;
    }

    // SALVAR HISTÓRICO (registro do "novo item água" com data diferente)
    await db.MovimentacaoProduto.create({
      produto_id: produto.id,
      tipo: 'entrada',
      nova_data_validade: dataValidadeMovimentacao, 
      nova_quantidade: qtdAdicionada,
      novo_valor_compra: valorAdicionado,
      quantidade_total: estoqueAtualizado, // Saldo no momento da ação
      valor_total_gasto: valorTotalAtualizado,
      usuario_id: usuarioId
    });
    //  ATUALIZAR O PRODUTO 
    await produto.update({
      nome: nome || produto.nome,
      categoria: categoria || produto.categoria,
      quantidade_minima: quantidade_minima !== "" ? Number(quantidade_minima) : produto.quantidade_minima,
      
      // Atualização do saldo total para o sistema saber quanto tem no estoque
      quantidade: estoqueAtualizado, 
      valor_compra: valorTotalAtualizado, 
    });
    res.redirect(`/produtoAdicionar/${id}?sucesso=Estoque atualizado`);
  } catch (error) {
    console.error(error);
    res.redirect(`/produtoAdicionar/${id}?error=Erro ao processar`);
  }
}

module.exports = {
   
    renderizarEstoque,
    cadastrarProduto,
    mostrarEstoque,
    excluirProduto,
    editarProduto
};


