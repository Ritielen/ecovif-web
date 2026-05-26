const db = require("../models");
const passport = require('../config/passport');
const { sendMail, sendSupportContact } = require("../config/mailer");
const {Op} = require("sequelize");
const { converterParaBase } = require("../services/estoqueService");

 async function renderizarEstoque(req, res) {
    try {
        // Buscando os produtos e inclusão da contagem de movimentações para cada um        

        const produtos = await db.Produto.findAll({ 
            include: [{
                model: db.MovimentacaoProduto,
                as: 'movimentacoes' 
            }],
            order: [['id', 'DESC']] 
        });
        res.render("admin/estoque", { 
          produtos, 
          msg: req.query.msg,
         error: req.query.error 
        });
    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        res.render("admin/estoque", { 
          produtos: []          
    });      
    }
}

async function cadastrarProduto(req, res) {
  const {
    tipo_item,
    nome,
    codigo,
    categoria,
    unidade,
    quantidade,
    quantidade_minima,
    data_validade,
    observacoes,
    valor_compra,
    tamanho, 
    tipo_vinho
  } = req.body;

  // Validações 
  if (!tipo_item || !nome || !unidade) {
    return res.redirect("/estoque?erro=Tipo, nome e unidade são obrigatórios");
  }

  
  
 /*/ Função de normalização de valores numéricos, tratando vírgula e ponto
const normalizeInt = (val) => {
  if (!val) return 0;
  return parseInt(val.toString().replace(",", "."), 10);
};

const normalizeFloat = (val) => {
  if (!val) return 0;
  return parseFloat(val.toString().replace(",", "."));
}; 

// Conversões
const qtd = quantidade ? normalizeInt(quantidade) : 0;          // produto sempre inteiro
const qtdMin = quantidade_minima ? normalizeInt(quantidade_minima) : 0; // mínimo sempre inteiro
*/

const qtdOriginal = quantidade ? normalizeFloat(quantidade) : 0;

const qtdMinOriginal = quantidade_minima
  ? normalizeFloat(quantidade_minima)
  : 0;
  const qtd = converterParaBase(qtdOriginal, unidade);

const qtdMin = converterParaBase(qtdMinOriginal, unidade);

const tamanhoFinal = tamanho ? normalizeFloat(tamanho) : 0;  //inteiro


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
      codigo: codigo || null,
      categoria,
      unidade,
      tipo_vinho,
      data_validade: data_validade || null,
      quantidade_inicial: qtd, // SALVA O VALOR INICIAL AQUI (TRAVADO)
      quantidade: qtd,         // SALVA O SALDO ATUAL AQUI (DINÂMICO)
      quantidade_minima: qtdMin,
      observacoes: observacoes || null,
      valor_compra: valorCompraLimpo, 
      tamanho: tamanhoFinal,
      usuario_id: usuarioRegistrado.id,
    });
    return res.redirect("/estoque?msg=Produto cadastrado com sucesso!");
  } catch (error) {
    console.error("Erro ao cadastrar produto:", error.message);
    return res.redirect("/estoque?erro=Erro interno ao cadastrar");
  }
}

// Buscar produto por nome ou categoria
function buscarProdutos(lista, termo) {
  const termoNormalizado = termo.toLowerCase();
  return lista.filter(produto =>
    produto.nome.toLowerCase().includes(termoNormalizado) ||
    produto.categoria.toLowerCase().includes(termoNormalizado)
  );
}

async function excluirProduto(req, res) {
  const { id } = req.params;

  try {

    // verifica ingredientes do prato
    const ingrediente = await db.Ingrediente.findOne({
  where: { produto_id: id }
});

     // verifica se produto tem movimentações registradas
    const movimentacao = await db.MovimentacaoProduto.findOne({ where: { produto_id: id } });

    // verifica bebida
    const bebida = await db.Bebida.findOne({
      where: { produto_id: id }
    });

    // se estiver em uso
    if (ingrediente || bebida  || movimentacao) {
      return res.redirect(
        "/estoque?error=Erro ao excluir produto. Ele está sendo usado no cardápio ou possui histórico."
      );
    }

    // excluir produto
    await db.Produto.destroy({
      where: { id }
    });

    return res.redirect(
      "/estoque?msg=Produto excluído com sucesso!"
    );

  } catch (error) {

    console.error(error);

    return res.redirect(
      "/estoque?msg=Erro ao excluir produto, ele pode estar em uso no cardápio ou possui histórico."
    );
  }
}

// Função de inativar Produto
async function inativarProduto(req, res) {
    try{
        const { id } = req.params;
        await db.Produto.update(
            { status : "inativo" },
            { where: { id } }
        );
        return res.redirect("/estoque?msg=Produto inativado com sucesso!");
    } catch(error){
        console.error(error);
        return res.status(500).send("Erro ao inativar produto");
    }
}

// Função de ativar Produto
async function ativarProduto(req, res) {
    try{
        const { id } = req.params;
        await db.Produto.update(
            { status: "ativo" },
            { where : { id }}
        );
        return res.redirect("/estoque?msg=Produto ativado com sucesso!");
    } catch(error){
        console.error(error);
        return res.status(500).send("Erro ao ativar produto.");
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
    codigo,
    observacoes,
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

    const codigoFinal = codigo !== "" ? parseInt(codigo) : produto.codigo;
const observacoesFinal = observacoes !== "" ? observacoes.toString() : produto.observacoes;

    // SALVAR HISTÓRICO (registro do "novo item água" com data diferente)
    await db.MovimentacaoProduto.create({
      produto_id: produto.id,
      tipo: 'entrada',
      origem: 'estoque',
      nova_data_validade: dataValidadeMovimentacao, 
      nova_quantidade: qtdAdicionada,
      novo_valor_compra: valorAdicionado,
      quantidade_total: estoqueAtualizado, // Saldo no momento da ação
      valor_total_gasto: valorTotalAtualizado,
      usuario_id: usuarioId,
       item_comanda_id: null
    });
    //  ATUALIZAR O PRODUTO 
    await produto.update({
      nome: nome || produto.nome,
      codigo: codigoFinal,
      observacoes: observacoesFinal,
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
    inativarProduto,
    ativarProduto,
    editarProduto

};


