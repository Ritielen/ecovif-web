const { DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

const RankingProdutosMensal = sequelize.define(
  "RankingProdutosMensal",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },

    posicao: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },

    quantidade_vendida: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    faturamento_produto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },

    tipo_item: {
      type: DataTypes.ENUM("prato", "bebida"),
      allowNull: false,
    },

    relatorio_mensal_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "relatorios_mensais",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    produto_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "produtos",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "ranking_produtos_mensais",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true,

    indexes: [
      {
        unique: true,
        fields: ["relatorio_mensal_id", "produto_id"],
      },
    ],
  }
);

// ASSOCIAÇÕES
RankingProdutosMensal.associate = (models) => {
  RankingProdutosMensal.belongsTo(models.RelatorioMensal, {
    foreignKey: "relatorio_mensal_id",
    as: "relatorio",
  });

  RankingProdutosMensal.belongsTo(models.Produto, {
    foreignKey: "produto_id",
    as: "produto",
  });
};

module.exports = RankingProdutosMensal;