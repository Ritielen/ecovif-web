const { DataTypes } = require("sequelize");
const sequelizeconnect = require("../config/connection");

const Evento = sequelizeconnect.define(
  "Evento",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    data: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    horario: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    status_couvert: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "ativo",
    },
    status_evento: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "ativo"
    },
    valor_couvert: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "eventos",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true,
  },
);

// ASSOCIAÇÕES DO EVENTO
Evento.associate = (models) => {
  Evento.belongsTo(models.Usuario, {
    foreignKey: "usuario_id",
    as: "usuario",
  });
  Evento.hasMany(models.Venda, {
    foreignKey: 'evento_id',
    as: 'vendas'
  });
};
module.exports = Evento;
