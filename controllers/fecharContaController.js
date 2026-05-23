const db = require("../models");

const { Op } = require("sequelize");

async function mostrarConta(req, res) {
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
                },
              ],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    const eventoAtivo = await db.Evento.findOne({
      where: {
        status_couvert: "ativo",
        status_evento: { [Op.ne]: "cancelado" },
      },
      order: [["created_at", "DESC"]],
    });

    const valorCouvert = eventoAtivo && eventoAtivo.valor_couvert != null
      ? parseFloat(eventoAtivo.valor_couvert)
      : 0;

    const removidosComanda = req.session?.remocoes || {};

    // buscar vendas relacionadas às comandas para sinalizar se já foram fechadas
    const comandaIds = comandas.map(c => c.id);
    const vendas = await db.Venda.findAll({ where: { comanda_id: comandaIds } });
    const vendaMap = {};
    vendas.forEach(v => { vendaMap[v.comanda_id] = v; });

    res.render("admin/fecharConta", {
      comandas,
      eventoAtivo,
      valorCouvert,
      removidosComanda,
      vendaMap,
      msg: req.query.msg,
      erro: req.query.erro,
    });
  } catch (error) {
    console.error(error);
    res.redirect("/admin/area-gestor?erro=Erro ao carregar comanda");
  }
}

async function removerTaxaServico(req, res) {
  try {
    if (!req.session?.usuarioId) {
      return res.redirect("/login?msg=Faça login para continuar");
    }

    const { id } = req.params;
    const comanda = await db.Comanda.findByPk(id);
    if (!comanda) {
      return res.redirect("/fecharConta?erro=Comanda não encontrada");
    }

    // não permite remover taxa se venda já finalizada
    const vendaExistente = await db.Venda.findOne({ where: { comanda_id: id } });
    if (vendaExistente) {
      return res.redirect("/fecharConta?erro=Venda já finalizada para esta comanda");
    }

    req.session.remocoes = req.session.remocoes || {};
    req.session.remocoes[id] = {
      ...(req.session.remocoes[id] || {}),
      taxaServicoRemovida: true,
    };

    req.session.save((err) => {
      if (err) console.error(err);
      res.redirect("/fecharConta?msg=Taxa de serviço removida");
    });
  } catch (error) {
    console.error(error);
    res.redirect("/fecharConta?erro=Erro ao remover taxa de serviço");
  }
}

async function removerTaxaCouvert(req, res) {
  try {
    if (!req.session?.usuarioId) {
      return res.redirect("/login?msg=Faça login para continuar");
    }

    const { id } = req.params;
    const comanda = await db.Comanda.findByPk(id);
    if (!comanda) {
      return res.redirect("/fecharConta?erro=Comanda não encontrada");
    }

    const vendaExistente = await db.Venda.findOne({ where: { comanda_id: id } });
    if (vendaExistente) {
      return res.redirect("/fecharConta?erro=Venda já finalizada para esta comanda");
    }

    req.session.remocoes = req.session.remocoes || {};
    req.session.remocoes[id] = {
      ...(req.session.remocoes[id] || {}),
      couvertRemovido: true,
    };

    req.session.save((err) => {
      if (err) console.error(err);
      res.redirect("/fecharConta?msg=Couvert removido");
    });
  } catch (error) {
    console.error(error);
    res.redirect("/fecharConta?erro=Erro ao remover couvert");
  }
}

async function finalizarVenda(req, res) {
  try {
    if (!req.session?.usuarioId) {
      return res.redirect("/login?msg=Faça login para continuar");
    }

    const { id } = req.params;
    const comanda = await db.Comanda.findByPk(id);
    if (!comanda) {
      return res.redirect("/fecharConta?erro=Comanda não encontrada");
    }

    // impede dupla finalização
    const vendaExistente = await db.Venda.findOne({ where: { comanda_id: id } });
    if (vendaExistente) {
      return res.redirect("/fecharConta?erro=Venda já finalizada para esta comanda");
    }

    const subtotal = parseFloat(comanda.total || 0);
    const removidos = req.session.remocoes?.[id] || {};
    const taxaServico = removidos.taxaServicoRemovida ? 0 : parseFloat((subtotal * 0.1).toFixed(2));

    const eventoAtivo = await db.Evento.findOne({
      where: {
        status_couvert: "ativo",
        status_evento: { [Op.ne]: "cancelado" },
      },
      order: [["created_at", "DESC"]],
    });

    const valorCouvert = eventoAtivo && !removidos.couvertRemovido && eventoAtivo.valor_couvert != null
      ? parseFloat(eventoAtivo.valor_couvert)
      : 0;

    const totalFinal = parseFloat((subtotal + taxaServico + valorCouvert).toFixed(2));

    await db.Venda.create({
      taxa_servico: taxaServico,
      valor_couvert: valorCouvert,
      total_final: totalFinal,  
      comanda_id: id,
      evento_id: eventoAtivo ? eventoAtivo.id : null,
      usuario_id: req.session.usuarioId,
    });

    if (req.session.remocoes) {
      delete req.session.remocoes[id];
    }

    req.session.save((err) => {
      if (err) console.error(err);
      res.redirect("/fecharConta?msg=Venda finalizada com sucesso");
    });
  } catch (error) {
    console.error(error);
    res.redirect("/fecharConta?erro=Erro ao finalizar venda");
  }
}

module.exports = {
  mostrarConta,
  removerTaxaServico,
  removerTaxaCouvert,
  finalizarVenda,
};
