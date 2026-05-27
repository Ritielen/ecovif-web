const { DataTypes } = require("sequelize");
const sequelizeconnect = require("../config/connection");

const Grupo = sequelizeconnect.define("Grupo", {
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  nome_grupo: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
 
  descricao_grupo: { 
    type: DataTypes.TEXT,
    allowNull: true
  }
}, 
{
  tableName: "grupos",
   timestamps: true,
    createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
});

// ASSOCIAÇÕES DO GRUPO
Grupo.associate = (models) => {
  Grupo.hasMany(models.Usuario, {
    foreignKey: {
      name: 'grupo_id',
      allowNull: true
    },
    as: 'usuarios',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

};

module.exports = Grupo;