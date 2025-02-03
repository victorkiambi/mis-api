const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { verifyToken } = require('../middleware/auth');

// Get all counties
router.get('/counties',verifyToken, locationController.getAllCounties);

// Get subcounties by county
router.get('/counties/:countyId/subcounties', verifyToken, locationController.getSubcounties);

// Get locations by subcounty
router.get('/subcounties/:subcountyId/locations',verifyToken, locationController.getLocations);

// Get sublocations by location
router.get('/locations/:locationId/sublocations', verifyToken, locationController.getSublocations);

module.exports = router; 