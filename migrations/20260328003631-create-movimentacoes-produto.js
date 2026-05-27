"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("movimentacoes_produto", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      tipo: {
        type: Sequelize.ENUM("entrada", "saida"),
        allowNull: false,
      },
      origem: {
        type: Sequelize.ENUM("estoque", "comanda"),
        allowNull: false,
      },
      nova_data_validade: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      nova_quantidade: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      novo_valor_compra: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.0,
      },
      quantidade_total: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      valor_total_gasto: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.0,
      },
      produto_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "produtos",
          key: "id",
          onDelete: "RESTRICT",
          onUpdate: "CASCADE"
        },
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
      
      item_comanda_id: {
        type: Sequelize.INTEGER,
         allowNull: true,
        references: {
          model: "itens_comanda",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      comanda_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "comandas",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
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
    await queryInterface.dropTable("movimentacoes_produto");
  },
};
