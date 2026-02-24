const express = require('express');
const app = express();
const path = require('path');

// Configurar EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rota exemplo
app.get('/', (req, res) => {
  res.render('login/home'); 
});



app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
