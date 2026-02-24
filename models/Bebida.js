const { DataTypes } = require("sequelize");
const sequelizeconnect = require("../config/connection");

const Bebida = sequelizeconnect.define(
  "Bebida",
  {
      id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    nome: {
      type: DataTypes.STRING,
    },
    tamanho: {
      type: DataTypes.STRING,
    },
    unidade: {
      type: DataTypes.STRING,
    },
    data_validade: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
     quantidade_minima: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantidade: {
      type: DataTypes.INTEGER,      
      allowNull: false,
    },
    preco: {
      type: DataTypes.DOUBLE,
    },
    UsuarioId: {
      type: DataTypes.INTEGER,
    },
    CardapioId: {
      type: DataTypes.INTEGER,
    }
  },
  {
    timestamps: false,
    tableName: "bebida",
  }
);

module.exports = Bebida;
