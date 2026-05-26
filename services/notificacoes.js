const { Op, Sequelize } = require("sequelize");
const db = require("../models");

async function carregarNotificacoes(req, res, next) {

    try {

        const produtosBaixo = await db.Produto.findAll({
            where: {
                quantidade: {
                    [Op.lte]: Sequelize.col("quantidade_minima")
                }
            }
        });

        res.locals.produtosBaixo = produtosBaixo;
        res.locals.totalAlertas = produtosBaixo.length;

        next();

    } catch (error) {

        console.error(error);

        res.locals.produtosBaixo = [];
        res.locals.totalAlertas = 0;

        next();
    }
}

module.exports = carregarNotificacoes;