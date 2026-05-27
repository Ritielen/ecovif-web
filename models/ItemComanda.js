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
    foreignKey: {
      name: 'comanda_id',
      allowNull: false
    },
    as: 'comanda',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
 
  ItemComanda.belongsTo(models.Prato, {
    foreignKey:  {
      name: 'prato_id',
      allowNull: true
    },
    as: 'prato',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });
  
  ItemComanda.belongsTo(models.Bebida, {
    foreignKey: {
      name: 'bebida_id',
      allowNull: true
    },
    as: 'bebida',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

  //produto pode ser removido ou desativado
  ItemComanda.belongsTo(models.Produto, { 
    foreignKey: {
      name: 'produto_id',
      allowNull: true
    },
    as: 'produto',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });
  //movimentações são histórico
ItemComanda.hasMany(models.MovimentacaoProduto, { 
    foreignKey: 'item_comanda_id', 
    as: 'movimentacoes',
    onDelete: 'SET NULL',
    hooks: true
  });
};
module.exports = ItemComanda;
