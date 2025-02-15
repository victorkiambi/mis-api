const { PrismaClient } = require('@prisma/client');
const { encrypt } = require('../../utils/encryption');
const householdController = require('../householdController');

jest.mock('@prisma/client');

describe('Household Controller', () => {
  let mockReq;
  let mockRes;
  let mockPrisma;

  beforeEach(() => {
    mockReq = {
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    mockPrisma = {
      household: {
        findMany: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn()
      }
    };

    householdController.setPrismaClient(mockPrisma);
  });

  describe('getAllHouseholds', () => {
    it('should return all households with decrypted phone numbers', async () => {
      const mockHouseholds = [
        {
          id: 1,
          headFirstName: 'John',
          headLastName: 'Doe',
          encryptedPhone: encrypt('254712345678'),
          program: {
            id: 1,
            name: 'Cash Transfer'
          },
          sublocation: {
            name: 'Parklands North',
            location: {
              name: 'Parklands',
              subcounty: {
                name: 'Westlands',
                county: {
                  name: 'Nairobi'
                }
              }
            }
          }
        }
      ];

      mockPrisma.household.findMany.mockResolvedValue(mockHouseholds);

      await householdController.getAllHouseholds(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: expect.arrayContaining([
          expect.objectContaining({
            phone: '254712345678',
            location: expect.objectContaining({
              county: 'Nairobi'
            })
          })
        ])
      });
    });

    it('should handle database errors', async () => {
      mockPrisma.household.findMany.mockRejectedValue(new Error('Database error'));

      await householdController.getAllHouseholds(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to fetch households'
      });
    });
  });

  describe('createHousehold', () => {
    const validHousehold = {
      program_id: 1,
      sublocation_id: 1,
      head_first_name: 'John',
      head_last_name: 'Doe',
      head_id_number: '12345678',
      phone: '254712345678'
    };

    it('should create a new household successfully', async () => {
      mockReq.body = validHousehold;
      
      mockPrisma.household.create.mockResolvedValue({
        id: 1,
        ...validHousehold,
        encryptedPhone: encrypt(validHousehold.phone)
      });

      await householdController.createHousehold(mockReq, mockRes);

      expect(mockPrisma.household.create).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should validate required fields', async () => {
      mockReq.body = {
        ...validHousehold,
        head_first_name: ''  // Missing required field
      };

      await householdController.createHousehold(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'All fields are required'
      });
    });

    it('should validate phone number format', async () => {
      mockReq.body = {
        ...validHousehold,
        phone: '0712345678'  // Invalid format
      };

      await householdController.createHousehold(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: expect.stringContaining('phone number format')
      });
    });

    it('should validate ID number length', async () => {
      mockReq.body = {
        ...validHousehold,
        head_id_number: '123'  // Too short
      };

      await householdController.createHousehold(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: expect.stringContaining('ID number')
      });
    });

    it('should handle database errors', async () => {
      mockReq.body = validHousehold;
      mockPrisma.household.create.mockRejectedValue(new Error('Database error'));

      await householdController.createHousehold(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to create household'
      });
    });
  });

  describe('updateHousehold', () => {
    const validUpdate = {
      program_id: 1,
      sublocation_id: 1,
      head_first_name: 'John',
      head_last_name: 'Doe',
      head_id_number: '12345678',
      phone: '254712345678'
    };

    it('should update a household successfully', async () => {
      mockReq.params = { householdId: '1' };
      mockReq.body = validUpdate;

      const existingHousehold = {
        id: 1,
        headIdNumber: '12345678',
        encryptedPhone: encrypt('254712345678')
      };

      mockPrisma.household.findUnique
        .mockResolvedValueOnce(existingHousehold) // First call for existence check
        .mockResolvedValueOnce(null); // Second call for ID number check

      const updatedHousehold = {
        ...existingHousehold,
        ...validUpdate,
        encryptedPhone: encrypt(validUpdate.phone)
      };

      mockPrisma.household.update.mockResolvedValue(updatedHousehold);

      await householdController.updateHousehold(mockReq, mockRes);

      expect(mockPrisma.household.update).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: expect.objectContaining({
          phone: validUpdate.phone
        })
      });
    });

    it('should handle non-existent household', async () => {
      mockReq.params = { householdId: '999' };
      mockReq.body = validUpdate;

      mockPrisma.household.findUnique.mockResolvedValue(null);

      await householdController.updateHousehold(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Household not found'
      });
    });

    it('should validate phone number format', async () => {
      mockReq.params = { householdId: '1' };
      mockReq.body = {
        ...validUpdate,
        phone: '0712345678' // Invalid format
      };

      await householdController.updateHousehold(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: expect.stringContaining('phone number format')
      });
    });

    it('should prevent duplicate ID numbers', async () => {
      mockReq.params = { householdId: '1' };
      mockReq.body = {
        ...validUpdate,
        head_id_number: '87654321' // Different from existing
      };

      mockPrisma.household.findUnique
        .mockResolvedValueOnce({ id: 1, headIdNumber: '12345678' }) // First call returns existing household
        .mockResolvedValueOnce({ id: 2 }); // Second call finds duplicate ID

      await householdController.updateHousehold(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: expect.stringContaining('ID number is already registered')
      });
    });
  });
}); 