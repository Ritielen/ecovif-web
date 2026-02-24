const { DataTypes } = require("sequelize");
const sequelizeconnect = require("../config/connection");

const Cardapio = sequelizeconnect.define(
  "Cardapio",
  {
      id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    texto: {
      type: DataTypes.STRING,
    },
    UsuarioId: {
      type: DataTypes.INTEGER,
    }
  },
  {
    timestamps: false,
    tableName: "cardapio",
  }
);

module.exports = Cardapio;
