
const Alert = require('../models/Alert');
const User = require('../models/User'); 

// Cria um novo alerta
const createAlert = async (req, res) => {
  const { assetSymbol, triggerPrice, alertType, whatsappNumber } = req.body;
  const userId = req.user.id;

  if (!assetSymbol || !triggerPrice || !alertType) {
    return res.status(400).json({ message: 'Campos obrigatórios ausentes para criar alerta.' });
  }

  
  if (!whatsappNumber && !req.user.whatsappNumber) {
    return res.status(400).json({ message: 'Número de WhatsApp é obrigatório para alertas. Adicione ao seu perfil ou no alerta.' });
  }

  try {
    const newAlert = await Alert.create({
      userId,
      assetSymbol: assetSymbol.toUpperCase(), // Garante que o símbolo seja maiúsculo
      triggerPrice,
      alertType,
      whatsappNumber: whatsappNumber || req.user.whatsappNumber, // Usa o do alerta ou do perfil
      status: 'ACTIVE',
    });

    res.status(201).json({
      message: 'Alerta criado com sucesso!',
      alert: newAlert,
    });

  } catch (error) {
    console.error('Erro ao criar alerta:', error);
    res.status(500).json({ message: 'Erro no servidor ao criar alerta.' });
  }
};


// Lista todos os alertas do usuário logado
const getMyAlerts = async (req, res) => {
  const userId = req.user.id;

  try {
    const alerts = await Alert.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      message: 'Alertas recuperados com sucesso!',
      alerts,
    });
  } catch (error) {
    console.error('Erro ao buscar alertas:', error);
    res.status(500).json({ message: 'Erro no servidor ao buscar alertas.' });
  }
};


// Pega um alerta específico
const getAlertById = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const alert = await Alert.findOne({
            where: { id, userId }
        });

        if (!alert) {
            return res.status(404).json({ message: 'Alerta não encontrado.' });
        }

        res.status(200).json({
            message: 'Alerta recuperado com sucesso!',
            alert
        });
    } catch (error) {
        console.error('Erro ao buscar alerta por ID:', error);
        res.status(500).json({ message: 'Erro no servidor ao buscar alerta.' });
    }
};


// Atualiza um alerta existente
const updateAlert = async (req, res) => {
  const { id } = req.params;
  const { assetSymbol, triggerPrice, alertType, status, whatsappNumber } = req.body;
  const userId = req.user.id;

  try {
    const alert = await Alert.findOne({ where: { id, userId } });

    if (!alert) {
      return res.status(404).json({ message: 'Alerta não encontrado ou você não tem permissão para editá-lo.' });
    }

    //atualiza apenas os campos que foram fornecidos no body
    alert.assetSymbol = assetSymbol ? assetSymbol.toUpperCase() : alert.assetSymbol;
    alert.triggerPrice = triggerPrice || alert.triggerPrice;
    alert.alertType = alertType || alert.alertType;
    alert.status = status || alert.status;
    alert.whatsappNumber = whatsappNumber || alert.whatsappNumber;

    await alert.save();

    res.status(200).json({
      message: 'Alerta atualizado com sucesso!',
      alert,
    });

  } catch (error) {
    console.error('Erro ao atualizar alerta:', error);
    res.status(500).json({ message: 'Erro no servidor ao atualizar alerta.' });
  }
};

// Deleta um alerta
const deleteAlert = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const alert = await Alert.findOne({ where: { id, userId } });

    if (!alert) {
      return res.status(404).json({ message: 'Alerta não encontrado ou você não tem permissão para deletá-lo.' });
    }

    await alert.destroy(); // Deleta o alerta

    res.status(200).json({ message: 'Alerta deletado com sucesso!' });

  } catch (error) {
    console.error('Erro ao deletar alerta:', error);
    res.status(500).json({ message: 'Erro no servidor ao deletar alerta.' });
  }
};

module.exports = {
  createAlert,
  getMyAlerts,
  getAlertById,
  updateAlert,
  deleteAlert,
};