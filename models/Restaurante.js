const { DataTypes } = require("sequelize");
const sequelizeconnect = require("../config/connection");

const Restaurante = sequelizeconnect.define("Restaurante", {
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  nome: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  descricao: { 
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: "restaurante",
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
});

Restaurante.associate = (models) => {
  Restaurante.hasMany(models.Usuario, {
    foreignKey: {
      name: 'restaurante_id',
      allowNull: false
    },
    as: 'usuarios',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

    Restaurante.hasMany(models.Produto, {
    foreignKey: 'restaurante_id',
    as: 'produtos',
    onDelete: 'SET NULL',
    hooks: true
  });

  Restaurante.hasMany(models.MovimentacaoProduto, {
    foreignKey: 'restaurante_id',
    as: 'movimentacoes_produto',
    onDelete: 'SET NULL',
    hooks: true
  });

  Restaurante.hasOne(models.Cardapio, {
    foreignKey: 'restaurante_id',
    as: 'cardapio',
    onDelete: 'SET NULL',
    hooks: true
  });
};


module.exports = Restaurante;
