const { DataTypes } = require("sequelize");
const sequelizeconnect = require("../config/connection");

const Grupo = sequelizeconnect.define("Grupo", {
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  nome: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  slug: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true }, 
}, 
{
  timestamps: false,
  tableName: "grupos",
});

module.exports = Grupo;