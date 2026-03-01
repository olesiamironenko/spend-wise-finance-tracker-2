const express = require('express');
const router = express.Router();

const validate = require('../middleware/validate');
const { registerValidator, loginValidator } = require('../validators/authValidators');
const { register, login } = require('../controllers/authController');

// JWT testing
const authMiddleware = require('../middleware/authMiddleware');

// Protected route example (JWT testing)
router.get('/me', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'Authenticated user info', user: req.user });
});

// POST /api/auth/register - User registration
router.post('/register', validate(registerValidator), register);

// POST /api/auth/login - User login
router.post('/login', validate(loginValidator), login);

module.exports = router;