// backend/src/services/alertMonitor.js
const axios = require('axios');
const cron = require('node-cron'); // Usando cron para agendamento
const Alert = require('../models/Alert');
const twilio = require('twilio');

// Inicia o Twilio
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;

// Busca o preço atual de um ativo na Binance
const getAssetPrice = async (symbol) => {
    try {
        const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol.toUpperCase()}`); // Garante uppercase
        return parseFloat(response.data.price);
    } catch (error) {
        console.error(`Erro ao buscar preço para ${symbol}:`, error.message);
        return null; // Retorna null em caso de erro
    }
};

// Enviar mensagem no WhatsApp
const sendWhatsAppMessage = async (to, message) => {
    if (!TWILIO_WHATSAPP_NUMBER) {
        console.error('TWILIO_WHATSAPP_NUMBER não configurado no .env. Não é possível enviar mensagem.');
        return;
    }
    try {
        await client.messages.create({
            from: TWILIO_WHATSAPP_NUMBER,
            to: `whatsapp:${to}`,
            body: message,
        });
        console.log(`Mensagem de WhatsApp enviada para ${to}`);
    } catch (error) {
        console.error(`Erro ao enviar mensagem de WhatsApp para ${to}:`, error.message);
        if (error.response && error.response.data) {
            console.error('Detalhes do erro Twilio:', error.response.data);
        }
    }
};

// Função principal de monitoramento de alertas
const monitorAlerts = async () => {
    console.log('Iniciando monitoramento de alertas...');
    try {
        // Busca todos os alertas ATIVOS
        // Aqui usamos 'isActive' conforme o modelo revisado, e não 'status: ACTIVE'
        const activeAlerts = await Alert.findAll({ where: { isActive: true } });

        for (const alert of activeAlerts) {
            // Lógica para DAILY_REPORT
            if (alert.alertType === 'DAILY_REPORT') {
                const now = new Date();
                let shouldSendReport = false;

                if (!alert.lastReportSentAt) {
                    shouldSendReport = true; // Envia se nunca foi enviado
                } else {
                    const lastSent = new Date(alert.lastReportSentAt);
                    const hoursSinceLastReport = (now - lastSent) / (1000 * 60 * 60);

                    if (alert.reportFrequency === 'daily' && hoursSinceLastReport >= 24) {
                        shouldSendReport = true;
                    } else if (alert.reportFrequency === 'weekly' && hoursSinceSinceLastReport >= (7 * 24)) {
                        shouldSendReport = true;
                    }
                }

                if (shouldSendReport) {
                    const currentPrice = await getAssetPrice(alert.assetSymbol);
                    if (currentPrice === null) {
                        console.log(`Não foi possível obter o preço para ${alert.assetSymbol}. Pulando relatório.`);
                        continue; // Pula para o próximo alerta se não conseguir o preço
                    }

                    const reportMessage = `📈 Bitfy Relatório Diário para ${alert.assetSymbol.toUpperCase()}: Preço atual R$ ${currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}.`;

                    try {
                        await sendWhatsAppMessage(alert.whatsappNumber, reportMessage);
                        alert.lastReportSentAt = now; // Atualiza a hora do último envio
                        await alert.save();
                        console.log(`Relatório diário enviado para ${alert.whatsappNumber} para ${alert.assetSymbol}.`);
                    } catch (msgError) {
                        console.error(`Erro ao enviar relatório para ${alert.whatsappNumber}:`, msgError.message);
                        // Não atualiza lastReportSentAt se o envio da mensagem falhar
                    }
                }
            } else {
                // Lógica para alertas ABOVE/BELOW
                // Se o alerta já foi disparado (messageSent=true) e não é relatório, pule.
                if (alert.messageSent) {
                    console.log(`Alerta de preço para ${alert.assetSymbol} já foi disparado e precisa ser reativado.`);
                    continue;
                }

                const currentPrice = await getAssetPrice(alert.assetSymbol);
                if (currentPrice === null) {
                    console.log(`Não foi possível obter o preço para ${alert.assetSymbol}. Pulando alerta de preço.`);
                    continue;
                }

                let shouldTrigger = false;
                let message = '';

                if (alert.alertType === 'ABOVE' && currentPrice >= alert.triggerPrice) {
                    shouldTrigger = true;
                    message = `🚨 Alerta Bitfy: ${alert.assetSymbol.toUpperCase()} atingiu ou ultrapassou R$ ${parseFloat(alert.triggerPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })} (Preço atual: R$ ${currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}).`;
                } else if (alert.alertType === 'BELOW' && currentPrice <= alert.triggerPrice) {
                    shouldTrigger = true;
                    message = `🚨 Alerta Bitfy: ${alert.assetSymbol.toUpperCase()} caiu para ou abaixo de R$ ${parseFloat(alert.triggerPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })} (Preço atual: R$ ${currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}).`;
                }

                if (shouldTrigger) {
                    try {
                        await sendWhatsAppMessage(alert.whatsappNumber, message);
                        alert.messageSent = true; // Marca como enviado
                        // Se você quiser manter 'lastTriggeredAt' no modelo, pode definir aqui
                        // alert.lastTriggeredAt = new Date();
                        await alert.save();
                        console.log(`Alerta de preço para ${alert.assetSymbol} disparado e marcado como enviado.`);
                    } catch (msgError) {
                        console.error(`Erro ao enviar alerta de preço para ${alert.whatsappNumber}:`, msgError.message);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Erro geral no monitoramento de alertas:', error);
    }
    console.log('Monitoramento de alertas concluído.');
};

// Função para iniciar o agendador de tarefas
const startAlertMonitor = () => {
    // Agenda o monitoramento para rodar a cada 1 minuto
    cron.schedule('* * * * *', () => {
        monitorAlerts();
    });
    console.log('Serviço de monitoramento de alertas agendado para rodar a cada minuto.');
};

module.exports = { startAlertMonitor };