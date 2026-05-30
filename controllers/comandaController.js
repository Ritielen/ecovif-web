const db = require("../models");
const { baixarEstoqueComanda } = require("../services/movimentacaoService");
const passport = require('../config/passport');
const { sendMail, sendSupportContact } = require("../config/mailer");
const {Op} = require("sequelize");
const { devolverEstoqueComanda } = require("../services/movimentacaoService");


//exibição da comanda
async function mostrarComanda(req, res) {
  

  try {

    // pratos
    const pratos = await db.Prato.findAll({
      where: { status: 'ativo' }, 
      include: [
        {
          model: db.Ingrediente,
          as: "ingredientes",
          include: [
            {
              model: db.Produto,
              as: "produto",
            }
          ]
        }
      ]
    });

    // bebidas
    const bebidas = await db.Bebida.findAll({
      where: { status: 'ativo' }, 
      include: [
        {
          model: db.Produto,
          as: "produto",
        }
      ]
    });

    // produtos
    const produtos = await db.Produto.findAll({
      order: [["nome", "ASC"]]
    });

    // comandas
    const comandas = await db.Comanda.findAll({
      include: [
        {
          model: db.ItemComanda,
          as: "itens",
          include: [
            {
              model: db.Prato,
              as: "prato",
            },
            {
              model: db.Bebida,
              as: "bebida",
              include: [
                {
                  model: db.Produto,
                  as: "produto",
                }
              ]
            }
          ]
        }
      ],
      order: [["created_at", "DESC"]]
    });

    // render
    res.render("admin/comanda", {
      produtos,
      pratos,
      bebidas,
      comandas,
      msg: req.query.msg,
         error: req.query.error 
    });

  } catch (error) {
    console.error(error);

    res.redirect("/admin/area-gestor?erro=Erro ao carregar comanda");
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

    const itensSalvos = [];

for (const item of itens) {

  const dadosItem = {
    comanda_id: novaComanda.id,
    quantidade: item.quantidade,
    tipo_item: item.tipo_item,
  };

  if (item.tipo_item === "prato") {
    dadosItem.prato_id = item.item_id;
    
  }

  if (item.tipo_item === "bebida") {
    dadosItem.bebida_id = item.item_id;
  
  
  }

  const novoItem = await db.ItemComanda.create(dadosItem);

  itensSalvos.push(novoItem.get({ plain: true }));
}
    await baixarEstoqueComanda(
  itensSalvos,
  req.session.usuarioId,
  novaComanda.id
);

    return res.redirect("/comanda?msg=Comanda criada");
  } catch (error) {
    console.log(error);

    return res.redirect("/comanda?erro=Erro ao criar comanda");
  }
}
     

    
// buscar comanda por nome 
function buscarComandas(lista, termo) {
  return lista.filter(comanda =>
    comanda.nome_cliente.toLowerCase().includes(termo.toLowerCase())
  );
} 

// tela edição comanda
async function telaEdicaoComanda(req, res) {
  try {
    const { id } = req.params;

    // busca a comanda específica
    const comanda = await db.Comanda.findByPk(id, {
      include: [
        {
          model: db.ItemComanda,
          as: "itens",
          include: [
            { model: db.Prato, as: "prato" },
            { 
              model: db.Bebida, 
              as: "bebida",
              include: [{ model: db.Produto, as: "produto" }]
            }
          ]
        }
      ]
    }); 

    // busca pratos e bebidas para o select
    const pratos = await db.Prato.findAll();
    const bebidas = await db.Bebida.findAll({ include: [{ model: db.Produto, as: "produto" }] });

    if (!comanda) {
      return res.redirect("/comanda?erro=Comanda não encontrada");
    }

    res.render("admin/editarComanda", {
      comanda,
      pratos,
      bebidas,
      itens: comanda.itens,
      msg: req.query.msg,
         error: req.query.error 
    });
  } catch (error) {
    console.error(error);
    res.redirect("/comanda?erro=Erro ao carregar edição");
  }
}


// Recalcula o total somando todos os itens atuais da comanda
async function recalcularTotalComanda(comandaId) {
  const itens = await db.ItemComanda.findAll({
    where: { comanda_id: comandaId },
    include: [
      { model: db.Prato,  as: "prato",  attributes: ["preco_venda"] },
      { 
        model: db.Bebida, as: "bebida", attributes: ["preco_venda"],
        include: [{ model: db.Produto, as: "produto", attributes: ["id"] }]
      },
    ],
  });

  const total = itens.reduce((acc, item) => {
    const preco = parseFloat(
      item.tipo_item === "prato"
        ? item.prato?.preco_venda
        : item.bebida?.preco_venda || 0
    );
    return acc + preco * item.quantidade;
  }, 0);

  await db.Comanda.update(
    { total: total.toFixed(2) },
    { where: { id: comandaId } }
  );

  return total;
}

// Remove um item da comanda e recalcula o total
async function deletarItemComanda(req, res) {

  try {

    const { id } = req.params;

    const item = await db.ItemComanda.findByPk(id);

    if (!item) {

      return res.json({
        success: false,
        message: "Item não encontrado"
      });
    }

    const comandaId = item.comanda_id;

    /*
    =====================================
    DEVOLVER ESTOQUE
    =====================================
    */

    await devolverEstoqueComanda(
      [item], // array
      req.session.usuarioId,
      comandaId
    );

    /*
    =====================================
    REMOVER ITEM
    =====================================
    */

    await item.destroy();

    /*
    =====================================
    RECALCULAR TOTAL
    =====================================
    */

    const novoTotal =
      await recalcularTotalComanda(comandaId);

    return res.json({

      success: true,

      message: "Item removido com sucesso",

      novoTotal: novoTotal.toFixed(2),
    });

  } catch (error) {

    console.error(
      "Erro ao remover item:",
      error
    );

    return res.json({
      success: false,
      message: "Erro ao remover item"
    });
  }
}

// Adiciona novos itens e recalcula o total
async function atualizarComanda(req, res) {
  const { id } = req.params;
  const { nome_cliente, mesa, observacoes } = req.body;

  try {
    const comanda = await db.Comanda.findByPk(id);
    if (!comanda) {
      return res.redirect("/comanda?erro=Comanda não encontrada");
    }

    // Atualiza dados básicos
    await comanda.update({
      nome_cliente: nome_cliente || comanda.nome_cliente,
      mesa:         mesa         || comanda.mesa,
      observacoes:  observacoes  ?? comanda.observacoes,
    });

    // Adiciona novos itens se vieram no body
    let itens = [];
    if (req.body.itens) {
      itens = JSON.parse(req.body.itens);
    }

    if (itens.length > 0) {
      const novosItens = itens
        .filter((item) => item.item_id) // ignora linhas vazias
        .map((item) => ({
          comanda_id:  id,
          quantidade:  item.quantidade,
          tipo_item:   item.tipo_item,
          observacoes: observacoes || comanda.observacoes,
          prato_id:    item.tipo_item === "prato"  ? item.item_id : null,
          bebida_id:   item.tipo_item === "bebida" ? item.item_id : null,
        }));

         /*
      =====================================
      SALVA ITENS
      =====================================
      */
      await db.ItemComanda.bulkCreate(novosItens);
    

     /*
      =====================================
      BAIXA ESTOQUE
      =====================================
      */

      await baixarEstoqueComanda(
        novosItens,
        req.session.usuarioId,
        comanda.id
      );
    }

    // Recalcula total com todos os itens (antigos + novos)
    await recalcularTotalComanda(id);

    return res.redirect(`/editarComanda/${id}?msg=Comanda atualizada com sucesso`);
  } catch (error) {
    console.error("Erro ao atualizar comanda:", error);
    return res.redirect(`/editarComanda/${id}?erro=Erro ao atualizar comanda`);
  }
}



module.exports = {
    mostrarComanda,
    criarComanda,
    telaEdicaoComanda,
    atualizarComanda,
    deletarItemComanda
    
    
  
};
