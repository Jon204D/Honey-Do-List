// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  registerUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  changePassword,
  loginUser,
  forgotPassword,
} = require('../controllers/userController');

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);

// User CRUD routes
router.get('/', getAllUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.put('/:id/password', changePassword);

module.exports = router;