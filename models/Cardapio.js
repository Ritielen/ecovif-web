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
    allowNull: false,
  }
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
    foreignKey: 'usuario_id',
    as: 'usuario'
  });

  Cardapio.hasMany(models.Prato, {
    foreignKey: 'cardapio_id',
    as: 'pratos'
  });

  Cardapio.hasMany(models.Bebida, {
    foreignKey: 'cardapio_id',
    as: 'bebidas'
  });
};
module.exports = Cardapio;
