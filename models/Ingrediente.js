const { DataTypes } = require("sequelize");
const sequelizeconnect = require("../config/connection");

const Ingrediente = sequelizeconnect.define(
  "Ingrediente",
  {
      id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    quantidade_ingrediente: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    unidade_ingrediente: {
  type: DataTypes.ENUM('kg', 'g', 'l', 'ml', 'un'),
  allowNull: true,
},
    produto_id: {
      type: DataTypes.INTEGER,
    allowNull: false,
  },
   prato_id: {
      type: DataTypes.INTEGER,
    allowNull: false,
  }
    
  },
  {
    tableName: "ingredientes",
     timestamps: true,
    createdAt: 'created_at',
  updatedAt: 'updated_at',
    underscored: true,
  }
);

// ASSOCIAÇÕES DO INGREDIENTE
Ingrediente.associate = (models) => {
  // Ingrediente pertence a um Produto
  Ingrediente.belongsTo(models.Produto, {
    foreignKey: 'produto_id',
    as: 'produto'
  });

  // Ingrediente pertence a um Prato
  Ingrediente.belongsTo(models.Prato, {
    foreignKey: 'prato_id',
    as: 'prato'
  });
};

module.exports = Ingrediente;
