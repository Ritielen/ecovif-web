const { DataTypes } = require("sequelize");
const sequelizeconnect = require("../config/connection");

const Comanda = sequelizeconnect.define(
    "Comanda",
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
       
     observacoes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
         status: {
            type: DataTypes.ENUM ('pendente', 'em preparo', 'finalizada'),
            allowNull: false,
            defaultValue: 'pendente'
         },
       usuario_id: {
      type: DataTypes.INTEGER,
    allowNull: false,
  },
    data: { 
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
    },
    {
        tableName: "comandas",
        underscored: true,
         timestamps: true,
    createdAt: 'created_at',
  updatedAt: 'updated_at',
    }
);

Comanda.associate = (models) => {
  Comanda.belongsTo(models.Usuario, {
    foreignKey: 'usuario_id',
    as: 'usuario'
  });
  
  // modelo ItemComanda 
  Comanda.hasMany(models.ItemComanda, {
    foreignKey: 'comanda_id',
    as: 'itens'
  });
};
module.exports = Comanda;