const mainController = {
    home: (req, res) => {
        res.render('login/home'); // Caminho dentro da pasta views
    },
    login: (req, res) => {
        res.render('login/login');
    },
    logout: (req, res) => {
        // Lógica de logout e redirecionamento
        res.redirect('/login');
    },
    cadastro: (req, res) => {
        res.render('login/cadastro');
    },
    recuperarSenha: (req, res) => {
        res.render('login/recuperar-senha');
    },
    suporte: (req, res) => {
        res.render('login/suporte');
    }
};

module.exports = mainController;