# Ecovif Web

## 📋 Sobre o Projeto

Plataforma web completa para gerenciamento integrado de restaurantes. O Ecovif Web oferece soluções robustas para otimizar operações de estabelecimentos gastronômicos, desde o controle de cardápio até gestão financeira e relatórios detalhados.

## 🎯 Funcionalidades Principais

- **Gerenciamento de Cardápio** - Cadastro e controle de pratos, bebidas e ingredientes
- **Controle de Comandas** - Gerenciamento de pedidos e comandas em tempo real
- **Gestão de Estoque** - Monitoramento de produtos e movimentações
- **Pedidos de Cozinha** - Interface dedicada para cozinha com pedidos em tempo real
- **Relatórios e Análises** - Relatórios mensais, vendas e gerencial
- **Gerenciamento de Eventos** - Controle de eventos e promoções
- **Sistema de Usuários** - Autenticação segura com controle de permissões
- **Gestão Financeira** - Fechamento de contas e movimentações

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js 5.2** - Framework web
- **Sequelize 6.37** - ORM para banco de dados

### Banco de Dados
- **PostgreSQL** - Suporte principal
- **pg-hstore** - Serialização para PostgreSQL

### Autenticação & Segurança
- **Passport.js** - Autenticação estratégica
- **bcrypt / bcryptjs** - Hash criptográfico de senhas
- **express-session** - Gerenciamento de sessões

### Frontend
- **EJS** - Template engine
- **CSS/JavaScript Vanilla** - Componentes interativos

### Geração de Documentos
- **PDFKit** - Geração de PDF
- **ExcelJS** - Exportação em Excel

### Comunicação
- **Nodemailer** - Envio de emails
- **Resend** - Serviço de email adicional

### Upload & Armazenamento
- **Multer** - Upload de arquivos

### Desenvolvimento
- **Nodemon** - Auto-reload em desenvolvimento
- **sequelize-cli** - Ferramenta de migração

## 📦 Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd ecovif-web
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Configure no arquivo `.env`:
- Credenciais do banco de dados
- Porta da aplicação
- Variáveis de autenticação
- Configurações de email

4. **Execute as migrations**
```bash
npx sequelize-cli db:migrate
```

5. **Inicie a aplicação**
```bash
npm start
```

Para desenvolvimento com auto-reload:
```bash
npm run dev
```

## 📁 Estrutura do Projeto

```
├── config/              # Configurações (banco, autenticação, email)
├── controllers/         # Lógica de negócio
├── migrations/          # Migrações do banco de dados
├── models/              # Modelos Sequelize
├── router/              # Rotas da aplicação
├── services/            # Serviços auxiliares
├── views/               # Templates EJS
├── public/              # Arquivos estáticos (CSS, JS, imagens)
└── index.js             # Arquivo principal
```

## 🗄️ Banco de Dados

O projeto utiliza Sequelize como ORM e suporta tanto MySQL quanto PostgreSQL. O banco contém as seguintes tabelas principais:

- **usuarios** - Usuários do sistema
- **restaurante** - Informações do estabelecimento
- **cardapio** - Cardápio principal
- **pratos** - Pratos cadastrados
- **bebidas** - Bebidas disponíveis
- **ingredientes** - Ingredientes utilizados
- **comandas** - Controle de mesas/comandas
- **itens_comanda** - Itens dentro de cada comanda
- **produtos** - Produtos do estoque
- **movimentacoes_produto** - Histórico de movimentação
- **vendas** - Registro de vendas
- **relatorios_mensais** - Dados mensais consolidados
- **eventos** - Eventos e promoções

## 🔐 Segurança

- Senhas criptografadas com bcrypt
- Autenticação via Passport.js
- Controle de permissões por usuário
- Validação de sessões

## 🚀 Deploy

A aplicação está pronta para deploy em qualquer plataforma que suporte Node.js:
- Heroku
- Vercel
- DigitalOcean
- AWS
- Azure

Configure as variáveis de ambiente adequadamente para cada ambiente.

## 📝 Licença

Este projeto está sob a licença especificada no arquivo LICENSE.

## 👨‍💻 Autor

**Ritielen**

---

**Ecovif Web** - Solução integrada para gestão de restaurantes
