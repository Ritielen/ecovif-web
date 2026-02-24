const { DataTypes } = require("sequelize");
const sequelizeconnect = require("../config/connection");

const Comanda = sequelizeconnect.define(
    "Comanda",
    {
          id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
        nome_cliente: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        mesa: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
         tipo_item: {
      type: DataTypes.STRING, 
      allowNull: true,
    },
    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
        observacoes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        total: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
         status: {
            type: DataTypes.STRING,
            allowNull: false,
        },
          UsuarioId: {
      type: DataTypes.INTEGER,
    }
    },
    {
        tableName: "comandas",
        underscored: true,
        timestamps: true, 
    }
);

module.exports = Comanda;