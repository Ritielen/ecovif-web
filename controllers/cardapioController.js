const db = require("../models");
const passport = require('../config/passport');
const { sendMail, sendSupportContact } = require("../config/mailer");
const {Op} = require("sequelize");

//exibição da tela
async function mostrarCardapio(req, res) {
  const { sucesso } = req.query;
  try {
    //const pratos = await db.Prato.findAll();
    //const bebidas = await db.Bebida.findAll();
    const pratos = await db.Prato.findAll({
  include: [
    {
      model: db.Ingrediente,
      as: 'ingredientes',
      include: [
        {
          model: db.Produto,
          as: 'produto'
        }
      ]
    }
  ]
});
const bebidas = await db.Bebida.findAll({
  include: [
    {
      model: db.Produto,
      as: 'produto'
    }
  ]
});

    const produtos = await db.Produto.findAll({
      attributes: ['id', 'nome', 'unidade', 'tamanho'],
      order: [['nome', 'ASC']]
    });

    // Renderiza a página do cardápio passando todos os dados em um único objeto
    res.render("admin/cardapio", {
      produtos,
      pratos,
      bebidas,
      
      msgSucesso: sucesso
    }); 
    
  } catch (error) {
    console.error("Erro ao carregar a página de cardápio:", error);
    res.redirect("/admin/area-gestor?erro=Erro ao carregar dados do cardápio");
  }
}


async function cadastrarItemCardapio(req, res) {
  try {
    if (!req.session || !req.session.usuarioId) {
      return res.redirect("/login?erro=Faça login para continuar");
    }

    const usuarioId = req.session.usuarioId;
    const { categoria, produto_id, preco_venda, nome, rendimento, custo_prato, quantidade_ingrediente, unidade_ingrediente } = req.body;

    // Aqui você pode assumir que cada usuário tem um cardápio único
    // Se quiser simplificar, pode usar cardapio_id = 1 ou buscar pelo usuario_id
    const cardapio = await db.Cardapio.findOne({ where: { usuario_id: usuarioId } });
    if (!cardapio) {
      // Se não existir, cria automaticamente
      const novoCardapio = await db.Cardapio.create({ usuario_id: usuarioId });
      cardapio_id = novoCardapio.id;
    } else {
      cardapio_id = cardapio.id;
    }

    if (categoria === 'prato') {
      const prato = await db.Prato.create({
        nome,
        rendimento,
        custo_prato,
        preco_venda,
        cardapio_id,
        usuario_id: usuarioId
      });
      
   // Se ingredientes vierem como array no req.body
  const {
  produto_id,
  quantidade_ingrediente,
  unidade_ingrediente
} = req.body;

  for (let i = 0; i < produto_id.length; i++) {

  await db.Ingrediente.create({
    produto_id: produto_id[i],

    quantidade_ingrediente: quantidade_ingrediente[i]
      ? parseFloat(
          quantidade_ingrediente[i].toString().replace(',', '.')
        )
      : 0,

    unidade_ingrediente: unidade_ingrediente[i],

    prato_id: prato.id,
    usuario_id: usuarioId
  });

}

    
    } else if (categoria === 'bebida') {
      const bebida = await db.Bebida.create({
        nome,
        produto_id,
        preco_venda,
        cardapio_id,
        usuario_id: usuarioId
      });
    }

    res.redirect("/cardapio?sucesso=Item cadastrado com sucesso!");
  } catch (error) {
    console.error("Erro ao salvar item no cardápio:", error);
    res.status(500).send("Erro ao salvar.");
  }
}

//buscar item do cardápio por nome
// Buscar produto por nome ou categoria
function buscarProdutos(lista, termo) {
  const termoNormalizado = termo.toLowerCase();
  return lista.filter(produto =>
    produto.nome.toLowerCase().includes(termoNormalizado) ||
    produto.categoria.toLowerCase().includes(termoNormalizado)
  );
}





module.exports = {
    mostrarCardapio,
    cadastrarItemCardapio
};