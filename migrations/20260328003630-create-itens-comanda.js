"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("itens_comanda", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      comanda_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "comandas",
          key: "id",
        },
        onDelete: "CASCADE", //serve para excluir os meus itens caso a comanda seja excluída.
      },

      tipo_item: {
        type: Sequelize.ENUM("prato", "bebida"),
        allowNull: false,
        defaultValue: "prato",
      },
      quantidade: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      prato_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      bebida_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      produto_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
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
    await queryInterface.dropTable("itens_comanda");
  },
};
