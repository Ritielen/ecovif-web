'use strict';

module.exports = {
   up: async (queryInterface, Sequelize) => {
   await queryInterface.createTable('movimentacoes_produto', {
     id: { 
            type: Sequelize.INTEGER, 
            autoIncrement: true, 
            primaryKey: true 
        },
          tipo: {
                type: Sequelize.ENUM('entrada', 'saida'),
                allowNull: false,
              },
              nova_data_validade: {
                type: Sequelize.DATEONLY,
                allowNull: true,
              },
              nova_quantidade: {
                type: Sequelize.INTEGER,
                allowNull: true,
              },
              novo_valor_compra: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true, 
                defaultValue: 0.0,
              },
              quantidade_total: {
                type: Sequelize.INTEGER,
                allowNull: true,
              },
              valor_total_gasto: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true, 
                defaultValue: 0.0,
              },
              produto_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
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
   await queryInterface.dropTable('movimentacoes_produto');
  }
};
