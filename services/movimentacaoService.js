const db = require("../models");
const { converterParaBase } = require("./estoqueService");

async function baixarEstoqueComanda(itens, usuarioId, comandaId) {

  for (const item of itens) {

  console.log(item);

    // =====================================
    // PRATOS
    // =====================================

    if (item.tipo_item === "prato") {

      const ingredientes = await db.Ingrediente.findAll({
        where: {
          prato_id: item.prato_id
        }
      });

      for (const ingrediente of ingredientes) {

        const produto = await db.Produto.findByPk(
          ingrediente.produto_id
        );

        if (!produto) continue;

        // estoque atual convertido
        const estoqueAtual = converterParaBase(
          Number(produto.quantidade),
          produto.unidade
        );

        // ingrediente do prato
        const quantidadeIngrediente =
          Number(ingrediente.quantidade_ingrediente);

        // multiplica pela quantidade pedida
        const quantidadeConsumida =
          quantidadeIngrediente * Number(item.quantidade);

        // converte
        const quantidadeConvertida = converterParaBase(
          quantidadeConsumida,
          ingrediente.unidade_ingrediente
        );

        const novoEstoque =
          estoqueAtual - quantidadeConvertida;

        if (novoEstoque < 0) {
          throw new Error(
            `Estoque insuficiente para ${produto.nome}`
          );
        }

        let estoqueFinal = novoEstoque;

        // volta unidade
        if (produto.unidade_medida === "kg") {
          estoqueFinal = novoEstoque / 1000;
        }

        if (produto.unidade_medida === "l") {
          estoqueFinal = novoEstoque / 1000;
        }

        await produto.update({
          quantidade: estoqueFinal
        });

        // movimentação
        await db.MovimentacaoProduto.create({

          tipo: "saida",

          origem: "comanda",

          produto_id: produto.id,

          usuario_id: usuarioId,

          comanda_id: comandaId,

          nova_quantidade: quantidadeConsumida,

          quantidade_total: estoqueFinal
        });
      }
    }

    // =====================================
    // BEBIDAS
    // =====================================

    if (item.tipo_item === "bebida") {

      const bebida = await db.Bebida.findByPk(
        item.bebida_id
      );

      if (!bebida) continue;

      const produto = await db.Produto.findByPk(
        bebida.produto_id
      );

      if (!produto) continue;

      const estoqueAtual = Number(produto.quantidade);

      const novoEstoque =
        estoqueAtual - Number(item.quantidade);

      if (novoEstoque < 0) {
        throw new Error(
          `Estoque insuficiente para ${produto.nome}`
        );
      }

      await produto.update({
        quantidade: novoEstoque
      });

      await db.MovimentacaoProduto.create({

        tipo: "saida",

        origem: "comanda",

        produto_id: produto.id,

        usuario_id: usuarioId,

        comanda_id: comandaId,

        nova_quantidade: item.quantidade,

        quantidade_total: novoEstoque
      });
    }
  }
}

async function devolverEstoqueComanda(itens, usuarioId) {

  for (const item of itens) {

    const produto = await db.Produto.findByPk(item.item_id);

    if (!produto) continue;

    const estoqueAtual = Number(produto.quantidade);

    const novoEstoque = estoqueAtual + Number(item.quantidade);

    await produto.update({
      quantidade: novoEstoque
    });

    await db.MovimentacaoProduto.create({

      produto_id: produto.id,

      tipo: "entrada",

      origem: "comanda",

      nova_quantidade: item.quantidade,

      quantidade_total: novoEstoque,

      usuario_id: usuarioId
    });
  }
}

module.exports = {
  baixarEstoqueComanda,
  devolverEstoqueComanda
};