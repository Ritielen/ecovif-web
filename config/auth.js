const rotasGarcons = [
    "/comanda",
    "/criarComanda",
    "/editarComanda",
    "/item-Comanda",
    "/excluirComanda"
];

const rotasCozinha = [
    "/pedidoCozinha",
    "/admin/comanda"
];

const rotasCaixa = [
    "/fecharConta",
    "/removerTaxaServico",
    "/removerTaxaCouvert",
    "/finalizarVenda",
    "/imprimir-venda"
];

// Rotas públicas
const rotasPublicas = [
    "/",
    "/cadastro-gestor",
    "/login",
    "/recuperarSenha",
    "/suporte",
    "/token",
    "/validar-token",
    "/atualizarSenha",
    "/enviar-suporte"
];

const verificarPermissao = (req, res, next) => {

    // Remove parâmetros da URL
    // Exemplo:
    // /editarComanda/5 -> /editarComanda
    const rotaAtual = "/" + req.path.split("/")[1];

    // Permitir rotas públicas
    if (rotasPublicas.includes(rotaAtual)) {
        return next();
    }

    // Verifica login
    if (!req.session.usuarioId) {
        return res.redirect("/login");
    }

    // Dados do usuário na sessão
    const funcionario = req.session.usuarioFuncionario;
    const grupo = req.session.usuarioGrupo;

    // Gestor acessa tudo
    if (funcionario === "gestor") {
        return next();
    }

    // Funcionários
    if (funcionario === "funcionario") {

        // Grupo Garçons
        if (
            grupo === "Garçons" &&
            rotasGarcons.includes(rotaAtual)
        ) {
            return next();
        }

        // Grupo Cozinha
        if (
            grupo === "Cozinha" &&
            rotasCozinha.includes(rotaAtual)
        ) {
            return next();
        }

        // Grupo Caixa
        if (
            grupo === "Caixa" &&
            rotasCaixa.includes(rotaAtual)
        ) {
            return next();
        }

    }

    return res.status(403).send("Você não tem acesso a essa área.");
};


module.exports = {
    verificarPermissao
};