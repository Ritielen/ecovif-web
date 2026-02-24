const { DataTypes } = require("sequelize");
const sequelizeconnect = require("../config/connection");

const ItemComanda = sequelizeconnect.define(
  "ItemComanda",
  {
      id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    quantidade: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tipo_item: {
      type: DataTypes.STRING, 
      allowNull: true,
    },
  },
  {
    tableName: "itens_comanda",
    underscored: true,
    timestamps: true,
  }
);



module.exports = ItemComanda;
