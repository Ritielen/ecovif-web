const db = require("../models");
const passport = require('../config/passport');
const { sendMail, sendSupportContact } = require("../config/mailer");
const {Op} = require("sequelize");

//exibição da comanda
async function mostrarComanda(req, res) {
  const { sucesso } = req.query;
  try {
    // Busca os pratos 
    const pratos = await db.Prato.findAll({
      include: [
        {
          model: db.Ingrediente,
          as: 'ingredientes',
          include: [
            {
              model: db.Produto,
              as: 'produto',
            }
          ]
        }
      ]
    });

    // Busca as bebidas 
    const bebidas = await db.Bebida.findAll({
      include: [
        {
          model: db.Produto,
          as: 'produto',
        }
      ]
    });

    // Produtos gerais 
    const produtos = await db.Produto.findAll({
      order: [['nome', 'ASC']]
    });

    // Renderiza a página da comanda passando os dados
    res.render("admin/comanda", {
      produtos,
      pratos,
      bebidas,
      msgSucesso: sucesso
    });

  } catch (error) {
    console.error("Erro ao carregar a página de comanda:", error);
    res.redirect("/admin/area-gestor?erro=Erro ao carregar dados da comanda");
  }
}
// Criar comanda
async function criarComanda(req, res) {
     try {
    const {
      nome_cliente,
      mesa,
      observacoes,
      total,
    } = req.body;

    const itens = JSON.parse(req.body.itens);

    if (!itens || itens.length === 0) {
      return res.redirect("/comandas?erro=Adicione itens");
    }

    // cria comanda
    const novaComanda = await db.Comanda.create({
      nome_cliente,
      mesa,
      observacoes,
      total,
      usuario_id: req.session.usuarioId,
      status: "pendente",
    });

    // salva itens
    for (const item of itens) {
      const dadosItem = {
        comanda_id: novaComanda.id,
        quantidade: item.quantidade,
        tipo_item: item.tipo_item,
      };

      // prato
      if (item.tipo_item === "prato") {
        dadosItem.prato_id = item.item_id;
      }

      // bebida
      if (item.tipo_item === "bebida") {
        dadosItem.bebida_id = item.item_id;
      }

      await db.ItemComanda.create(dadosItem);
    }

    return res.redirect("/comanda?sucesso=Comanda criada");
  } catch (error) {
    console.log(error);

    return res.redirect("/comanda?erro=Erro ao criar comanda");
  }
}
     


module.exports = {
    mostrarComanda,
    criarComanda
  
};
