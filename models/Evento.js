const { DataTypes } = require("sequelize");
const sequelizeconnect = require("../config/connection");

const Evento = sequelizeconnect.define(
  "Evento",
  {
      id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
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
    couvert_ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    createdAt: 'created_at',
  updatedAt: 'updated_at',
     underscored: true,
  }
);

// ASSOCIAÇÕES DO EVENTO
Evento.associate = (models) => {
  Evento.belongsTo(models.Usuario, {
    foreignKey: 'usuario_id',
    as: 'usuario'
  });
};
module.exports = Evento;
