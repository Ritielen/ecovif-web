const bcrypt = require("bcrypt");
const db = require("../models");
const passport = require('../config/passport');
const { sendMail, sendSupportContact } = require("../config/mailer");
const {Op, where} = require("sequelize");


// Função para renderizar tela de CADASTRO de funcionário
async function renderizarCadastrarFuncionario(req, res) {
  const grupos = await db.Grupo.findAll({ order: [['nome_grupo', 'ASC']] });
  const restauranteData = await db.Restaurante.findOne({ order: [['nome', 'ASC']] });
  
  res.render("admin/funcionarios", { 
    grupos, 
    restaurante: restauranteData,
    msg: req.query.msg,
    error: req.query.error
  });
}



// Função para renderizar tela de CADASTRO de funcionário
async function criarFuncionario(req, res) {
  const { nome, sobrenome, telefone, email, senha, grupo, restaurante } = req.body;

  try {
    if (!req.session || !req.session.usuarioId) {
      return res.redirect("/login?erro=Faça login para continuar");
    }

    const criadoPorId = req.session.usuarioId;

    // Validação
    if (!nome || !sobrenome || !telefone || !email || !senha || !grupo || !restaurante) {
      const grupos = await db.Grupo.findAll({ order: [['nome_grupo', 'ASC']] });
      const restauranteData = await db.Restaurante.findOne({ order: [['nome', 'ASC']] });
      return res.render("admin/funcionarios", { 
        grupos, 
        restaurante: restauranteData, 
        msg: "Todos os campos são obrigatórios" 
      });
    }

    // Verifica email
    const usuarioExistente = await db.Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      const grupos = await db.Grupo.findAll({ order: [['nome_grupo', 'ASC']] });
      const restauranteData = await db.Restaurante.findOne({ order: [['nome', 'ASC']] });
      return res.render("admin/funcionarios", { 
        grupos, 
        restaurante: restauranteData, 
        msg: "Este email já está cadastrado" 
      });
    }

    // BUSCA DIRETO POR ID (pois o formulário envia o ID)
    const grupoEncontrado = await db.Grupo.findByPk(grupo);
    if (!grupoEncontrado) {
      const grupos = await db.Grupo.findAll({ order: [['nome_grupo', 'ASC']] });
      const restauranteData = await db.Restaurante.findOne({ order: [['nome', 'ASC']] });
      return res.render("admin/funcionarios", { 
        grupos, 
        restaurante: restauranteData, 
        msg: "Grupo não encontrado" 
      });
    }

    // BUSCA RESTAURANTE POR ID
    const restauranteEncontrado = await db.Restaurante.findByPk(restaurante);
    if (!restauranteEncontrado) {
      const grupos = await db.Grupo.findAll({ order: [['nome_grupo', 'ASC']] });
      const restauranteData = await db.Restaurante.findOne({ order: [['nome', 'ASC']] });
      return res.render("admin/funcionarios", { 
        grupos, 
        restaurante: restauranteData, 
        msg: "Restaurante não encontrado" 
      });
    }

    // Criptografa senha
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(senha, salt);

    // Cria o usuário
    const novoUsuario = await db.Usuario.create({
      nome,
      sobrenome,
      telefone,
      email,
      senha: hash,
      funcionario: 'funcionario',
      grupo_id: grupoEncontrado.id,
      restaurante_id: restauranteEncontrado.id,
      criado_por: criadoPorId
    });

    console.log("Funcionário criado com sucesso! ID:", novoUsuario.id);
    res.redirect("/listaFuncionarios?sucesso=true");

  } catch (error) {
    console.error("Erro ao cadastrar funcionário:", error.message);
    const grupos = await db.Grupo.findAll({ order: [['nome_grupo', 'ASC']] });
    const restauranteData = await db.Restaurante.findOne({ order: [['nome', 'ASC']] });
    res.render("admin/funcionarios", { 
      grupos, 
      restaurante: restauranteData, 
      msg: "Erro interno: " + error.message 
    });
  }
}

// Renderizar lista de funcionários 
async function renderizarListaFuncionarios(req, res) {
  try {
    const funcionarios = await db.Usuario.findAll({
      include: [
        {
          model: db.Grupo,
          as: 'grupo',
        },
         {
          model: db.Restaurante,
          as: 'restaurante',
        },
        {
          model: db.Usuario, 
          as: 'criador',     
        }
      ],
      order: [['id', 'DESC']]
    });

    res.render("admin/listaFuncionarios", { funcionarios });
  } catch (error) {
    console.error("Erro ao buscar funcionários:", error);
    res.render("admin/listaFuncionarios", { 
      funcionarios: [], 
      msg: "Erro ao carregar funcionários" 
    });
  }
}
// Função EXCLUIR funcionário somente gestores que são admin
async function excluirFuncionario(req, res) {
  const { id } = req.params;

  try {
    
    if (!req.session.usuarioAdmin) {
      return res.redirect("/listaFuncionarios?msg=Você não tem permissão para excluir funcionários.");
    }

    await db.Usuario.destroy({
      where: { id }
    });

    res.redirect(
      "/listaFuncionarios?sucesso=Funcionário excluído com sucesso!"
    );

  } catch (error) {
    console.error("Erro ao excluir funcionário:", error);
    res.redirect("/listaFuncionarios?msg=Erro ao excluir funcionário");
  }
}

// Renderizar formulário de edição
async function renderizarEditarFuncionario(req, res) {
  const { id } = req.params;
  try {
    const funcionario = await db.Usuario.findByPk(id, {
      include: [{
        model: db.Grupo,
        as: 'grupo',
        attributes: ['id', 'nome_grupo']
      }],
      include: [{
        model: db.Restaurante,
        as: 'restaurante',
        attributes: ['id', 'nome']
      }]
    });
    if (!funcionario) {
      return res.redirect("/listaFuncionarios?erro=Funcionário não encontrado");
    }    
    const grupos = await db.Grupo.findAll({ order: [['nome_grupo', 'ASC']] });  
    const restaurante = await db.Restaurante.findAll({ order: [['nome', 'ASC']] });  
    res.render("admin/editarFuncionario", { 
      funcionario, 
      grupos,
      restaurante,
      msg: req.query.msg || null
    });
  } catch (error) {
    console.error("Erro ao carregar funcionário:", error);
    res.redirect("/listaFuncionarios?erro=Erro ao carregar dados");
  }
}

// Processar edição do funcionário
async function editarFuncionario(req, res) {
  const { id } = req.params;
  const { nome, sobrenome, telefone, email, grupo_id, nova_senha, confirmar_senha } = req.body; 
  try {
    const funcionario = await db.Usuario.findByPk(id);   
    if (!funcionario) {
      return res.redirect("/listaFuncionarios?erro=Funcionário não encontrado");
    }
    // Verifica se email já existe (se foi alterado)
    if (email !== funcionario.email) {
      const emailExistente = await db.Usuario.findOne({ 
        where: { email, id: { [db.Sequelize.Op.ne]: id } } 
      });
      if (emailExistente) {
        const grupos = await db.Grupo.findAll({ order: [['nome_grupo', 'ASC']] });
        return res.render("admin/editarFuncionario", {
          funcionario,
          grupos,
          msg: "Este email já está cadastrado por outro usuário"
        });
      }
    } 
    // Prepara dados para atualização
    const dadosAtualizados = {
      nome,
      sobrenome,
      telefone,
      email,
      grupo_id: grupo_id || null
    };
    // Se uma nova senha foi fornecida, valida e atualiza
    if (nova_senha) {
      if (nova_senha.length < 6) {
        const grupos = await db.Grupo.findAll({ order: [['nome_grupo', 'ASC']] });
        return res.render("admin/editarFuncionario", {
          funcionario,
          grupos,
          msg: "A senha deve ter no mínimo 6 caracteres"
        });
      } 
      if (nova_senha !== confirmar_senha) {
        const grupos = await db.Grupo.findAll({ order: [['nome_grupo', 'ASC']] });
        return res.render("admin/editarFuncionario", {
          funcionario,
          grupos,
          msg: "As senhas não conferem"
        });
      }
      const salt = bcrypt.genSaltSync(10);
      dadosAtualizados.senha = bcrypt.hashSync(nova_senha, salt);
    }   
    // Atualiza o funcionário
    await funcionario.update(dadosAtualizados);   
    res.redirect("/listaFuncionarios?msg=Funcionário atualizado com sucesso");
  } catch (error) {
    console.error("Erro ao editar funcionário:", error);
    res.redirect("/listaFuncionarios?erro=Erro ao atualizar funcionário");
  }
}
 
module.exports = {
    renderizarCadastrarFuncionario,
    criarFuncionario,
    renderizarListaFuncionarios,
    excluirFuncionario,
    renderizarEditarFuncionario,
    editarFuncionario,  
};
