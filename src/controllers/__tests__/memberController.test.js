const { PrismaClient } = require('@prisma/client');
const memberController = require('../memberController');

jest.mock('@prisma/client');

describe('Member Controller', () => {
  let mockReq;
  let mockRes;
  let mockPrisma;

  beforeEach(() => {
    mockReq = {
      params: { householdId: '1' },
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    mockPrisma = {
      householdMember: {
        findMany: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn()
      }
    };

    memberController.setPrismaClient(mockPrisma);
  });

  describe('getHouseholdMembers', () => {
    it('should return all members of a household', async () => {
      const mockMembers = [
        {
          id: 1,
          firstName: 'Jane',
          lastName: 'Doe',
          dateOfBirth: new Date('1990-01-01'),
          relationship: 'Spouse'
        }
      ];

      mockPrisma.householdMember.findMany.mockResolvedValue(mockMembers);

      await memberController.getHouseholdMembers(mockReq, mockRes);

      expect(mockPrisma.householdMember.findMany).toHaveBeenCalledWith({
        where: { householdId: 1 },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          relationship: true
        }
      });

      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockMembers
      });
    });

    it('should handle invalid household ID', async () => {
      mockReq.params.householdId = 'invalid';

      await memberController.getHouseholdMembers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid household ID'
      });
    });
  });

  describe('addHouseholdMember', () => {
    it('should add a new member successfully', async () => {
      const newMember = {
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '1990-01-01',
        relationship: 'Son'
      };

      mockReq.body = newMember;
      const expectedCreateInput = {
        data: {
          firstName: newMember.first_name,
          lastName: newMember.last_name,
          dateOfBirth: new Date(newMember.date_of_birth),
          relationship: newMember.relationship,
          householdId: 1
        }
      };

      mockPrisma.householdMember.create.mockResolvedValue({
        id: 1,
        ...expectedCreateInput.data
      });

      await memberController.addHouseholdMember(mockReq, mockRes);

      expect(mockPrisma.householdMember.create).toHaveBeenCalledWith(expectedCreateInput);
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should validate required fields', async () => {
      const invalidMember = {
        first_name: '',
        last_name: 'Doe',
        relationship: 'Son'
        // missing date_of_birth
      };

      mockReq.body = invalidMember;

      await memberController.addHouseholdMember(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: expect.stringContaining('required')
      });
    });

    it('should validate date format', async () => {
      const invalidDate = {
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: 'invalid-date',
        relationship: 'Son'
      };

      mockReq.body = invalidDate;

      await memberController.addHouseholdMember(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: expect.stringContaining('date')
      });
    });
  });
}); 