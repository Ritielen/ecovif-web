const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
host: "smtp.resend.com",
    secure: true,
    port: 465,
    auth: {
        user: "resend", 
        pass: process.env.RESEND_API_KEY, 
    },
});

// verifica conexão
transporter.verify((error) => {
    if (error) {
        console.error("Erro na configuração do email:", error);
    } else {
        console.log("Servidor de email pronto!");
    }
});

async function sendMail(toString, subject, html) {
   
    try {
        await transporter.sendMail({
            from: 'Acme <onboarding@resend.dev>',
            to: toString,
            subject,
            html,
        });
        console.log("E-mail enviado via Resend!");
    } catch (error) {
        console.error("Erro ao enviar e-mail:", error);
        throw error;
    }
}

// Função específica para receber contatos do formulário de suporte
async function sendSupportContact(clienteNome, clienteEmail, assunto, mensagem) {
    try {
        await transporter.sendMail({
            from: 'Acme <onboarding@resend.dev>', 
            to: process.env.EMAIL_PESSOAL, 
            replyTo: clienteEmail, 
            subject: `[SUPORTE SITE] ${assunto}`,
            html: `
                <h3>Nova mensagem de suporte</h3>
                <p><strong>Nome:</strong> ${clienteNome}</p>
                <p><strong>Mensagem:</strong> ${mensagem}</p> 
            `,
        });
        console.log("Mensagem de suporte enviada!");
    } catch (error) {
        console.error("Erro ao enviar suporte:", error);
        throw error;
    }
}

// Função para avisar produtos com estoque baixo
async function sendLowStockAlert(produtos) {
    try {

        // Monta lista HTML
        const listaProdutos = produtos.map(produto => `
            <li>
                <strong>${produto.nome}</strong><br>
                Quantidade atual: ${produto.quantidade} ${produto.unidade}<br>
                Quantidade mínima: ${produto.quantidade_minima}
            </li>
        `).join("");

        await transporter.sendMail({
            from: 'Acme <onboarding@resend.dev>',
            to: process.env.EMAIL_PESSOAL,
            subject: '⚠️ Produtos com estoque baixo',
            html: `
                <h2>Alerta de estoque baixo</h2>

                <p>Os seguintes produtos estão abaixo da quantidade mínima:</p>

                <ul>
                    ${listaProdutos}
                </ul>
            `,
        });

        console.log("Alerta de estoque enviado!");
    } catch (error) {
        console.error("Erro ao enviar alerta de estoque:", error);
        throw error;
    }
}


module.exports = { sendMail, sendSupportContact, sendLowStockAlert };

