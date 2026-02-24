const { DataTypes } = require("sequelize");
const sequelizeconnect = require("../config/connection");

const Produto = sequelizeconnect.define(
  "Produto",
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

    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    categoria: {
      type: DataTypes.STRING, 
      allowNull: true,
    },

    tamanho: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },

    unidade: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    quantidade: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    quantidade_minima: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    data_validade: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    valor_compra: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    UsuarioId: {
      type: DataTypes.INTEGER,
    }
  },
  {
    tableName: "produtos",
    underscored: true,
    timestamps: true,
  }
);

module.exports = Produto;
