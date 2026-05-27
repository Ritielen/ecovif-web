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
     unidade_ingrediente: {
         type: Sequelize.ENUM('kg', 'g', 'l', 'ml', 'un'),
         allowNull: true,
       },
        produto_id: {
             type: Sequelize.INTEGER,
           allowNull: false,
           references: {
            model: "produtos",
            key: "id",
           },
           onDelete: "RESTRICT",
             onUpdate: "CASCADE"
         },
          prato_id: {
             type: Sequelize.INTEGER,
           allowNull: false,
           references: {
            model: "pratos",
            key: "id",
           },
           onDelete: "CASCADE",
             onUpdate: "CASCADE"
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
