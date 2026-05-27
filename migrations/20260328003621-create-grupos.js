'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('grupos', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      nome_grupo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      
      descricao_grupo: {
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

     await queryInterface.bulkInsert('grupos', [
      {
        nome_grupo: "Garçons",
        descricao_grupo: "Responsável pela comanda.",
        created_at: new Date(),
        updated_at: new Date(),
          },

           {
        nome_grupo: "Cozinha",
        descricao_grupo: "Responsável pelos pedidos",
        created_at: new Date(),
        updated_at: new Date()
          },
          {
        nome_grupo: "Caixa",
        descricao_grupo: "Responsável pelo fechamento do caixa.",
        created_at: new Date(),
        updated_at: new Date()
          },  
    ]);
  }, 

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('grupos');
  }
};