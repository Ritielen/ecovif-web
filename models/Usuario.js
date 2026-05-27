const { DataTypes } = require("sequelize");
const sequelizeconnect = require("../config/connection");

const Usuario = sequelizeconnect.define(
  "Usuario",
  {
    id: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sobrenome: {
      type: DataTypes.STRING,
      allowNull: false
    },
    telefone:{
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    senha: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    funcionario: {
      type: DataTypes.ENUM('gestor', 'funcionario'),
      allowNull: false,
      defaultValue: 'funcionario'
    },
    criado_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
     grupo_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'grupos',
        key: 'id'
      }
    }
    
  },
  {
    tableName: "usuarios",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
  }
);

// Associações
Usuario.associate = (models) => {
  Usuario.belongsTo(models.Grupo, {
    foreignKey: {
      name: 'grupo_id',
      allowNull: true
    },
    as: 'grupo',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

  Usuario.hasMany(models.Usuario, {   
    foreignKey: 'criado_por',
    as: 'subordinados',
    onDelete: 'SET NULL',
    hooks: true
  });

  Usuario.belongsTo(models.Usuario, {
    foreignKey: 'criado_por',
    as: 'criador',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

  Usuario.hasMany(models.Produto, {
    foreignKey: 'usuario_id',
    as: 'produtos',
    onDelete: 'SET NULL',
    hooks: true
  });
  Usuario.hasMany(models.MovimentacaoProduto, {
    foreignKey: 'usuario_id',
    as: 'movimentacoes_produto',
    onDelete: 'SET NULL',
    hooks: true
  });
  Usuario.hasOne(models.Cardapio, {
  foreignKey: 'usuario_id',
  as: 'cardapio',
   onDelete: 'SET NULL',
    hooks: true
});

  Usuario.hasMany(models.Token, {
    foreignKey: 'usuario_id',
    as: 'tokens',
     onDelete: 'CASCADE',
    hooks: true
  });
};

module.exports = Usuario;
