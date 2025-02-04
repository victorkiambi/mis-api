const { PrismaClient } = require('@prisma/client');
const locationController = require('../locationController');

jest.mock('@prisma/client');

describe('Location Controller', () => {
  let mockReq;
  let mockRes;
  let mockPrisma;

  beforeEach(() => {
    mockReq = {
      params: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    mockPrisma = {
      geoCounty: {
        findMany: jest.fn()
      },
      geoSubcounty: {
        findMany: jest.fn()
      },
      geoLocation: {
        findMany: jest.fn()
      },
      geoSublocation: {
        findMany: jest.fn()
      }
    };

    locationController.setPrismaClient(mockPrisma);
  });

  describe('getAllCounties', () => {
    it('should return all counties with subcounties', async () => {
      const mockCounties = [
        {
          id: 1,
          name: 'Nairobi',
          code: 'NAI',
          subcounties: [
            {
              id: 1,
              name: 'Westlands',
              code: 'WST',
              locations: [
                {
                  id: 1,
                  name: 'Parklands',
                  code: 'PKL',
                  sublocations: [
                    {
                      id: 1,
                      name: 'Parklands North',
                      code: 'PKL-N'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ];

      mockPrisma.geoCounty.findMany.mockResolvedValue(mockCounties);

      await locationController.getAllCounties(mockReq, mockRes);

      expect(mockPrisma.geoCounty.findMany).toHaveBeenCalledWith({
        include: {
          subcounties: {
            include: {
              locations: {
                include: {
                  sublocations: true
                }
              }
            }
          }
        }
      });

      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockCounties
      });
    });

    it('should handle database errors', async () => {
      mockPrisma.geoCounty.findMany.mockRejectedValue(new Error('Database error'));

      await locationController.getAllCounties(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: expect.stringContaining('Failed to fetch counties')
      });
    });
  });

  describe('getSubcounties', () => {
    it('should return subcounties for a valid county ID', async () => {
      mockReq.params.countyId = '1';
      const mockSubcounties = [
        {
          id: 1,
          name: 'Westlands',
          code: 'WST',
          locations: []
        }
      ];

      mockPrisma.geoSubcounty.findMany.mockResolvedValue(mockSubcounties);

      await locationController.getSubcounties(mockReq, mockRes);

      expect(mockPrisma.geoSubcounty.findMany).toHaveBeenCalledWith({
        where: { countyId: 1 },
        include: { locations: true }
      });

      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockSubcounties
      });
    });

    it('should handle invalid county ID', async () => {
      mockReq.params.countyId = 'invalid';

      await locationController.getSubcounties(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid county ID'
      });
    });
  });

  describe('getLocations', () => {
    it('should return locations for a valid subcounty ID', async () => {
      mockReq.params.subcountyId = '1';
      const mockLocations = [
        {
          id: 1,
          name: 'Parklands',
          code: 'PKL',
          sublocations: []
        }
      ];

      mockPrisma.geoLocation.findMany.mockResolvedValue(mockLocations);

      await locationController.getLocations(mockReq, mockRes);

      expect(mockPrisma.geoLocation.findMany).toHaveBeenCalledWith({
        where: { subcountyId: 1 },
        include: { sublocations: true }
      });

      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockLocations
      });
    });
  });

  describe('getSublocations', () => {
    it('should return sublocations for a valid location ID', async () => {
      mockReq.params.locationId = '1';
      const mockSublocations = [
        {
          id: 1,
          name: 'Parklands North',
          code: 'PKL-N'
        }
      ];

      mockPrisma.geoSublocation.findMany.mockResolvedValue(mockSublocations);

      await locationController.getSublocations(mockReq, mockRes);

      expect(mockPrisma.geoSublocation.findMany).toHaveBeenCalledWith({
        where: { locationId: 1 }
      });

      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockSublocations
      });
    });
  });
}); 