require("dotenv").config(); //serve pra carregar os dados do banco no .env

const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || 3000;
const session = require("express-session");
const sequelize = require('./config/connection');
const db = require('./models');

const mainRouter = require("./router/mainRouters");
const { verificarPermissao } = require("./config/auth");
const carregarNotificacoes = require("./services/notificacoes");
const carregarNotificacoesComandas = require("./services/notificacoesComandas");



app.use(express.json());

//configuração dos arquivos de visão (VIEWS)
app.set("view engine", "ejs");

//configurar para receber dados por metodo post
app.use(express.urlencoded({ extended: false }));

//pasta de arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);
// Middleware de permissão DEPOIS da sessão
app.use(verificarPermissao);

//notificação de estoque navbar
app.use(carregarNotificacoes);

//notificação de pedidos navbar
app.use(carregarNotificacoesComandas);

app.use("/", mainRouter);

app.listen(port, function () {
  console.log("Servidor funcionando na porta: " + port);
});