const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Obter perfil do usuário
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        // req.user é definido pelo middleware 'protect'
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        if (user) {
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                whatsappNumber: user.whatsappNumber,
            });
        } else {
            res.status(404).json({ message: 'Usuário não encontrado.' });
        }
    } catch (error) {
        console.error('Erro ao obter perfil do usuário:', error);
        res.status(500).json({ message: 'Erro no servidor ao obter perfil do usuário.' });
    }
};

// @desc    Atualizar perfil do usuário
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.whatsappNumber = req.body.whatsappNumber || user.whatsappNumber;

            
            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();

            res.json({
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                whatsappNumber: updatedUser.whatsappNumber,
                message: 'Perfil atualizado com sucesso!'
            });
        } else {
            res.status(404).json({ message: 'Usuário não encontrado.' });
        }
    } catch (error) {
        console.error('Erro ao atualizar perfil do usuário:', error);
        
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Este email já está cadastrado.' });
        }
        res.status(500).json({ message: 'Erro no servidor ao atualizar perfil do usuário.' });
    }
};

module.exports = { getUserProfile, updateUserProfile };