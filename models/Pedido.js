const { DataTypes } = require("sequelize");
const sequelizeconnect = require("../config/connection");

const Pedido = sequelizeconnect.define(
  "Pedido",
  {
    id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    nome_cliente: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mesa: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
      descricao_prato: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pendente', 'em preparo', 'pronto', 'cancelado'),
      allowNull: false,
      defaultValue: 'pendente'
    },
   comanda_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
   },
   prato_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
   },
   ItemComanda_id:{
      type: DataTypes.INTEGER,
      allowNull: true,
   },  
   usuario_id: {
      type: DataTypes.INTEGER, 
      allowNull: true,
    }
    },
  
  {
    tableName: "pedidos",
     timestamps: true,
    createdAt: 'created_at',
  updatedAt: 'updated_at',
    underscored: true,
  }
);

// ASSOCIAÇÕES DO PEDIDO
Pedido.associate = (models) => {
  Pedido.belongsTo(models.Usuario, {
    foreignKey: 'usuario_id',
    as: 'usuario'
  });
  Pedido.belongsTo(models.Prato, {
    foreignKey: 'prato_id',
    as: 'prato'
  });
  Pedido.belongsTo(models.Comanda, {
    foreignKey: 'comanda_id',
    as: 'comanda'
  });
  Pedido.belongsTo(models.ItemComanda, {
    foreignKey: 'ItemComanda_id',
    as: 'item_comanda'
  });
};

module.exports = Pedido;
