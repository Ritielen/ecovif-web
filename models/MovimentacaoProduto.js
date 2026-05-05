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
    nova_data_validade: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    nova_quantidade:{
    type: DataTypes.INTEGER,
    allowNull: true,
    },
    novo_valor_compra: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.0,
    },
     quantidade_total: {   //soma quantidade e nova_quantidade
     type: DataTypes.INTEGER,
      allowNull: true, 
    },
    valor_total_gasto: {  //soma valor_compra e novo_valor_compra
      type: DataTypes.DECIMAL(10, 2),
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


};

module.exports = MovimentacaoProduto;


