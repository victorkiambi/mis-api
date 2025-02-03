const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all counties
router.get('/counties', locationController.getAllCounties);

// Get subcounties by county
router.get('/counties/:countyId/subcounties', locationController.getSubcounties);

// Get locations by subcounty
router.get('/subcounties/:subcountyId/locations', locationController.getLocations);

// Get sublocations by location
router.get('/locations/:locationId/sublocations', locationController.getSublocations);

module.exports = router; 