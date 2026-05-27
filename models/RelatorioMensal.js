const { DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

const RelatorioMensal = sequelize.define(
  "RelatorioMensal",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },

    mes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 12,
      },
    },

    ano: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    faturamento_bruto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },

    despesas: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },

    lucro_liquido: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },

    margem_lucro: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.0,
    },

    ticket_medio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },

    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
   
  },
  {
    tableName: "relatorios_mensais",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true,

    indexes: [
      {
        unique: true,
        fields: ["mes", "ano", "usuario_id"],
      },
    ],
  },
);

// ASSOCIAÇÕES
RelatorioMensal.associate = (models) => {
  RelatorioMensal.belongsTo(models.Usuario, {
    foreignKey:  {
      name: 'usuario_id',
      allowNull: true
    },
    as: 'usuario',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });
 
};

module.exports = RelatorioMensal;
