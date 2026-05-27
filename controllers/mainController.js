const bcrypt = require("bcrypt");
const db = require("../models");
const passport = require('../config/passport');
const { sendMail, sendSupportContact } = require("../config/mailer");
const {Op} = require("sequelize");


// Função para renderizar tela de CADASTRO de funcionário
async function renderizarCadastrarFuncionario(req, res) {
  const grupos = await db.Grupo.findAll({ order: [['nome_grupo', 'ASC']] });
  res.render("admin/funcionarios", { grupos,
    msg: req.query.msg,
         error: req.query.error
   });
}

//criar funcionario
async function criarFuncionario(req, res) {
  
  const { nome, sobrenome, telefone, email, senha, grupo } = req.body;

  try {
    // VERIFICAÇÃO DE SESSÃO (Quem está criando?)
    if (!req.session || !req.session.usuarioId) {
      return res.redirect("/login?erro=Faça login para continuar");
    }

    // O ID  (quem está logado) vem da sessão
    const criadoPorId = req.session.usuarioId;

    // Validações básicas de preenchimento
    if (!nome || !sobrenome || !telefone || !email || !senha || !grupo) {
      const grupos = await db.Grupo.findAll({ order: [['nome_grupo', 'ASC']] });
      return res.render("admin/funcionarios", { 
        grupos, 
        msg: "Todos os campos são obrigatórios" 
      });
    }

    // Verifica se o e-mail já existe
    const usuarioExistente = await db.Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      const grupos = await db.Grupo.findAll({ order: [['nome_grupo', 'ASC']] });
      return res.render("admin/funcionarios", { 
        grupos, 
        msg: "Este email já está cadastrado" 
      });
    }

    // Busca o grupo selecionado
    const grupoEncontrado = await db.Grupo.findOne({ where: { nome_grupo: grupo } });

    // Criptografa a senha do novo funcionário 
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(senha, salt);

    // CRIAÇÃO DO USUÁRIO
    const novoUsuario = await db.Usuario.create({
      nome,
      sobrenome,
      telefone,
      email,
      senha: hash,
      role: 'funcionario',
      grupo_id: grupoEncontrado ? grupoEncontrado.id : null,
      criado_por: criadoPorId 
    });

    console.log(` Funcionário ${nome} criado com sucesso por ID: ${criadoPorId}`);
    res.redirect("/listaFuncionarios?sucesso=true");

  } catch (error) {
    console.error("Erro ao cadastrar funcionário:", error);
    const grupos = await db.Grupo.findAll({ order: [['nome_grupo', 'ASC']] });
    res.render("admin/funcionarios", { 
      grupos, 
      msg: "Erro interno no servidor." 
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
          model: db.Usuario, // Relacionamento com a própria tabela de usuários
          as: 'criador',     // apelido definido no Model
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
// Função para EXCLUIR funcionário 
async function excluirFuncionario(req, res) {
  const { id } = req.params;
  try {
    await db.Usuario.destroy({ where: { id } });
    res.redirect("/listaFuncionarios?sucesso=Funcionário excluído com sucesso!");
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
      }]
    });
    if (!funcionario) {
      return res.redirect("/listaFuncionarios?erro=Funcionário não encontrado");
    }    
    const grupos = await db.Grupo.findAll({ 
      order: [['nome_grupo', 'ASC']] 
    });    
    res.render("admin/editarFuncionario", { 
      funcionario, 
      grupos,
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
