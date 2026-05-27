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
      allowNull: true, 
    },
    evento_id: {
      type: DataTypes.INTEGER,
      allowNull: true, 
    },
    usuario_id: {
      type: DataTypes.INTEGER, 
      allowNull: true,
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
    foreignKey: {
      name: 'usuario_id',
      allowNull: true
    },
    as: 'usuario',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });
  
  //venda continua existindo sem a comanda
  Venda.belongsTo(models.Comanda, {
    foreignKey: {
      name: 'comanda_id',
      allowNull: true
    },
    as: 'comanda',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });
  //evento pode ser removido sem apagar vendas
  Venda.belongsTo(models.Evento, {
    foreignKey: {
      name: 'evento_id',
      allowNull: true
    },
    as: 'evento',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });
};

module.exports = Venda;
