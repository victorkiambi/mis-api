const express = require('express');
const router = express.Router();
const householdController = require('../controllers/householdController');
const { verifyToken } = require('../middleware/auth');
const { validateHousehold } = require('../middleware/validation');

router.get('/', verifyToken, householdController.getAllHouseholds);
router.post('/', [verifyToken, validateHousehold], householdController.createHousehold);

module.exports = router; 