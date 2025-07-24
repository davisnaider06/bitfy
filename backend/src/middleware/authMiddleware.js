const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

const protect = async (req, res, next) => {
  let token;

  //erifica se o token está no cabeçalho Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      
      token = req.headers.authorization.split(' ')[1];

     
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      
      req.user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });

      
      if (!req.user) {
        return res.status(401).json({ message: 'Não autorizado, token inválido (usuário não encontrado).' });
      }

      next(); 
    } catch (error) {
      console.error('Erro na verificação do token:', error);
      res.status(401).json({ message: 'Não autorizado, token falhou (inválido ou expirado).' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Não autorizado, nenhum token.' });
  }
};


function authorize(allowedRoles = []) {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Acesso negado: você não tem permissão para isso.' });
    }

    next();
  };
}


module.exports = { protect, authorize };