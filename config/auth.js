const isGestor = async (req, res, next) => {
    //  Verifica se o usuário logado é gestor
    if (req.user && req.user.funcionario === 'gestor') {
        return next();
    }
    return res.status(403).json({ 
        error: "Acesso negado. Apenas gestores podem realizar esta ação." 
    });
};

//  Middleware para bloquear cadastros indevidos via URL
const bloquearCadastroFuncionario = (req, res, next) => {
    // Se alguém tentar acessar rota de cadastro de funcionário sem estar logado
    if (!req.user) {
        return res.status(401).json({ error: "Não autorizado" });
    }
    
    // Se não for gestor, bloqueia
    if (req.user.funcionario !== 'gestor') {
        return res.status(403).json({ 
            error: "Apenas gestores podem criar funcionários" 
        });
    }
    
    next();
};