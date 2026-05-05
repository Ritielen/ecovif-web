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

module.exports = { sendMail, sendSupportContact };

