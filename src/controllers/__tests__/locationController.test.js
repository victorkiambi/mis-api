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
              code: 'WST'
            }
          ]
        }
      ];

      mockPrisma.geoCounty.findMany.mockResolvedValue(mockCounties);

      await locationController.getAllCounties(mockReq, mockRes);

      expect(mockPrisma.geoCounty.findMany).toHaveBeenCalledWith({
        include: {
          subcounties: true
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
        message: 'Failed to fetch counties'
      });
    });
  });

  // Add similar test blocks for other methods...
}); 