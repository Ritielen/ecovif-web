'use strict';

module.exports = {
   up: async (queryInterface, Sequelize) => {
   await queryInterface.createTable('vendas', {
     id: { 
            type: Sequelize.INTEGER, 
            autoIncrement: true, 
            primaryKey: true 
        },       
            taxa_servico: {
              type: Sequelize.DECIMAL(10, 2),
              allowNull: true, 
              defaultValue: 0.00
            },
            valor_couvert: {
              type: Sequelize.DECIMAL(10, 2),
              allowNull: true, 
              defaultValue: 0.00
            },
            total_final: {
              type: Sequelize.DECIMAL(10, 2),
              allowNull: false, 
              defaultValue: 0.00
            },
            status_venda: {
              type: Sequelize.ENUM("fechada"),
              allowNull: false,
              defaultValue: "fechada"
            },
            data_venda: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.NOW, 
            },
            comanda_id: {
              type: Sequelize.INTEGER,
              allowNull: false, 
            },
            evento_id: {
              type: Sequelize.INTEGER,
              allowNull: true, 
            },
            usuario_id: {
              type: Sequelize.INTEGER,
            allowNull: false,
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
   await queryInterface.dropTable('vendas');
  }
};
