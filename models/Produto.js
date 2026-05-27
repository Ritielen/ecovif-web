const { DataTypes } = require("sequelize");
const sequelizeconnect = require("../config/connection");

const Produto = sequelizeconnect.define(
  "Produto",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tipo_item: {
      type: DataTypes.ENUM("produto", "bebida"),
      allowNull: false,
      defaultValue: "produto",
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    codigo: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    data_validade: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    categoria: {
      type: DataTypes.ENUM("alto_custo", "medio_custo", "baixo_custo"),
      allowNull: true,
    },
    tamanho: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    unidade: {
      type: DataTypes.ENUM("kg", "g", "l", "ml", "un"),
      allowNull: true,
    },
    tipo_vinho: {
      type: DataTypes.ENUM("tinto", "branco", "rose", "espumante"),
      allowNull: true,
    },
    quantidade_inicial: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    quantidade: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    quantidade_minima: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'ativo'
    },
    valor_compra: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.0,
    },
     
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "produtos",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true,
  },
);



// ASSOCIAÇÕES DO PRODUTO
Produto.associate = (models) => {
   // usuário que cadastrou o produto
  Produto.belongsTo(models.Usuario, {
   foreignKey: {
      name: "usuario_id",
      allowNull: true
    },
    as: "usuario",
    onDelete: "SET NULL",
    onUpdate: "CASCADE"
  });
  // ingredientes dos pratos
  Produto.hasMany(models.Ingrediente, {
    foreignKey: "produto_id",
    as: "ingredientes",
     onDelete: "RESTRICT",
    onUpdate: "CASCADE"
  });
  // histórico de estoque
  Produto.hasMany(models.MovimentacaoProduto, {
    foreignKey: "produto_id",
    as: "movimentacoes",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE"
  });
  // bebida depende do produto
  Produto.hasMany(models.Bebida, {
    foreignKey: "produto_id",
    as: "bebidas",
     onDelete: "CASCADE",
    onUpdate: "CASCADE"
  });
  Produto.belongsToMany(models.Prato, {
    through: models.Ingrediente,
    foreignKey: "produto_id",
    otherKey: "prato_id",
    as: "pratos",
  });
};
module.exports = Produto;
