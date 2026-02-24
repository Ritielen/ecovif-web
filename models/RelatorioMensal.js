const { DataTypes } = require("sequelize");
const sequelizeconnect = require("../config/connection");

const RelatorioMensal = sequelizeconnect.define(
  "RelatorioMensal",
  {
    mes: {
      type: DataTypes.STRING, 
      allowNull: false,
    },
    ano: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    faturamento: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    despesas: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    lucro: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    percentual_lucro: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    }
  },
  {
    tableName: "relatorios_mensais",
    underscored: true,
    timestamps: true,
  }
);

module.exports = RelatorioMensal;
