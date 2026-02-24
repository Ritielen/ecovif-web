const { DataTypes } = require("sequelize");
const sequelizeconnect = require("../config/connection");

const Prato = sequelizeconnect.define(
  "Prato",
  {
      id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    rendimento: {
      type: DataTypes.INTEGER,
    },
    custo_prato: {
      type: DataTypes.DOUBLE,
    },
    percentual_lucro: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    preco: {
      type: DataTypes.DOUBLE,
    },
    CardapioId: {
      type: DataTypes.INTEGER,
    },
    UsuarioId: {
      type: DataTypes.INTEGER,
    }
  },
  {
    timestamps: false,
    tableName: "prato",
  }
);

module.exports = Prato;
