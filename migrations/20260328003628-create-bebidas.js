'use strict';

module.exports = {
   up: async (queryInterface, Sequelize) => {
   await queryInterface.createTable('bebidas', {
     id: { 
            type: Sequelize.INTEGER, 
            autoIncrement: true, 
            primaryKey: true, 
        },  
        
        preco_venda:{
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0.0,
        } ,
        produto_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          cardapio_id: {
              type: Sequelize.INTEGER,
            allowNull: false,
          },
            usuario_id: {
              type: Sequelize.INTEGER,
            allowNull: false,
          },
     created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
     });
  },

  async down (queryInterface, Sequelize) {
   await queryInterface.dropTable('bebidas');
  }
};
