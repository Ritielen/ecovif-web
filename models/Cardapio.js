const { DataTypes } = require("sequelize");
const sequelizeconnect = require("../config/connection");

const Cardapio = sequelizeconnect.define(
  "Cardapio",
  {
      id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    usuario_id: { 
        type: DataTypes.INTEGER, 
        allowNull: true,
    },
   
  },
  {
    tableName: "cardapio",
    timestamps: true,
    createdAt: 'created_at',
  updatedAt: 'updated_at',
    underscored: true,
  }
);

// ASSOCIAÇÕES DO CARDAPIO
Cardapio.associate = (models) => {
  Cardapio.belongsTo(models.Usuario, {
  foreignKey: {
      name: 'usuario_id',
      allowNull: true
    },
    as: 'usuario',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

  Cardapio.hasMany(models.Prato, {
    foreignKey: 'cardapio_id',
    as: 'pratos',
     onDelete: 'CASCADE',
    hooks: true
  });

  Cardapio.hasMany(models.Bebida, {
    foreignKey: 'cardapio_id',
    as: 'bebidas',
     onDelete: 'CASCADE',
    hooks: true
  });
};
module.exports = Cardapio;
