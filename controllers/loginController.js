const bcrypt = require("bcrypt");
const db = require("../models");
const passport = require('../config/passport');
const { sendMail, sendSupportContact } = require("../config/mailer");
const {Op} = require("sequelize");

async function renderizarHome(req, res) {
  res.render("login/home");
}
async function renderizarLogin(req, res) {
  res.render("login/login");
}

async function renderizarCadastroGestor(req, res) {
  console.log("Rota de cadastro acessada");
  try {
    res.render("login/cadastro-gestor");
  } catch (erro) {
    console.error("Erro ao renderizar:", erro);
  }
  }

  async function renderizarAreaGestor(req, res) {
  res.render("admin/areaGestor");
}

  async function renderizarRecuperarSenha(req, res) {
    res.render("login/recuperarSenha");
  }

  async function renderizarToken(req, res){
    res.render("login/token");
  }

  async function renderizarAtualizarSenha(req, res){
    res.render("login/atualizarSenha");
  }

  async function renderizarSuporte(req, res) {
    res.render("login/suporte");
  }


 // Ações para O Gestor (Público ou primeiro acesso)
async function criarGestor(req, res) {
  const { nome, sobrenome, telefone, email, senha, admin } = req.body;

  if (!nome || !sobrenome || !telefone || !email || !senha) {
    return res.render("login/cadastro-gestor", { msg: "Todos os campos são obrigatórios" });
  }

  if (senha.length < 6) {
    return res.render("login/cadastro-gestor", { msg: "A senha deve ter no mínimo 6 caracteres!" });
  }

  try {
    const usuarioExistente = await db.Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      
      return res.render("login/cadastro-gestor", { msg: "Este email já está cadastrado" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(senha, salt);

    // Criação do gestor
    await db.Usuario.create({
      nome,
      sobrenome,
      telefone,
      email,
      senha: hash,
      funcionario: 'gestor',             // sempre gestor nesta rota
      admin: admin === "true"     
    });

    res.redirect("/login");
  } catch (error) {
    console.error("Erro ao cadastrar gestor:", error);
    res.render("login/cadastro-gestor", { msg: "Erro interno. Tente novamente." });
  }
}

async function logarUsuario(req, res) {
  const { email, senha } = req.body;

  try {
    const usuario = await db.Usuario.findOne({ where: { email } });

    if (!usuario) {
      return res.render("login/login", { msg: "Email ou senha inválidos!" });
    }

    const senhaCorreta = bcrypt.compareSync(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.render("login/login", { msg: "Email ou senha inválidos!" });
    }

      // -Salvar o usuário na sessão
        req.session.usuarioId = usuario.id;
        req.session.usuarioNome = usuario.nome;
        req.session.usuarioEmail = usuario.email;
        req.session.usuarioFuncionario = usuario.funcionario;
        
        // Salvar explicitamente a sessão
        req.session.save((err) => {
            if (err) {
                console.error("Erro ao salvar sessão:", err);
                return res.render("login/login", { msg: "Erro interno" });
            }
        });
    res.redirect("/area-gestor");
  } catch (error) {
    console.error(error);
    res.render("login/login", { msg: "Erro ao fazer login." });
  }
}

async function solicitarRecuperacao(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.render("login/recuperarSenha", { msg: "Você deve informar um e-mail!" });
  }

  try {
    const usuario = await db.Usuario.findOne({ where: { email } });

    if (!usuario) {
      return res.render("login/recuperarSenha", { msg: "Usuário não cadastrado!" });
    }

    //função para enviar e-mail
    async function enviarEmail(usuario, token) {
  try {
    await sendMail(
      usuario.email,
      "Recuperação de senha",
      `<p>Olá ${usuario.nome},</p>
       <p>Seu token de recuperação é: <strong>${token}</strong></p>`
    );
  } catch (error) {
    console.error("Erro ao enviar o e-mail:", error);
  throw error;
  }
}

//função para gerar token alfanumérico 

function generateToken() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let token = "";
  for (let i = 0; i < 8; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
} 
    //remove tokens antigos deste usuário
    await db.Token.destroy({ where: { usuario_id: usuario.id } });

    const token = generateToken(); 
    await db.Token.create({
      usuario_id: usuario.id,
      token: token,
      data_criacao: new Date()
    });
    await enviarEmail(usuario, token);
    res.redirect("/token"); 
  } catch (error) {
    console.error("Erro:", error);
    res.render("login/recuperarSenha", { msg: "Erro ao processar solicitação." });
  }
}

async function validarToken(req, res) {
  const { token } = req.body;

  try {
    const tokenRegistro = await db.Token.findOne({ where: { token } });

    if (!tokenRegistro) {
      return res.render("login/token", { msg: "Token inválido!" });
    }

    // Verifica expiração (15 minutos)
    const minutosDiff = (new Date() - new Date(tokenRegistro.datacriacao)) / (1000 * 60);
    if (minutosDiff > 15) {
      await db.Token.destroy({ where: { id: tokenRegistro.id } });
      return res.render("login/token", { msg: "Token expirado! Solicite um novo." });
    }

    // token é válido?  usuário vai para a tela de nova senha
    res.render("login/atualizarSenha", { token: token, msg: null });
  } catch (error) {
    console.error("Erro no validarToken:", error);
    res.render("login/token", { msg: "Erro ao validar token." });
  }
}

async function atualizarSenha(req, res) {
  const { token, novaSenha } = req.body;
 
   if (!novaSenha || novaSenha.length < 6) {
    return res.render("login/atualizarSenha", {
      token,
      msg: "A senha deve ter no mínimo 6 caracteres!"
    });
  }
  try {
    const tokenRegistro = await db.Token.findOne({ 
      where: { token },
    });

    if (!tokenRegistro) {
      return res.render("login/token", { msg: "Sessão expirada ou token inválido." });
    }
    // Hash da nova senha
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(novaSenha, salt);

    // Atualiza o usuário associado ao token
    const resultado =await db.Usuario.update(
      { senha: hash }, 
      { where: { id: tokenRegistro.usuario_id } }
    );
    console.log(">>> Linhas afetadas no banco:", resultado[0]);
    // Remove o token para não ser usado novamente
    await db.Token.destroy({ where: { id: tokenRegistro.id } });
    res.redirect("/login");
  } catch (error) {
    console.error(error);
    res.render("login/atualizarSenha", { token, msg: "Erro ao salvar nova senha." });
  }
}

async function enviarSuporte(req, res) {
    const { nome, email, assunto, mensagem } = req.body;
    
    try {
        await sendSupportContact(nome, email, assunto, mensagem);
        res.status(200).send("Mensagem enviada!");
    } catch (err) {
        res.status(500).send("Erro ao processar sua solicitação.");
    }
}
  
module.exports = {

  renderizarHome,
  renderizarCadastroGestor,
  criarGestor,
  renderizarLogin,
  logarUsuario,
  renderizarAreaGestor, 
  renderizarRecuperarSenha,
  solicitarRecuperacao,
  renderizarToken,
  solicitarRecuperacao,
  validarToken,
  renderizarAtualizarSenha,
  atualizarSenha,
  renderizarSuporte,
  enviarSuporte,
};