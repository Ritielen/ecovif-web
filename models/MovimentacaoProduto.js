const { DataTypes } = require("sequelize");
const sequelizeconnect = require("../config/connection");

const MovimentacaoProduto = sequelizeconnect.define(
  "MovimentacaoProduto",
  {
      id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    tipo: {
      type: DataTypes.STRING, 
      allowNull: false,
    },
    quantidade: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    valor_compra: {
      type: DataTypes.DOUBLE,
      allowNull: true, 
    },
    valor_total: {
      type: DataTypes.DOUBLE,
      allowNull: true, 
    },
    nova_data_validade: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    ProdutoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  },
  {
    tableName: "movimentacoes_produto",
    underscored: true,
    timestamps: true,
  }
);

module.exports = MovimentacaoProduto;
