'use strict';

module.exports = {
   up: async (queryInterface, Sequelize) => {
   await queryInterface.createTable('pratos', {
     id: { 
            type: Sequelize.INTEGER, 
            autoIncrement: true, 
            primaryKey: true 
        },
        nome: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        rendimento: {
          type: Sequelize.INTEGER,
        },
        custo_prato: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0.0,
        },
        preco_venda: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0.0,
        },
        cardapio_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
         references: {
          model: "cardapio",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    },
       usuario_id: {
          type: Sequelize.INTEGER,
        allowNull: true, 
        references: {
          model: "usuarios",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
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
   await queryInterface.dropTable('pratos');
  }
};
