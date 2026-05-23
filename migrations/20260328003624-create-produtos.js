'use strict';

module.exports = {
   up: async (queryInterface, Sequelize) => {
   await queryInterface.createTable('produtos', {
    id: { 
           type: Sequelize.INTEGER, 
           autoIncrement: true, 
           primaryKey: true,
       },
       tipo_item: {
          type: Sequelize.ENUM('produto', 'bebida'),
          allowNull: false,
          defaultValue: 'produto'
       },
       nome: {
         type: Sequelize.STRING,
         allowNull: true,
       },
      codigo: {
         type: Sequelize.INTEGER,
         allowNull: true,
       },
        data_validade: {
         type: Sequelize.DATEONLY,
         allowNull: true,
       },
       categoria: {
         type: Sequelize.ENUM('alto_custo', 'medio_custo', 'baixo_custo'),
         allowNull: true,
       },
       tamanho: {
        type: Sequelize.DECIMAL(10, 2),
         allowNull: true,
       },
       unidade: {
         type: Sequelize.ENUM('kg', 'g', 'l', 'ml', 'un'),
         allowNull: true,
       },
       tipo_vinho: {
         type: Sequelize.ENUM('tinto', 'branco', 'rose', 'espumante'),
         allowNull: true,
       },
       quantidade_inicial: {
         type: Sequelize.DECIMAL(10, 2),
         allowNull: true,
       },
       quantidade: {
         type: Sequelize.DECIMAL(10, 2),
         allowNull: true,
       },
       quantidade_minima: {
         type: Sequelize.DECIMAL(10, 2),
         allowNull: true,
       },
       observacoes: {
        type: Sequelize.TEXT,
        allowNull: true,
       },
       status: {
        type: Sequelize.ENUM("ativo", "inativo"),
        allowNull:false,
        defaultValue: "ativo",
      },
       valor_compra: {
         type: Sequelize.DECIMAL(10, 2),
         allowNull: true,
          defaultValue: 0.0,
       },
        
         usuario_id: {
         type: Sequelize.INTEGER,
       allowNull: false,
     },
     created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
     });
  },

  async down (queryInterface, Sequelize) {
   await queryInterface.dropTable('produtos');
  }
};
