const { DataTypes } = require("sequelize");
const sequelizeconnect = require("../config/connection");

const MovimentacaoProduto = sequelizeconnect.define(
  "MovimentacaoProduto",
  {
      id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    tipo: {
      type: DataTypes.ENUM('entrada', 'saida'),
      allowNull: false,
    },
    origem: {
      type: DataTypes.ENUM('estoque', 'comanda'),
      allowNull: false,
    },
    nova_data_validade: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    nova_quantidade:{
    type: DataTypes.DECIMAL(10, 3),
    allowNull: true,
    },
    novo_valor_compra: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
      defaultValue: 0.0,
    },
     quantidade_total: {   //soma quantidade e nova_quantidade
     type: DataTypes.DECIMAL(10, 3),
      allowNull: true, 
    },
    valor_total_gasto: {  //soma valor_compra e novo_valor_compra
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true, 
      defaultValue: 0.0,
    },
    produto_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
     usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
     item_comanda_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
      comanda_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  },
  
  {
    tableName: "movimentacoes_produto",
     timestamps: true,
    createdAt: 'created_at',
  updatedAt: 'updated_at',
    underscored: true,
  }

);

// ASSOCIAÇÕES DA MOVIMENTACAOPRODUTO
MovimentacaoProduto.associate = (models) => {
  MovimentacaoProduto.belongsTo(models.Usuario, {
    foreignKey: 'usuario_id',
    as: 'usuario'
  });
  MovimentacaoProduto.belongsTo(models.Produto, {
foreignKey: 'produto_id',
as: 'produto'
  });
MovimentacaoProduto.belongsTo(models.ItemComanda, {
foreignKey: 'item_comanda_id',
as: 'item_comanda'
  });
  MovimentacaoProduto.belongsTo(models.Comanda, {
  foreignKey: "comanda_id",
  as: "comanda"
});

};

module.exports = MovimentacaoProduto;


