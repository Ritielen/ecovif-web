const { DataTypes } = require("sequelize");
const sequelizeconnect = require("../config/connection");

const Venda = sequelizeconnect.define(
  "Venda",
  {
    comanda_id: {
      type: DataTypes.INTEGER,
      allowNull: false, 
    },
    subtotal: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    taxa_servico: {
      type: DataTypes.DOUBLE,
      allowNull: true, 
    },
    couvert_artistico: {
      type: DataTypes.DOUBLE,
      allowNull: true, 
    },
    total_final: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    possui_couvert: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    data_venda: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW, 
    },
    UsuarioId: {
      type: DataTypes.INTEGER, 
      allowNull: true,
    }
  },
  {
    tableName: "vendas",
    underscored: true,
    timestamps: true, 
  }
);

module.exports = Venda;
