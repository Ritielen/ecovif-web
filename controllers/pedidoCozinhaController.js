const db = require("../models");
const passport = require('../config/passport');
const { sendMail, sendSupportContact } = require("../config/mailer");
const {Op} = require("sequelize");


// Listar comandas
async function listarComandas(req, res) {
  try {
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

    res.render("admin/pedidoCozinha", {
      comandas,
       msg: req.query.msg,
         error: req.query.error
    });

  } catch (error) {
    console.log(error);
    res.redirect("/comanda?msg=Erro ao listar comandas");
  }
}

// buscar comanda por nome 
function buscarComandas(lista, termo) {
  return lista.filter(comanda =>
    comanda.nome_cliente.toLowerCase().includes(termo.toLowerCase())
  );
} 

// Rota para atualizar status da comanda
async function atualizarStatus(req, res) {
  try {
    const comandaId = req.params.id;
    const { status } = req.body;

    // Validar status permitidos
    const statusPermitidos = ['pendente', 'em preparo', 'pronta', 'cancelada'];
    if (!statusPermitidos.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status inválido. Valores permitidos: ' + statusPermitidos.join(', ') 
      });
    }

    // Buscar comanda
    const comanda = await db.Comanda.findByPk(comandaId);
    
    if (!comanda) {
      return res.status(404).json({ 
        success: false, 
        message: 'Comanda não encontrada' 
      });
    }

    // Verificar se a comanda está cancelada
    if (comanda.status === 'cancelada') {
      return res.status(400).json({ 
        success: false, 
        message: 'Não é possível alterar status de uma comanda cancelada' 
      });
    }

    // Verificar transições de status válidas
    if (status === 'em preparo' && comanda.status !== 'pendente') {
      return res.status(400).json({ 
        success: false, 
        message: 'Só é possível mover para "Em Preparo" comandas que estão "Pendente"' 
      });
    }

    if (status === 'pronta' && comanda.status !== 'em preparo') {
      return res.status(400).json({ 
        success: false, 
        message: 'Só é possível mover para "Pronta" comandas que estão "Em Preparo"' 
      });
    }

    // Atualizar status
    comanda.status = status;
    await comanda.save();

    return res.json({ 
      success: true, 
      message: `Status atualizado para "${status}" com sucesso` 
    });

  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
}

module.exports = {
  listarComandas,
  atualizarStatus
};