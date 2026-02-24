const { DataTypes } = require("sequelize");
const sequelizeconnect = require("../config/connection");

const Ingrediente = sequelizeconnect.define(
  "Ingrediente",
  {
      id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    ProdutoId: {
      type: DataTypes.INTEGER,
    },
    PratoId: {
      type: DataTypes.INTEGER,
    },
    quantidade: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unidade: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "ingredientes",
    underscored: true,
    timestamps: true,
  }
);

module.exports = Ingrediente;
