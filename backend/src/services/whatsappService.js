require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

const client = twilio(accountSid, authToken);

const sendWhatsappMessage = async (to, body) => {
    if (!accountSid || !authToken || !twilioWhatsappNumber) {
        console.error('Variáveis de ambiente do Twilio não configuradas. Verifique TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN e TWILIO_WHATSAPP_NUMBER.');
        throw new Error('Configurações do Twilio ausentes.');
    }
    if (!to.startsWith('whatsapp:+')) {
        // Formata o número para o padrão do Twilio se não estiver já formatado
        to = `whatsapp:+${to.replace(/\D/g, '')}`; //Remove o que n é digito e adiciona whatsapp:+
    }

    try {
        const message = await client.messages.create({
            body: body,
            from: twilioWhatsappNumber, 
            to: to,
        });
        console.log(`Mensagem WhatsApp enviada: ${message.sid}`);
        return message;
    } catch (error) {
        console.error('Erro ao enviar mensagem WhatsApp:', error);
        throw error;
    }
};

module.exports = {
    sendWhatsappMessage
};