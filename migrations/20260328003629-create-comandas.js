"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("comandas", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
        type: Sequelize.ENUM("pendente", "em preparo", "pronta", "cancelada"),
        allowNull: false,
        defaultValue: "pendente",
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
      data: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("comandas");
  },
};
