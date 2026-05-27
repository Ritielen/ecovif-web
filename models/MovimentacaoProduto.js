const { DataTypes } = require("sequelize");
const sequelizeconnect = require("../config/connection");

const MovimentacaoProduto = sequelizeconnect.define(
  "MovimentacaoProduto",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tipo: {
      type: DataTypes.ENUM("entrada", "saida"),
      allowNull: false,
    },
    origem: {
      type: DataTypes.ENUM("estoque", "comanda"),
      allowNull: false,
    },
    nova_data_validade: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    nova_quantidade: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    novo_valor_compra: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.0,
    },
    quantidade_total: {
      //soma quantidade e nova_quantidade
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    valor_total_gasto: {
      //soma valor_compra e novo_valor_compra
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.0,
    },
    produto_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    item_comanda_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    comanda_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },

  {
    tableName: "movimentacoes_produto",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true,
  },
);

// ASSOCIAÇÕES DA MOVIMENTACAO PRODUTO
MovimentacaoProduto.associate = (models) => {
  MovimentacaoProduto.belongsTo(models.Usuario, {
    foreignKey: {
      name: "usuario_id",
      allowNull: true,
    },
    as: "usuario",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });
  MovimentacaoProduto.belongsTo(models.Produto, {
    foreignKey: {
      name: "produto_id",
      allowNull: false,
    },
    as: "produto",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  });
  MovimentacaoProduto.belongsTo(models.ItemComanda, {
    foreignKey: {
      name: "item_comanda_id",
      allowNull: true,
    },
    as: "item_comanda",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });
  MovimentacaoProduto.belongsTo(models.Comanda, {
    foreignKey: {
      name: "comanda_id",
      allowNull: true,
    },
    as: "comanda",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });
};

module.exports = MovimentacaoProduto;
