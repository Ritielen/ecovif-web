'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('restaurante', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      nome: {
        type: Sequelize.STRING,
        allowNull: false
      },
      
      descricao: {
        type: Sequelize.TEXT,
        allowNull: true
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

     await queryInterface.bulkInsert('restaurante', [
      {
        nome: "Restaurante Sabor de Minas",
        descricao: "Localizado em Bagé - 1894 - AV. 7 de Setembro - Centro,",
        created_at: new Date(),
        updated_at: new Date(),
          },
    ]);
  }, 

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('restaurante');
  }
};