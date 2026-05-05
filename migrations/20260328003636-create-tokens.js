'use strict';

module.exports = {
   up: async (queryInterface, Sequelize) => {
   await queryInterface.createTable('tokens', {
     id: { 
            type: Sequelize.INTEGER, 
            autoIncrement: true, 
            primaryKey: true 
        },
        token: {
              type: Sequelize.STRING,
               allowNull: false,
            },
            data_criacao: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.NOW,
            },
             data_expiracao: { 
              type: Sequelize.DATE,
              allowNull: true,
            },
            usuario_id: {
              type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'usuarios',
              key: 'id'
            }
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
   await queryInterface.dropTable('tokens');
  }
};
