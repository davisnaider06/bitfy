
const User = require('../models/User');
const { ensureUserWallet } = require('./transactionController');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // modulo node.js para gerar tokens seguros
const { sendWhatsappMessage } = require('../services/whatsappService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

//[POST]/api/auth/register
const registerUser = async (req, res) => {
    const { name, email, password, whatsappNumber } = req.body;


    if (!name || !email || !password || !whatsappNumber) {
        return res.status(400).json({ message: 'Por favor, preencha todos os campos obrigatórios.' });
    }

    try {
        const userExists = await User.findOne({ where: { email } }); 
        if (userExists) {
            return res.status(400).json({ message: 'Email já cadastrado.' });
        }

        const nameExists = await User.findOne({ where: { name } }); 
        if (nameExists) {
            return res.status(400).json({ message: 'Nome de usuário já cadastrado.' });
        }

        const user = await User.create({
            name,
            email,
            password, 
            whatsappNumber
        });

       
        await ensureUserWallet(user.id, null); 

        res.status(201).json({
          id: user.id, 
          name: user.name,
          email: user.email,
          whatsappNumber: user.whatsappNumber,
          token: generateToken(user.id), 
          message: 'Registro bem-sucedido! Bem-vindo.',
          redirect: '/dashboard'
        });

    } catch (error) {
        console.error('Erro no registro de usuário (Sequelize):', error);
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const messages = error.errors.map(err => err.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Erro no servidor durante o registro.', error: error.message });
    }
};

//[POST]/api/auth/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

console.log('Tentativa de login para:', { email, password });

  if (!email || !password) {
    return res.status(400).json({ message: 'Por favor, preencha email e senha.' });
  }

  try {
    
    const user = await User.findOne({ where: { email } });
    console.log('Usuário encontrado:', user ? user.email : 'Nenhum usuário com este email.');
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    
    const isMatch = await user.comparePassword(password);
    
    console.log(`Senha fornecida: '${password}'`);
        console.log(`Senha hash no DB: '${user.password}'`); // CUIDADO: Em produção, NUNCA logue senhas hash! Apenas para depuração.
        console.log('Resultado da comparação de senha (isMatch):', isMatch);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }


    const token = generateToken(user.id);
    res.status(200).json({
      message: 'Login bem-sucedido!',
      user: {
        id: user.id,
        name: user.username,
        email: user.email,
        whatsappNumber: user.whatsappNumber,
      },
      token,
    });

  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ message: 'Erro no servidor ao fazer login.' });
  }
};


const requestPasswordReset = async (req, res) => {
    const { emailOrWhatsapp } = req.body;

    try {
        let user;
        // Tenta encontrar o usuário por email ou número de WhatsApp
        user = await User.findOne({ where: { email: emailOrWhatsapp } });
        if (!user) {
            user = await User.findOne({ where: { whatsappNumber: emailOrWhatsapp } });
        }

        if (!user) {
            // Para segurança, não informamos se o usuário não foi encontrado
            return res.status(200).json({ message: 'Se o usuário for encontrado, um link de redefinição de senha será enviado.' });
        }

        // Gerar um token de redefinição
        const resetToken = crypto.randomBytes(32).toString('hex'); // Token seguro
        // Hash o token para armazenar no DB (para segurança caso o DB seja comprometido)
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Definir expiração do token
        const ONE_HOUR = 60 * 60 * 1000;
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + ONE_HOUR;

        await user.save();

       
        const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        //Enviar o token via WhatsApp
        if (!user.whatsappNumber) {
            // Se o usuário não tiver um número de WhatsApp cadastrado
            console.warn(`Usuário ${user.email} solicitou redefinição, mas não tem número de WhatsApp cadastrado.`);
            return res.status(200).json({ message: 'Se o usuário for encontrado e tiver um número de WhatsApp cadastrado, um link de redefinição de senha será enviado.' });
        }

        const messageBody = `Você solicitou uma redefinição de senha. Por favor, use o seguinte link para redefinir sua senha: ${resetURL}\nEste link expira em 1 hora.`;

        try {
            await sendWhatsappMessage(user.whatsappNumber, messageBody);
            console.log(`Link de redefinição enviado para ${user.whatsappNumber}`);
            res.status(200).json({ message: 'Link de redefinição de senha enviado com sucesso via WhatsApp.' });
        } catch (whatsappError) {
            console.error('Erro ao enviar mensagem de redefinição via WhatsApp:', whatsappError);
            res.status(500).json({ message: 'Erro ao enviar link de redefinição de senha. Tente novamente mais tarde.' });
        }

    } catch (error) {
        console.error('Erro ao solicitar redefinição de senha:', error);
        res.status(500).json({ message: 'Erro no servidor ao solicitar redefinição de senha.' });
    }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    //Hash do token recebido para comparar com o token armazenado no DB
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    try {
        const user = await User.findOne({
            where: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { [require('sequelize').Op.gt]: Date.now() } // Verifica se o token não expirou
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Token inválido ou expirado.' });
        }

        //criptografa a nova senha
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        //limpa os campos de redefinição de senha
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        res.status(200).json({ message: 'Senha redefinida com sucesso!' });

    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        res.status(500).json({ message: 'Erro no servidor ao redefinir senha.' });
    }
};


module.exports = {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword
};