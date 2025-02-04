const express = require('express');
const router = express.Router();
const programController = require('../controllers/programController');
const { verifyToken } = require('../middleware/auth');
const { validateProgram } = require('../middleware/validation');

router.get('/', verifyToken, programController.getAllPrograms);
router.post('/', [verifyToken, validateProgram], programController.createProgram);
router.get('/:programId/households', verifyToken, programController.getProgramHouseholds); // New route for getting program members
router.put('/:programId', [verifyToken, validateProgram], programController.updateProgram);

module.exports = router; 