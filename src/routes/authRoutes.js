const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateAuth } = require('../middleware/validation');

router.post('/register', validateAuth, authController.register);
router.post('/login', validateAuth, authController.login);

module.exports = router; 