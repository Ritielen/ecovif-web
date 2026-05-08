const { DataTypes } = require("sequelize");
const sequelizeconnect = require("../config/connection");

const Prato = sequelizeconnect.define(
  "Prato",
  {
      id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    
    nome: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    rendimento: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    custo_prato: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0
    },
    preco_venda: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0
    },
  cardapio_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
  },
  {
    tableName: "pratos",
     timestamps: true,
    createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
  }
);

Prato.associate = (models) => {
  Prato.belongsTo(models.Usuario, {
    foreignKey: 'usuario_id',
    as: 'usuario'
  });

 Prato.belongsTo(models.Cardapio, {
    foreignKey: 'cardapio_id',
    as: 'cardapio'
  });

  
  Prato.hasMany(models.Ingrediente, {
    foreignKey: 'prato_id',
    as: 'ingredientes'
  });
};

module.exports = Prato;
