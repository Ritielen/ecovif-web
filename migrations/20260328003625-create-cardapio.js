'use strict';

module.exports = {
   up: async (queryInterface, Sequelize) => {
   await queryInterface.createTable('cardapio', {
     id: { 
            type: Sequelize.INTEGER, 
            autoIncrement: true, 
            primaryKey: true 
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
   await queryInterface.dropTable('cardapio');
  }
};
