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
            type: DataTypes.ENUM ('pendente', 'em preparo', 'pronta', 'cancelada'),
            allowNull: false,
            defaultValue: 'pendente'
         },
       usuario_id: {
      type: DataTypes.INTEGER,
    allowNull: true,
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

// associações comanda
Comanda.associate = (models) => {
  Comanda.belongsTo(models.Usuario, {
    foreignKey: {
      name: 'usuario_id',
      allowNull: true
    },
    as: 'usuario',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });
  
  // modelo Itens pertencem a Comanda 
  Comanda.hasMany(models.ItemComanda, {
    foreignKey: 'comanda_id',
    as: 'itens',
    onDelete: 'CASCADE',  //serve para excluir os itens junto com a comanda.
   hooks: true
  });
  Comanda.hasMany(models.MovimentacaoProduto, {
  foreignKey: "comanda_id",
  as: "movimentacoes",
  onDelete: 'SET NULL',
    hooks: true
});
};
module.exports = Comanda;