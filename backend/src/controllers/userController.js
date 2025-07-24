const User = require('../models/User');
const Alert = require('../models/Alert'); 


// Obter perfil do usuário autenticado
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Erro ao obter perfil do usuário:', error);
        res.status(500).json({ message: 'Erro no servidor ao obter perfil.' });
    }
};


// Obter todos os usuários
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] } // Exclui a senha da resposta
        });
        res.status(200).json(users);
    } catch (error) {
        console.error('Erro ao buscar todos os usuários:', error);
        res.status(500).json({ message: 'Erro no servidor ao buscar usuários.' });
    }
};

//Obter um usuário por ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] } //Exclui a senha da resposta
        });

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        if (req.user.id !== id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Acesso não autorizado.' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Erro ao buscar usuário por ID:', error);
        res.status(500).json({ message: 'Erro no servidor ao buscar usuário.' });
    }
};

//Atualizar um usuário
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, whatsappNumber, role } = req.body; // Campos que podem ser atualizados

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        if (req.user.id !== id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Acesso não autorizado para atualizar este usuário.' });
        }
        if (req.user.role !== 'admin' && role && role !== user.role) {
            return res.status(403).json({ message: 'Acesso não autorizado para alterar o papel do usuário.' });
        }

        user.username = username || user.username;
        user.email = email || user.email;
        user.whatsappNumber = whatsappNumber !== undefined ? whatsappNumber : user.whatsappNumber; 
        user.role = req.user.role === 'admin' && role ? role : user.role;

        await user.save();
        res.status(200).json({ message: 'Usuário atualizado com sucesso.', user: { id: user.id, username: user.username, email: user.email, whatsappNumber: user.whatsappNumber, role: user.role } });

    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        // Verifica se é um erro de validação do Sequelize (ex: email duplicado)
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Email já cadastrado.' });
        }
        res.status(500).json({ message: 'Erro no servidor ao atualizar usuário.' });
    }
};

// Deletar um usuário
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        
        if (req.user.id === id) {
             return res.status(403).json({ message: 'Você não pode deletar sua própria conta através desta rota.' });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        await user.destroy();

        res.status(200).json({ message: 'Usuário deletado com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({ message: 'Erro no servidor ao deletar usuário.' });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getUserProfile
};