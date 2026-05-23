const db = require("../models");
const passport = require('../config/passport');
const { sendMail, sendSupportContact } = require("../config/mailer");
const {Op} = require("sequelize");

//exibição da tela
async function mostrarCardapio(req, res) {
  
  try {
    
    const pratos = await db.Prato.findAll({
  include: [
    {
      model: db.Ingrediente,
      as: 'ingredientes',
      include: [
        {
          model: db.Produto,
          as: 'produto'
        }
      ]
    }
  ]
});
const bebidas = await db.Bebida.findAll({
  include: [
    {
      model: db.Produto,
      as: 'produto'
    }
  ]
});

    const produtos = await db.Produto.findAll({
      order: [['nome', 'ASC']]
    });

    // Renderiza a página do cardápio passando todos os dados em um único objeto
    res.render("admin/cardapio", {
      produtos,
      pratos,
      bebidas,
       msg: req.query.msg,
         error: req.query.error
    }); 
    
  } catch (error) {
    console.error("Erro ao carregar a página de cardápio:", error);
    res.redirect("/admin/area-gestor?error=Erro ao carregar dados do cardápio");
  }
}


async function cadastrarItemCardapio(req, res) {
  try {
    if (!req.session || !req.session.usuarioId) {
      return res.redirect("/login?erro=Faça login para continuar");
    }

    const usuarioId = req.session.usuarioId;
    const { categoria, produto_id, preco_venda, nome, rendimento, custo_prato, quantidade_ingrediente, unidade_ingrediente } = req.body;

    // cada usuário tem um cardápio único
    // cardapio_id = 1 ou buscar pelo usuario_id
    const cardapio = await db.Cardapio.findOne({ where: { usuario_id: usuarioId } });
    if (!cardapio) {
      // Se não existir, cria automaticamente
      const novoCardapio = await db.Cardapio.create({ usuario_id: usuarioId });
      cardapio_id = novoCardapio.id;
    } else {
      cardapio_id = cardapio.id;
    }

    if (categoria === 'prato') {
      const prato = await db.Prato.create({
        nome,
        rendimento,
        custo_prato,
        preco_venda,
        cardapio_id,
        usuario_id: usuarioId
      });
      
   // Se ingredientes vierem como array no req.body
  const {
  produto_id,
  quantidade_ingrediente,
  unidade_ingrediente
} = req.body;

  for (let i = 0; i < produto_id.length; i++) {

  await db.Ingrediente.create({
    produto_id: produto_id[i],

    quantidade_ingrediente: quantidade_ingrediente[i]
      ? parseFloat(
          quantidade_ingrediente[i].toString().replace(',', '.')
        )
      : 0,

    unidade_ingrediente: unidade_ingrediente[i],

    prato_id: prato.id,
    usuario_id: usuarioId
  });

}

    } else if (categoria === 'bebida') {
      const bebida = await db.Bebida.create({
        nome,
        produto_id,
        preco_venda,
        cardapio_id,
        usuario_id: usuarioId
      });
    }

    res.redirect("/cardapio?msg=Item cadastrado com sucesso!");
  } catch (error) {
    console.error("Erro ao salvar item no cardápio:", error);
    res.status(500).send("Erro ao salvar.");
  }
}


// Buscar produto por nome ou categoria
function buscarProdutos(lista, termo) {
  const termoNormalizado = termo.toLowerCase();
  return lista.filter(produto =>
    produto.nome.toLowerCase().includes(termoNormalizado) ||
    produto.categoria.toLowerCase().includes(termoNormalizado)
  );
}

//tela de edição do prato

async function edicaoPrato(req, res) {
  const { id } = req.params;
  

  try {
    const prato = await db.Prato.findByPk(id);
    if (!prato) {
      return res.redirect("/cardapio?erro=Prato não encontrado");
    }

    // Busca ingredientes pelo prato_id 
    const ingredientes = await db.Ingrediente.findAll({
      where: { prato_id: id }, 
      include: [{ model: db.Produto, as: 'produto' }] // traz os dados do produto junto
    });

    const produtos = await db.Produto.findAll({
      attributes: ['id', 'nome', 'unidade', 'tamanho'],
      order: [['nome', 'ASC']]
    });

    res.render("admin/editarCardapio", {
      categoria: { categoria: "prato" },
      prato,
      produtos,
      ingredientes, // array com os ingredientes do prato
       msg: req.query.msg,
         error: req.query.error
    });
  } catch (error) {
    console.error("Erro ao carregar edição de prato:", error);
    res.redirect("/cardapio?erro=Erro ao carregar prato");
  }
}

//edição da bebida
async function edicaoBebida(req, res) {
  const { id } = req.params;
  

  try {
    // Uma única busca
    const bebida = await db.Bebida.findByPk(id, {
      include: [{ model: db.Produto, as: 'produto' }]
    });

    if (!bebida) {
      return res.redirect("/cardapio?erro=Bebida não encontrada");
    }

    const produtos = await db.Produto.findAll({
      attributes: ['id', 'nome', 'unidade', 'tamanho'],
      order: [['nome', 'ASC']]
    });

    res.render("admin/editarCardapio", {
      categoria: { categoria: "bebida" },
      bebida,
      produtos,
      msg: req.query.msg,
      error: req.query.error
    });
  } catch (error) {
    console.error("Erro ao carregar edição de bebida:", error);
    res.redirect("/cardapio?erro=Erro ao carregar bebida");
  }
}
          
   async function atualizarPrato(req, res) {
  const { id } = req.params;
  const {
    nome,
    rendimento,
    custo_prato,
    preco_venda,
    produto_id,
    quantidade_ingrediente,
    unidade_ingrediente
  } = req.body;

  try {
    const prato = await db.Prato.findByPk(id);
    if (!prato) {
      return res.redirect("/cardapio?erro=Prato não encontrado");
    }

    // Atualiza o prato
    await prato.update({
      nome: nome || prato.nome,
      rendimento: rendimento || prato.rendimento,
      custo_prato: custo_prato || prato.custo_prato,
      preco_venda: preco_venda || prato.preco_venda,
    });

    // Normaliza para array (caso venha só 1 ingrediente, não será array)
    const ids       = Array.isArray(produto_id)             ? produto_id             : [produto_id];
    const qtds      = Array.isArray(quantidade_ingrediente) ? quantidade_ingrediente : [quantidade_ingrediente];
    const unidades  = Array.isArray(unidade_ingrediente)    ? unidade_ingrediente    : [unidade_ingrediente];

    // Remove todos os ingredientes antigos e recria
    await db.Ingrediente.destroy({ where: { prato_id: id } });

    const novosIngredientes = ids
      .filter(pid => pid) // ignora linhas vazias
      .map((pid, i) => ({
        produto_id: pid,
        quantidade_ingrediente: qtds[i] || 0,
        unidade_ingrediente: unidades[i] || 'un',
        prato_id: id
      }));

    if (novosIngredientes.length > 0) {
      await db.Ingrediente.bulkCreate(novosIngredientes);
    }

    res.redirect(`/editarPrato/${id}?msg=Prato atualizado com sucesso`);
  } catch (error) {
    console.error("Erro ao atualizar prato:", error);
    res.redirect(`/editarPrato/${id}?error=Erro ao processar`);
  }
}

async function excluirPrato(req, res) {
  const { id } = req.params;

  try {
    const prato = await db.Prato.findByPk(id);
    if (!prato) {
      return res.redirect("/cardapio?erro=Prato não encontrado");
    }

    // Exclui os ingredientes primeiro (chave estrangeira)
    await db.Ingrediente.destroy({ where: { prato_id: id } });

    // Depois exclui o prato
    await prato.destroy();

    res.redirect("/cardapio?sucesso=Prato excluído com sucesso");
  } catch (error) {
    console.error("Erro ao excluir prato:", error);
    res.redirect("/cardapio?erro=Erro ao excluir prato");
  }
}

async function atualizarBebida(req, res) {
  const { id } = req.params;
  const { preco_venda } = req.body;

  try {
    const bebida = await db.Bebida.findByPk(id);
    if (!bebida) {
      return res.redirect("/cardapio?erro=Bebida não encontrada");
    }

    await bebida.update({
      preco_venda: preco_venda || bebida.preco_venda, 
    });

    res.redirect(`/editarBebida/${id}?sucesso=Bebida atualizada com sucesso`);
  } catch (error) {
    console.error("Erro ao atualizar bebida:", error);
    res.redirect(`/editarBebida/${id}?erro=Erro ao processar`);
  }
}

async function excluirBebida(req, res) {
  const { id } = req.params;

  try {
    const bebida = await db.Bebida.findByPk(id);
    if (!bebida) {
      return res.redirect("/cardapio?erro=Bebida não encontrada");
    }

    await bebida.destroy();

    res.redirect("/cardapio?sucesso=Bebida excluída com sucesso");
  } catch (error) {
    console.error("Erro ao excluir bebida:", error);
    res.redirect("/cardapio?erro=Erro ao excluir bebida");
  }
}

module.exports = {
    mostrarCardapio,
    cadastrarItemCardapio,
    edicaoPrato,
    edicaoBebida,
    atualizarPrato,
    excluirPrato,
    atualizarBebida,
    excluirBebida
};