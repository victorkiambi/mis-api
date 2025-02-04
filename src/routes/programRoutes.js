const express = require('express');
const router = express.Router();
const programController = require('../controllers/programController');
const { verifyToken } = require('../middleware/auth');
const { validateProgram } = require('../middleware/validation');

router.get('/', verifyToken, programController.getAllPrograms);
router.post('/', [verifyToken, validateProgram], programController.createProgram);
router.get('/:programId/members', verifyToken, programController.getProgramMembers); // New route for getting program members

module.exports = router; 