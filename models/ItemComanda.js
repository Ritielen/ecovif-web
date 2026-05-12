const { DataTypes } = require("sequelize");
const sequelizeconnect = require("../config/connection");

const ItemComanda = sequelizeconnect.define(
  "ItemComanda",
  {
      id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
     tipo_item: {
  type: DataTypes.ENUM('prato', 'bebida'),
  allowNull: false,
  defaultValue: 'prato',
},
     quantidade: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
   
  comanda_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
    prato_id: {
      type: DataTypes.INTEGER, 
      allowNull: true,
    },
     bebida_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    produto_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
    },
  
  {
    tableName: "itens_comanda",
     timestamps: true,
    createdAt: 'created_at',
  updatedAt: 'updated_at',
    underscored: true,
  }
);

// ASSOCIAÇÕES DO ITEMCOMANDA
ItemComanda.associate = (models) => {
  ItemComanda.belongsTo(models.Comanda, {
    foreignKey: 'comanda_id',
    as: 'comanda'
  });
  
  ItemComanda.belongsTo(models.Prato, {
    foreignKey: 'prato_id',
    as: 'prato'
  });
  
  ItemComanda.belongsTo(models.Bebida, {
    foreignKey: 'bebida_id',
    as: 'bebida'
  });
  ItemComanda.belongsTo(models.Produto, { 
    foreignKey: 'produto_id', 
    as: 'produto' 
  });

};
module.exports = ItemComanda;
