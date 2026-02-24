const { DataTypes } = require("Sequelize");
const sequelizeconnect = require("../config/connection");

const Usuario = sequelizeconnect.define(
    "Usuario",
    {
        id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
        nome: {
            type: DataTypes.STRING,
        },
        sobrenome: {
            type: DataTypes.STRING,
        },
        telefone:{
            type: DataTypes.STRING,
        },
        email: {
            type: DataTypes.STRING,
             allowNull: false,
             unique: true,
        },
        senha: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
        {
            timestamps: false,
            tableName: "usuarios",
        }
);

module.exports = Usuario;