'use strict';

module.exports = {
   up: async (queryInterface, Sequelize) => {
   await queryInterface.createTable('pedidos', {
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
             descricao_prato: {
              type: Sequelize.TEXT,
              allowNull: false,
            },
             observacoes: {
              type: Sequelize.TEXT,
              allowNull: true,
            },
             quantidade: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            status: {
              type: Sequelize.ENUM('pendente', 'em preparo', 'pronto', 'cancelado'),
              allowNull: false,
              defaultValue: 'pendente'
            },
            comanda_id: {
              type: Sequelize.INTEGER,
              allowNull: true,
            },
            prato_id: {
              type: Sequelize.INTEGER,
              allowNull: true,
            },
            ItemComanda_id:{
              type: Sequelize.INTEGER,
              allowNull: true,
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
   await queryInterface.dropTable('pedidos');
  }
};
