const bcrypt = require("bcrypt");
const db = require("../models");
const passport = require('../config/passport');
const { sendMail, sendSupportContact } = require("../config/mailer");
const {Op} = require("sequelize");

async function mostrarCardapio(req, res) {
  res.render("admin/cardapio");
}











module.exports = {
    mostrarCardapio
};