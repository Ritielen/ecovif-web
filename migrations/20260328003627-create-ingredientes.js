'use strict';

module.exports = {
   up: async (queryInterface, Sequelize) => {
   await queryInterface.createTable('ingredientes', {
    id: { 
           type: Sequelize.INTEGER, 
           autoIncrement: true, 
           primaryKey: true 
       },
       quantidade_ingrediente: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
        produto_id: {
             type: Sequelize.INTEGER,
           allowNull: false,
         },
          prato_id: {
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
   await queryInterface.dropTable('ingredientes');
  }
};
