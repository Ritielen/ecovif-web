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
    allowNull: true,
  },
  status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'ativo'
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

// associações prato
Prato.associate = (models) => {
  Prato.belongsTo(models.Usuario, {
    foreignKey: {
      name: 'usuario_id',
      allowNull: true
    },
    as: 'usuario',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });
    

 Prato.belongsTo(models.Cardapio, {
    foreignKey: {
      name: 'cardapio_id',
      allowNull: false
    },
    as: 'cardapio',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  Prato.hasMany(models.Ingrediente, {
    foreignKey: 'prato_id',
    as: 'ingredientes',
    onDelete: 'CASCADE',
    hooks: true
  });
};

module.exports = Prato;
