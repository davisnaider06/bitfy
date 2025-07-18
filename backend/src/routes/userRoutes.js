
const express = require('express');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();


router.get('/profile', protect, (req, res) => {
  res.status(200).json({
    message: 'Perfil do usuário acessado com sucesso!',
    user: req.user, // Contém os dados do usuário logado
  });
});

module.exports = router;