const { Op } = require("sequelize");
const db = require("../models");

async function carregarNotificacoesComandas(req, res, next) {

  try {

    // Buscar comandas recentes
    const comandasRecentes = await db.Comanda.findAll({

      where: {

        data: {
          [Op.gte]: new Date(
            new Date() - 24 * 60 * 60 * 1000
          )
        },

        status: {
          [Op.in]: [
            "pendente",
            "em preparo",
            "pronta"
          ]
        }
      },

      include: [
        {
          model: db.ItemComanda,
          as: "itens",
          required: false,

          include: [
            {
              model: db.Prato,
              as: "prato",
              required: false
            }
          ]
        }
      ],

      order: [["data", "DESC"]],
      limit: 10
    });

    /*
    =========================================
    COZINHA
    Apenas comandas pendentes com pratos
    =========================================
    */

    const comandasCozinha = comandasRecentes.filter(comanda => {

      // precisa estar pendente
      if (comanda.status !== "pendente") {
        return false;
      }

      // precisa possuir pelo menos 1 prato
      return comanda.itens.some(item => item.prato);
    });

    /*
    =========================================
    GARÇOM
    Mostrar:
    - em preparo
    - pronta
    =========================================
    */

    const comandasGarcom = comandasRecentes.filter(comanda =>
      ["em preparo", "pronta"].includes(comanda.status)
    );

    /*
    =========================================
    PRONTAS
    =========================================
    */

    const comandasProntas = comandasRecentes.filter(
      comanda => comanda.status === "pronta"
    );

    /*
    =========================================
    LOCALS
    =========================================
    */

    // geral
    res.locals.comandasRecentes = comandasRecentes;
    res.locals.totalComandasRecentes =
      comandasRecentes.length;

    // cozinha
    res.locals.comandasCozinha = comandasCozinha;
    res.locals.totalComandasCozinha =
      comandasCozinha.length;

    // garçom
    res.locals.comandasGarcom = comandasGarcom;
    res.locals.totalComandasGarcom =
      comandasGarcom.length;

    // prontas
    res.locals.comandasProntas = comandasProntas;
    res.locals.totalComandasProntas =
      comandasProntas.length;

    next();

  } catch (error) {

    console.error(
      "Erro ao carregar notificações:",
      error
    );

    // geral
    res.locals.comandasRecentes = [];
    res.locals.totalComandasRecentes = 0;

    // cozinha
    res.locals.comandasCozinha = [];
    res.locals.totalComandasCozinha = 0;

    // garçom
    res.locals.comandasGarcom = [];
    res.locals.totalComandasGarcom = 0;

    // prontas
    res.locals.comandasProntas = [];
    res.locals.totalComandasProntas = 0;

    next();
  }
}

module.exports = carregarNotificacoesComandas;