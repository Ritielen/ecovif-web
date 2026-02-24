const { DataTypes } = require("sequelize");
const sequelizeconnect = require("../config/connection");

const Vinho = sequelizeconnect.define(
  "Vinho",
  {
     id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    nome: {
      type: DataTypes.STRING,
    },
    tipo_vinho: {
      type: DataTypes.STRING, 
    },
    tamanho: {
      type: DataTypes.STRING,
    },
    unidade: {
      type: DataTypes.STRING,
    },
    preco: {
      type: DataTypes.DOUBLE,
    },
    CardapioId: {
      type: DataTypes.INTEGER,
    }
  },
  {
    timestamps: false,
    tableName: "vinho",
  }
);

module.exports = Vinho;
