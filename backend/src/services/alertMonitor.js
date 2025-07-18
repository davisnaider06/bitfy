
const axios = require('axios');
const cron = require('node-cron');
const Alert = require('../models/Alert');
const twilio = require('twilio');

// inicia o Twilio
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;

//busca o preço atual de um ativo na Binance
const getAssetPrice = async (symbol) => {
  try {
    const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
    return parseFloat(response.data.price);
  } catch (error) {
    console.error(`Erro ao buscar preço para ${symbol}:`, error.message);
    return null;
  }
};

//enviar mensagem no whatsapp
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
    // Em alguns casos de erro (número inválido, etc.), o erro.response.data contém mais detalhes
    if (error.response && error.response.data) {
      console.error('Detalhes do erro Twilio:', error.response.data);
    }
  }
};

//função principal de monitoramento de alertas
const monitorAlerts = async () => {
  console.log('Iniciando monitoramento de alertas...');
  try {
    // Busca todos os alertas ATIVOS
    const activeAlerts = await Alert.findAll({ where: { status: 'ACTIVE' } });

    for (const alert of activeAlerts) {
      const currentPrice = await getAssetPrice(alert.assetSymbol);

      if (currentPrice === null) {
        console.log(`Pulando alerta para ${alert.assetSymbol} devido a erro na cotação.`);
        continue;
      }

      let shouldTrigger = false;
      let message = '';

      //logica para alertas "ABOVE" e "BELOW"
      if (alert.alertType === 'ABOVE' && currentPrice >= alert.triggerPrice) {
        shouldTrigger = true;
        message = `🚨 Alerta: ${alert.assetSymbol} atingiu ou ultrapassou R$ ${parseFloat(alert.triggerPrice).toFixed(2)} (Preço atual: R$ ${currentPrice.toFixed(2)})`;
      } else if (alert.alertType === 'BELOW' && currentPrice <= alert.triggerPrice) {
        shouldTrigger = true;
        message = `🚨 Alerta: ${alert.assetSymbol} caiu para ou abaixo de R$ ${parseFloat(alert.triggerPrice).toFixed(2)} (Preço atual: R$ ${currentPrice.toFixed(2)})`;
      }

      //lembrar de add logica DAILY_REPORT

      if (shouldTrigger) {
        // Evita disparos múltiplos para o mesmo alerta (a menos que seja um alerta de relatório diário)
        // Para alertas ABOVE/BELOW, definimos como TRIGGERED após o primeiro disparo.
        if (alert.status === 'ACTIVE' && !alert.messageSent) { // Checa se já não foi enviado para este alerta único
            await sendWhatsAppMessage(alert.whatsappNumber, message);

            //marca o alerta como 'TRIGGERED' e 'messageSent' como true
            alert.status = 'TRIGGERED';
            alert.messageSent = true;
            alert.lastTriggeredAt = new Date(); //marca a hora do disparo
            await alert.save();
            console.log(`Alerta para ${alert.assetSymbol} disparado e atualizado para TRIGGERED.`);
        } else {
            console.log(`Alerta para ${alert.assetSymbol} já foi disparado ou não está ativo para novo disparo.`);
        }
      }
    }
  } catch (error) {
    console.error('Erro geral no monitoramento de alertas:', error);
  }
  console.log('Monitoramento de alertas concluído.');
};

//função para iniciar o agendador de tarefas
const startAlertMonitor = () => {
  // Agenda o monitoramento para rodar a cada 1 minuto (para testes)
  cron.schedule('* * * * *', () => {//tempo real
    monitorAlerts();
  });
  console.log('Serviço de monitoramento de alertas agendado para rodar a cada minuto.');
};

module.exports = { startAlertMonitor };