"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("relatorios_mensais", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      mes: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      ano: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      faturamento_bruto: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },

      despesas: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },

      lucro_liquido: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },

      margem_lucro: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.0,
      },

      ticket_medio: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
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
      restaurante_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "restaurante",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
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
      "relatorios_mensais",
      ["mes", "ano", "usuario_id"],
      {
        unique: true,
        name: "relatorio_mensal_unico",
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("relatorios_mensais");
  },
};
