const { PrismaClient } = require('@prisma/client');
let prisma = new PrismaClient();

const locationController = {
  setPrismaClient: (client) => {
    prisma = client;
  },

  // Get all counties
  getAllCounties: async (req, res) => {
    try {
      const counties = await prisma.geoCounty.findMany({
        include: {
          subcounties: true
        }
      });

      res.json({
        status: 'success',
        data: counties
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch counties'
      });
    }
  },

  // Get subcounties by county
  getSubcounties: async (req, res) => {
    try {
      const { countyId } = req.params;
      const id = parseInt(countyId);

      if (isNaN(id)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid county ID'
        });
      }

      const subcounties = await prisma.geoSubcounty.findMany({
        where: {
          countyId: id
        },
        include: {
          locations: true
        }
      });

      res.json({
        status: 'success',
        data: subcounties
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch subcounties'
      });
    }
  },

  // Get locations by subcounty
  getLocations: async (req, res) => {
    try {
      const { subcountyId } = req.params;
      const id = parseInt(subcountyId);

      if (isNaN(id)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid subcounty ID'
        });
      }

      const locations = await prisma.geoLocation.findMany({
        where: {
          subcountyId: id
        },
        include: {
          sublocations: true
        }
      });

      res.json({
        status: 'success',
        data: locations
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch locations'
      });
    }
  },

  // Get sublocations by location
  getSublocations: async (req, res) => {
    try {
      const { locationId } = req.params;
      const id = parseInt(locationId);

      if (isNaN(id)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid location ID'
        });
      }

      const sublocations = await prisma.geoSublocation.findMany({
        where: {
          locationId: id
        }
      });

      res.json({
        status: 'success',
        data: sublocations
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch sublocations'
      });
    }
  }
};

module.exports = locationController; 