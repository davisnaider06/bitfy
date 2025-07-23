const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware'); // Certifique-se de que o middleware auth está correto
const {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser 
} = require('../controllers/userController');

const router = express.Router();

router.get('/', protect, getAllUsers);


router.get('/:id', protect, getUserById);


router.put('/:id', protect, updateUser);


router.delete('/:id', protect, deleteUser);

module.exports = router;