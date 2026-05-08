const { DataTypes } = require("sequelize");
const sequelizeconnect = require("../config/connection");

const Bebida = sequelizeconnect.define(
  "Bebida",
  {
      id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true, 
  },
  
  preco_venda: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.0,
  },
  produto_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
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
    timestamps: true,
    createdAt: 'created_at',
  updatedAt: 'updated_at',
    tableName: "bebidas",
     underscored: true,
  }
);

// ASSOCIAÇÕES DA BEBIDA
Bebida.associate = (models) => {
  Bebida.belongsTo(models.Usuario, {
    foreignKey: 'usuario_id',
    as: 'usuario'
  });

  Bebida.belongsTo(models.Cardapio, {
    foreignKey: 'cardapio_id',
    as: 'cardapio'
  });
  // NOVA ASSOCIAÇÃO
  Bebida.belongsTo(models.Produto, {
    foreignKey: 'produto_id',
    as: 'produto'
  });
};

module.exports = Bebida;
