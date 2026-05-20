"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ranking_produtos_mensais", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      posicao: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      quantidade_vendida: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      faturamento_produto: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },

      tipo_item: {
        type: Sequelize.ENUM("prato", "bebida"),
        allowNull: false,
      },

      relatorio_mensal_id: {
        type: Sequelize.INTEGER,
        allowNull: false,

        references: {
          model: "relatorios_mensais",
          key: "id",
        },

        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      produto_id: {
        type: Sequelize.INTEGER,
        allowNull: false,

        references: {
          model: "produtos",
          key: "id",
        },

        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // ÍNDICE ÚNICO
    await queryInterface.addIndex(
      "ranking_produtos_mensais",
      ["relatorio_mensal_id", "produto_id"],
      {
        unique: true,
        name: "ranking_produto_mensal_unico",
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("ranking_produtos_mensais");
  },
};