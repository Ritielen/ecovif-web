const db = require("../models");
const passport = require('../config/passport');
const { sendMail, sendSupportContact } = require("../config/mailer");
const {Op} = require("sequelize");

async function telaEvento(req, res) {
    try{
        const eventos = await db.Evento.findAll({ order: [['id', 'DESC']]});
        res.render("admin/eventos", {eventos,
            msg: req.query.msg,
         error: req.query.error 
        });
    }catch(error) {
        console.error("Erro ao buscar eventos:", error);
        res.render("admin/eventos", {eventos: []});
    }
}

async function cadastrarEvento(req, res) {
    const {descricao, data, horario, valor_couvert} = req.body;

    if(!descricao || !data || !horario || !valor_couvert) {
        return res.redirect("/eventos?msg=Todos os campos são obrigatórios");
    }
      const valor = valor_couvert ? parseFloat(valor_couvert.replace(",", ".")) : null;
      
    try {
        // VERIFICAÇÃO DE SESSÃO
        if (!req.session || !req.session.usuarioId) {
          return res.redirect("/login?error=Faça login para continuar");
        }
        const usuarioId = req.session.usuarioId;
        const usuarioRegistrado = await db.Usuario.findByPk(usuarioId);
        if (!usuarioRegistrado) {
          return res.redirect("/login?error=Usuário não encontrado");
        }
    
        // Criação do produto
        await db.Evento.create({
            descricao,
            data,
            horario,
            valor_couvert: valor,
            usuario_id: usuarioId
        });
        res.redirect("/eventos?msg=Evento cadastrado com sucesso");
    } catch (error) {
        console.error("Erro ao cadastrar evento:", error);
        res.redirect("/eventos?error=Erro ao cadastrar evento");
    }
}

// Função para excluir evento
async function excluirEvento(req, res) {
  const { id } = req.params;
  try {
    await db.Evento.destroy({ where: { id } });
    return res.redirect("/eventos?msg=Evento excluído com sucesso!");
  } catch (error) {
    console.error(error);
    return res.redirect("/eventos?error=Erro ao excluir evento");
  }
}

// Função de inativar valor do Couvert
async function inativarCouvert(req, res) {
    try{
        const { id } = req.params;
        await db.Evento.update(
            { status_couvert : "inativo" },
            { where: { id } }
        );
        return res.redirect("/eventos?msg=Evento inativado com sucesso!");
    } catch(error){
        console.error(error);
        return res.status(500).send("Erro ao inativar evento");
    }
}

// Função de ativar valor do Couvert
async function ativarCouvert(req, res) {
    try{
        const { id } = req.params;
        await db.Evento.update(
            { status_couvert: "ativo" },
            { where : { id }}
        );
        return res.redirect("/eventos?msg=Evento ativado com sucesso!");
    } catch(error){
        console.error(error);
        return res.status(500).send("Erro ao ativar evento.");
    }
}


// Função para cancelar evento
async function cancelarEvento(req, res) {
    try{
        const { id } = req.params;
        await db.Evento.update(
            { status_evento : "cancelado" },
            { where: { id } }
        );
        return res.redirect("/eventos?msg=Evento cancelado com sucesso!");
    } catch(error){
        console.error(error);
        return res.status(500).send("Erro ao cancelar evento");
    }
}

// Função para ativar evento
async function ativarEvento(req, res) {
    try{
        const { id } = req.params;
        await db.Evento.update(
            { status_evento: "ativo" },
            { where : { id }}
        );
        return res.redirect("/eventos?msg=Evento ativado com sucesso!");
    } catch(error){
        console.error(error);
        return res.status(500).send("Erro ao ativar evento.");
    }
}


async function telaEdicaoEvento(req, res) {
    try{
        const eventos = await db.Evento.findAll({ order: [['id', 'DESC']]});
        res.render("admin/editarEvento", {eventos,
            msg: req.query.msg,
         error: req.query.error 
        });
    }catch(error) {
        console.error("Erro ao buscar eventos:", error);
        res.render("admin/editarEvento", {eventos: []});
    }
}

// Função para atualizar evento

async function atualizarEvento(req, res) {
  try {
    const { id } = req.params;
    const { descricao, data, horario, valor_couvert } = req.body;

    // Verifica sessão
    if (!req.session || !req.session.usuarioId) {
      return res.redirect("/login?msg=Faça login para continuar");
    }

    const usuarioId = req.session.usuarioId;

    // Verifica usuário
    const usuario = await db.Usuario.findByPk(usuarioId);

    if (!usuario) {
      return res.redirect("/login?msg=Usuário não encontrado");
    }

    // Busca evento
    const evento = await db.Evento.findByPk(id);

    if (!evento) {
      return res.redirect("/editarEvento?error=Evento não encontrado");
    }

    // Objeto com campos atualizados
    const dadosAtualizados = {};

    // Atualiza somente campos preenchidos

    if (descricao && descricao.trim() !== "") {
      dadosAtualizados.descricao = descricao;
    }

    if (data && data.trim() !== "") {
      dadosAtualizados.data = data;
    }

    if (horario && horario.trim() !== "") {
      dadosAtualizados.horario = horario;
    }

    if (valor_couvert && valor_couvert.trim() !== "") {

      dadosAtualizados.valor_couvert = parseFloat(
        valor_couvert.replace(",", ".")
      );

    }

    // Atualiza usuário responsável
    dadosAtualizados.usuario_id = usuarioId;

    // Executa update
    await db.Evento.update(
      dadosAtualizados,
      { where: { id } }
    );

    return res.redirect("/editarEvento?msg=Evento atualizado com sucesso");
  } catch (error) {
    console.error("Erro ao atualizar evento:", error);
    return res.redirect("/editarEvento?error=Erro ao atualizar evento");
  }
}

// Buscar produto por nome ou categoria
function buscarEventos(lista, termo) {
  const termoNormalizado = termo.toLowerCase();
  return lista.filter(evento =>
    evento.descricao.toLowerCase().includes(termoNormalizado) ||
    evento.status_evento.toLowerCase().includes(termoNormalizado)
  );
}

module.exports = {
    telaEvento,
    cadastrarEvento,
    excluirEvento,
    inativarCouvert,
    ativarCouvert,
    cancelarEvento,
    ativarEvento,
    telaEdicaoEvento,
    atualizarEvento
};

    


