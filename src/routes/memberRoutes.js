const express = require('express');
const router = express.Router({ mergeParams: true });
const memberController = require('../controllers/memberController');
const { verifyToken } = require('../middleware/auth');
const { validateMember } = require('../middleware/validation');

router.get('/', verifyToken, memberController.getHouseholdMembers);
router.post('/', [verifyToken, validateMember], memberController.addHouseholdMember);

module.exports = router; 