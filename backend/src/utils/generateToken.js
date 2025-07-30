const jwt = require('jsonwebtoken');

// A chave secreta deve vir das variáveis de ambiente para segurança
// Certifique-se de que process.env.JWT_SECRET esteja definido no seu arquivo .env
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // O token expira em 30 dias
    });
};

module.exports = generateToken;