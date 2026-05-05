'use strict';

module.exports = {
   up: async (queryInterface, Sequelize) => {
   await queryInterface.createTable('comandas', {
     id: { 
            type: Sequelize.INTEGER, 
            autoIncrement: true, 
            primaryKey: true 
        },
             nome_cliente: {
                        type: Sequelize.STRING,
                        allowNull: false,
                    },
                    mesa: {
                        type: Sequelize.INTEGER,
                        allowNull: false,
                    },
                   
                 observacoes: {
                        type: Sequelize.TEXT,
                        allowNull: true,
                    },
                    total: {
                        type: Sequelize.DECIMAL(10, 2),
                        allowNull: false,
                    },
                     status: {
                        type: Sequelize.ENUM('pendente', 'em preparo', 'finalizada'),
                        allowNull: false,
                        defaultValue: 'pendente'
                     },
                   usuario_id: {
                  type: Sequelize.INTEGER,
                allowNull: false,
              },
                data: { 
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
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
   await queryInterface.dropTable('comandas');
  }
};
