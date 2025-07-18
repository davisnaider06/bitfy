
const User = require('../models/User');
const jwt = require('jsonwebtoken');


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

//[POST]/api/auth/register
const registerUser = async (req, res) => {
  const { name, email, password, whatsappNumber } = req.body;


  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Por favor, preencha todos os campos obrigatórios.' });
  }

  try {
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ message: 'Usuário com este email já existe.' });
    }


    user = await User.create({
      name,
      email,
      password, 
      whatsappNumber,
    });

   
    const token = generateToken(user.id);
    res.status(201).json({
      message: 'Usuário registrado com sucesso!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        whatsappNumber: user.whatsappNumber,
      },
      token,
    });

  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ message: 'Erro no servidor ao registrar usuário.' });
  }
};

//[POST]/api/auth/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Por favor, preencha email e senha.' });
  }

  try {
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }


    const token = generateToken(user.id);
    res.status(200).json({
      message: 'Login bem-sucedido!',
      user: {
        id: user.id,
        name: user.name,
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

module.exports = {
  registerUser,
  loginUser,
};