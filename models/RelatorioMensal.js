const { DataTypes } = require("sequelize");
const sequelizeconnect = require("../config/connection");

const RelatorioMensal = sequelizeconnect.define(
  "RelatorioMensal",
  {
    id: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },

    mes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 12 }
    },

    ano: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    faturamento_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },

    despesas: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    quantidade_total_produtos: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    quantidade_minima_produtos: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // ranking dos mais vendidos 
    posicao: {
    type: DataTypes.INTEGER,
    allowNull: false
    },
    produtos_mais_vendidos: {
      type: DataTypes.STRING,
      allowNull: false
    },    
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false
  },
},
  {
    tableName: "relatorios_mensais",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,

    indexes: [
      {
        unique: true,
        fields: ['mes', 'ano', 'usuario_id']
      }
    ]
  }
);

// ASSOCIAÇÕES DO RELATORIOMENSAL
RelatorioMensal.associate = (models) => {
  RelatorioMensal.belongsTo(models.Usuario, {
    foreignKey: 'usuario_id',
    as: 'usuario'
  });
};
module.exports = RelatorioMensal;
