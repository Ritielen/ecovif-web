const { DataTypes } = require("sequelize");
const sequelizeconnect = require("../config/connection");

const Venda = sequelizeconnect.define(
  "Venda",
  {
    id: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    taxa_servico: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true, 
      defaultValue: 0.00
    },    
    valor_couvert: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true, 
      defaultValue: 0.00
    },
    total_final: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false, 
      defaultValue: 0.00
    },
    status_venda: {
      type: DataTypes.ENUM("fechada"),
      allowNull: false,
      defaultValue: "fechada"
    },
    data_venda: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW, 
    },
    comanda_id: {
      type: DataTypes.INTEGER,
      allowNull: false, 
    },
    evento_id: {
      type: DataTypes.INTEGER,
      allowNull: true, 
    },
    usuario_id: {
      type: DataTypes.INTEGER, 
      allowNull: false,
    }
  },
  {
    tableName: "vendas",
     timestamps: true,
    createdAt: 'created_at',
  updatedAt: 'updated_at',
    underscored: true,
     
  }
);

// ASSOCIAÇÕES DA VENDA
Venda.associate = (models) => {
  Venda.belongsTo(models.Usuario, {
    foreignKey: 'usuario_id',
    as: 'usuario'
  });
  
  Venda.belongsTo(models.Comanda, {
    foreignKey: 'comanda_id',
    as: 'comanda'
  });
  Venda.belongsTo(models.Evento, {
    foreignKey: 'evento_id',
    as: 'evento'
  });
};

module.exports = Venda;
