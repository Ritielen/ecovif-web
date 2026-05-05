'use strict';

module.exports = {
   up: async (queryInterface, Sequelize) => {
   await queryInterface.createTable('itens_comanda', {
     id: { 
            type: Sequelize.INTEGER, 
            autoIncrement: true, 
            primaryKey: true 
        },
           comanda_id: {
               type: Sequelize.INTEGER,
               allowNull: false,
             },
               quantidade: {
                 type: Sequelize.INTEGER,
                 allowNull: false,
               },
               preco_venda: {
                 type: Sequelize.DECIMAL(10, 2),
                 allowNull: false,
                  defaultValue: 0.0,
               },
               subtotal: {
                 type: Sequelize.DECIMAL(10, 2),
                 allowNull: false,
                  defaultValue: 0.0,
               },
               prato_id: {
                 type: Sequelize.INTEGER, 
                 allowNull: true,     
               },
                bebida_id: {
                 type: Sequelize.INTEGER,
                 allowNull: true,
               },
               produto_id: {
                 type: Sequelize.INTEGER,
                 allowNull: true,
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
   await queryInterface.dropTable('itens_comanda');
  }
};
