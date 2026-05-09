const express = require("express");
const router = express.Router();
const loginController = require("../controllers/loginController");
const autenticacao = require("../config/autenticacao");
//const upload = require("../config/upload");
const mainController = require("../controllers/mainController");
const produtoController = require("../controllers/produtoController");
const cardapioController = require("../controllers/cardapioController")

//rotas da home e logout
router.get("/", loginController.renderizarHome);

router.get('/logout', (req, res) => {
    // Destrói a sessão no servidor
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Erro ao sair.');
        }
        // Limpa o cookie do navegador
        res.clearCookie('connect.sid'); 
        // Redireciona para a página de login
        res.redirect('/login');
    });
});

//cadastro gestor e login
router.get("/cadastro-gestor", loginController.renderizarCadastroGestor);
router.post("/cadastro-gestor", loginController.criarGestor);

router.get("/login", loginController.renderizarLogin);
router.post("/login", loginController.logarUsuario);

router.get("/area-gestor", loginController.renderizarAreaGestor);

//rotas de recuperação de senha
router.get("/recuperarSenha", loginController.renderizarRecuperarSenha);
router.post("/recuperarSenha", loginController.solicitarRecuperacao);

router.get("/token", loginController.renderizarToken);
router.post("/validar-token", loginController.validarToken);

router.get("/atualizarSenha", loginController.renderizarAtualizarSenha);
router.post("/atualizarSenha", loginController.atualizarSenha);

router.get("/suporte", loginController.renderizarSuporte);
router.post("/enviar-suporte", loginController.enviarSuporte);

//rotas de grupos
router.get("/cadastrarGrupo", mainController.renderizarCadastrarGrupo);
router.post('/criarGrupo', mainController.criarGrupo);
router.get('/listaGrupos', mainController.renderizarListaGrupos);
router.post('/admin/grupos/excluir/:id', mainController.excluirGrupo);

//rotas cadastro de funcionário
router.get('/cadastrarFuncionario', mainController.renderizarCadastrarFuncionario);
router.post('/criar-funcionario', mainController.criarFuncionario);
router.get('/listaFuncionarios', mainController.renderizarListaFuncionarios);
router.get("/admin/funcionario/editar/:id", mainController.renderizarEditarFuncionario);
router.post("/admin/funcionario/editar/:id", mainController.editarFuncionario);
router.post('/admin/funcionarios/excluir/:id', mainController.excluirFuncionario);

//rotas de estoque
router.get("/estoque", produtoController.renderizarEstoque);
router.post("/estoqueCadastrar", produtoController.cadastrarProduto);
router.get("/produtoAdicionar/:id", produtoController.mostrarEstoque);
router.post("/admin/produto/editar/:id",produtoController.editarProduto);
router.post("/admin/produto/excluir/:id", produtoController.excluirProduto);

//rota do cardapio cadastro do prato e preço de venda da bebida
router.get("/cardapio", cardapioController.mostrarCardapio);
router.post("/cadastroCardapio", cardapioController.cadastrarItemCardapio);

router.get("/editarPrato/:id", cardapioController.edicaoPrato);
router.get("/editarBebida/:id", cardapioController.edicaoBebida);

router.post("/salvarEdicaoPrato/:id", cardapioController.atualizarPrato);
router.post("/excluirPrato/:id", cardapioController.excluirPrato);

router.post("/salvarEdicaoBebida/:id", cardapioController.atualizarBebida);
router.post("/excluirBebida/:id", cardapioController.excluirBebida);








module.exports = router;