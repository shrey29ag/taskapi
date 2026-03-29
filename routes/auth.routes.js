const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { registerValidator, loginValidator } = require('../validators/auth.validators');

router.post('/register', registerValidator, validate, authController.register);
router.post('/login', loginValidator, validate, authController.login);

router.get('/me', authenticate, authController.getMe);
router.post('/refresh', authenticate, authController.refreshToken);

module.exports = router;
