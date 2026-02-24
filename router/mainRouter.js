const express = require("express");
const router = express.Router();
const loginController = require("../controllers/loginController");
const autenticacao = require("../config/autenticacao");
const upload = require("../config/upload");
const mainController = require("../controllers/mainController");

//rotas da pasta login
router.get("/home", mainController.home);
router.get("/login", mainController.login);
router.get("/logout", mainController.logout);
router.get("/cadastro", mainController.cadastro);
router.get("/recuperar-senha", mainController.recuperarSenha);
router.get("/suporte", mainController.suporte);






module.exports = router;