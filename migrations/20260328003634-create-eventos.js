'use strict';

module.exports = {
   up: async (queryInterface, Sequelize) => {
   await queryInterface.createTable('eventos', {
     id: { 
            type: Sequelize.INTEGER, 
            autoIncrement: true, 
            primaryKey: true 
        },
        descricao: {
              type: Sequelize.TEXT,
              allowNull: false,
            },
            data: {
              type: Sequelize.DATEONLY,
              allowNull: false,
            },
            horario: {
              type: Sequelize.TIME,
              allowNull: false,
            },
              couvert_ativo: {
              type: Sequelize.BOOLEAN,
              allowNull: false,
              defaultValue: false,
            },
            valor_couvert: {
              type: Sequelize.DECIMAL(10, 2),
              allowNull: true, 
              defaultValue: 0.00,
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
   await queryInterface.dropTable('eventos');
  }
};
