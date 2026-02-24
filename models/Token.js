const { DataTypes } = require("sequelize");
const sequelizeconnect = require("../config/connection"); 

const Token = sequelizeconnect.define(
  "Token",
  {
    token: {
      type: DataTypes.STRING,
    },
    datacriacao: {
        type: DataTypes.DATE,
    },
  },
  {
    timestamps: false, 
    tableName: "token", 
  }
);

module.exports = Token;