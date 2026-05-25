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

async function imprimirVenda(req, res) {
  try {
    if (!req.session?.usuarioId) {
      return res.redirect("/login?msg=Faça login para continuar");
    }

    const { id } = req.params;
    
    const venda = await db.Venda.findOne({
      where: { comanda_id: id },
      include: [
        {
          model: db.Comanda,
          as: "comanda",
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
        },
        {
          model: db.Evento,
          as: "evento",
        },
        {
          model: db.Usuario,
          as: "usuario",
          attributes: ["id", "nome", "email"],
        },
      ],
    });

    if (!venda) {
      return res.redirect("/fecharConta?erro=Venda não encontrada");
    }

    // Formatar dados para impressão
    const dadosImpressao = {
      id_venda: venda.id,
      data_venda: venda.createdAt,
      status: venda.status || "Finalizada",
      comanda: {
        id: venda.comanda.id,
        mesa: venda.comanda.mesa,
        nome_cliente: venda.comanda.nome_cliente,
      },
      itens: [],
      subtotal: 0,
      taxa_servico: parseFloat(venda.taxa_servico || 0),
      valor_couvert: parseFloat(venda.valor_couvert || 0),
      total_final: parseFloat(venda.total_final || 0),
      evento: venda.evento ? {
        nome: venda.evento.nome,
        descricao: venda.evento.descricao,
      } : null,
      atendente: venda.usuario ? venda.usuario.nome : "N/A",
    };

    // Processar itens da comanda
    if (venda.comanda && venda.comanda.itens) {
      venda.comanda.itens.forEach(item => {
        let nomeItem = "";
        let precoVenda = 0;
        let tipo = "";

        if (item.prato) {
          nomeItem = item.prato.nome;
          precoVenda = parseFloat(item.prato.preco_venda || 0);
          tipo = "Prato";
        } else if (item.bebida) {
          nomeItem = item.bebida.produto 
            ? `${item.bebida.produto.nome} (${item.bebida.volume || ''}ml)` 
            : item.bebida.nome || "Bebida";
          precoVenda = parseFloat(item.bebida.preco_venda || 0);
          tipo = "Bebida";
        }

        const quantidade = item.quantidade || 1;
        const subtotalItem = precoVenda * quantidade;

        dadosImpressao.itens.push({
          nome: nomeItem,
          tipo: tipo,
          quantidade: quantidade,
          precoVenda: precoVenda,
          subtotal: subtotalItem,
        });

        dadosImpressao.subtotal += subtotalItem;
      });
    }

    // Formatar valores monetários
    dadosImpressao.subtotal = parseFloat(dadosImpressao.subtotal.toFixed(2));

    // Renderizar página de impressão
    res.render("admin/imprimirVenda", {
      venda: dadosImpressao,
      layout: false, // Desabilita o layout principal para impressão limpa
    });

  } catch (error) {
    console.error("Erro ao imprimir venda:", error);
    res.redirect("/fecharConta?erro=Erro ao carregar dados para impressão");
  }
}

module.exports = {
  mostrarConta,
  removerTaxaServico,
  removerTaxaCouvert,
  finalizarVenda,
  imprimirVenda
};
