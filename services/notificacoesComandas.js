const { Op, Sequelize } = require("sequelize");
const db = require("../models");

async function carregarNotificacoesComandas(req, res, next) {
    try {
        // Buscar comandas criadas recentemente (últimas 24 horas)
        const comandasRecentes = await db.Comanda.findAll({
            where: {
                data: {  
                    [Op.gte]: new Date(new Date() - 24 * 60 * 60 * 1000) // últimas 24 horas
                },
                status: {
            [Op.in]: ['pronta', 'pendente']  // Busca ambos os status
        }
            },
            order: [['data', 'DESC']], 
            limit: 10 // Limitar a 10 comandas mais recentes
        });

        console.log("Comandas encontradas:", comandasRecentes.length); // Debug
        
        res.locals.comandasRecentes = comandasRecentes;
        res.locals.totalComandasRecentes = comandasRecentes.length;
        res.locals.novaComanda = comandasRecentes.length > 0;

        next();
    } catch (error) {
        console.error("Erro ao carregar notificações de comandas:", error);
        
        res.locals.comandasRecentes = [];
        res.locals.totalComandasRecentes = 0;
        res.locals.novaComanda = false;
        
        next();
    }
}

module.exports = carregarNotificacoesComandas;