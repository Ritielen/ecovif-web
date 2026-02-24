const { DataTypes } = require("sequelize");
const sequelizeconnect = require("../config/connection");

const Evento = sequelizeconnect.define(
  "Evento",
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
    data: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    horario: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    valorCouvert: {
      type: DataTypes.DOUBLE,
      allowNull: true, 
    },
    possuiCouvert: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    UsuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  },
  {
    timestamps: false,
    tableName: "eventos",
  }
);

module.exports = Evento;
