'use strict';

module.exports = {
   up: async (queryInterface, Sequelize) => {
   await queryInterface.createTable('relatorios_mensais', {
     id: { 
            type: Sequelize.INTEGER, 
            autoIncrement: true, 
            primaryKey: true 
        },
        mes: {
              type: Sequelize.INTEGER, 
              allowNull: false,
               validate: {
                min: 1,
                max: 12
              }
            },
            ano: {
              type: Sequelize.INTEGER,
              allowNull: false,
            },
            faturamento_total: {
              type: Sequelize.DECIMAL(10, 2),
              allowNull: false,
                 defaultValue: 0.00
            },
            despesas: {
              type: Sequelize.DECIMAL(10, 2),
              allowNull: false,
              defaultValue: 0.00
            },
            lucro: {
              type: Sequelize.DECIMAL(10, 2),
              allowNull: false,
            },
           quantidade_total_produtos: {
              type: Sequelize.INTEGER,
              allowNull: false,
            },
            quantidade_minima_produtos: {
              type: Sequelize.INTEGER,
              allowNull: false,
            },
            posicao: {
            type: Sequelize.INTEGER,
            allowNull: false
            },
            produtos_mais_vendidos: {
              type: Sequelize.STRING,
              allowNull: false
            },
            quantidade_vendida: {
              type: Sequelize.INTEGER,
              allowNull: false
            },
            faturamento_vendas: {
              type: Sequelize.DECIMAL(10, 2),
              defaultValue: 0.00
            },
            mes_anterior: {
              type: Sequelize.INTEGER,
              validate: {
                min: 1,
                max: 12
              }
            },
            faturamento_mes_anterior: {
              type: Sequelize.DECIMAL(10, 2),
              allowNull: true,
              defaultValue: 0.00
            },
            despesas_mes_anterior: {
              type: Sequelize.DECIMAL(10, 2),
              allowNull: true,
              defaultValue: 0.00
            },
            lucro_mes_anterior: {
              type: Sequelize.DECIMAL(10, 2),
              allowNull: true,
              defaultValue: 0.00
            },
            percentual_lucro_mes_anterior: {
              type: Sequelize.DECIMAL(5, 2),
              allowNull: true
            },
            usuario_id: {
              type: Sequelize.INTEGER,
              allowNull: false
            },
            created_at: {
              type: Sequelize.DATE,
              allowNull: false
            },
            updated_at: {
              type: Sequelize.DATE,
        allowNull: false
      }
     });
  },

  async down (queryInterface, Sequelize) {
   await queryInterface.dropTable('relatorios_mensais');
  }
};
