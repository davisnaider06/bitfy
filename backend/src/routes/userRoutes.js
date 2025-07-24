const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware'); // Certifique-se de que o middleware auth está correto
const {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getUserProfile
} = require('../controllers/userController');

const router = express.Router();

router.get('/profile', protect, getUserProfile);


router.get('/', protect, getAllUsers);


router.get('/:id', protect, getUserById);


router.put('/:id', protect, updateUser);


router.delete('/:id', protect, deleteUser);

module.exports = router;