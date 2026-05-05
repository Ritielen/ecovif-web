const { DataTypes } = require("sequelize");
const sequelizeconnect = require("../config/connection"); 

const Token = sequelizeconnect.define(
  "Token",
  {
     id: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    token: {
      type: DataTypes.STRING,
       allowNull: false,
    },
    data_criacao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
     data_expiracao: { 
      type: DataTypes.DATE,
      allowNull: true,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    }
  },
  {
     
    tableName: "tokens", 
     timestamps: true,
    createdAt: 'created_at',
  updatedAt: 'updated_at',
    underscored: true,
  }
);

// ASSOCIAÇÕES DO TOKEN
Token.associate = (models) => {
  Token.belongsTo(models.Usuario, {
    foreignKey: 'usuario_id',
    as: 'usuario'
  });
};
module.exports = Token;