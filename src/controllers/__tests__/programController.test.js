const { PrismaClient } = require('@prisma/client');
const programController = require('../programController');

jest.mock('@prisma/client');

describe('Program Controller', () => {
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
      program: {
        findMany: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn()
      }
    };

    programController.setPrismaClient(mockPrisma);
  });

  describe('getAllPrograms', () => {
    it('should return all programs', async () => {
      const mockPrograms = [
        {
          id: 1,
          name: 'Cash Transfer Program',
          description: 'Monthly cash transfer'
        }
      ];

      mockPrisma.program.findMany.mockResolvedValue(mockPrograms);

      await programController.getAllPrograms(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockPrograms
      });
    });

    it('should handle database errors', async () => {
      mockPrisma.program.findMany.mockRejectedValue(new Error('Database error'));

      await programController.getAllPrograms(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to fetch programs'
      });
    });
  });

  describe('createProgram', () => {
    const validProgram = {
      name: 'Food Security Program',
      description: 'Monthly food basket'
    };

    it('should create a new program successfully', async () => {
      mockReq.body = validProgram;
      mockPrisma.program.create.mockResolvedValue({
        id: 2,
        ...validProgram
      });

      await programController.createProgram(mockReq, mockRes);

      expect(mockPrisma.program.create).toHaveBeenCalledWith({
        data: validProgram
      });

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should validate required name field', async () => {
      mockReq.body = {
        description: 'Missing name'
      };

      await programController.createProgram(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Program name is required'
      });
    });

    it('should validate name length', async () => {
      mockReq.body = {
        name: 'a'.repeat(101),  // Name too long
        description: 'Valid description'
      };

      await programController.createProgram(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Program name must be less than 100 characters'
      });
    });

    it('should validate description length if provided', async () => {
      mockReq.body = {
        name: 'Valid Name',
        description: 'a'.repeat(501)  // Description too long
      };

      await programController.createProgram(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Description must be less than 500 characters'
      });
    });

    it('should handle empty description', async () => {
      const programWithoutDesc = {
        name: 'Valid Program'
      };

      mockReq.body = programWithoutDesc;
      mockPrisma.program.create.mockResolvedValue({
        id: 3,
        ...programWithoutDesc,
        description: null
      });

      await programController.createProgram(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockPrisma.program.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          description: null
        })
      });
    });

    it('should handle database errors', async () => {
      mockReq.body = validProgram;
      mockPrisma.program.create.mockRejectedValue(new Error('Database error'));

      await programController.createProgram(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to create program'
      });
    });
  });

  describe('updateProgram', () => {
    const validUpdate = {
      name: 'Updated Program',
      description: 'Updated description'
    };

    it('should update a program successfully', async () => {
      mockReq.params = { programId: '1' };
      mockReq.body = validUpdate;

      mockPrisma.program.findUnique.mockResolvedValue({ id: 1, ...validUpdate });
      mockPrisma.program.update.mockResolvedValue({
        id: 1,
        ...validUpdate
      });

      await programController.updateProgram(mockReq, mockRes);

      expect(mockPrisma.program.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: validUpdate
      });

      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: expect.objectContaining(validUpdate)
      });
    });

    it('should handle non-existent program', async () => {
      mockReq.params = { programId: '999' };
      mockReq.body = validUpdate;

      mockPrisma.program.findUnique.mockResolvedValue(null);

      await programController.updateProgram(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Program not found'
      });
    });

    it('should validate required fields', async () => {
      mockReq.params = { programId: '1' };
      mockReq.body = {
        name: '',
        description: 'Valid description'
      };

      await programController.updateProgram(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Program name is required'
      });
    });

    it('should handle invalid program ID', async () => {
      mockReq.params = { programId: 'invalid' };
      mockReq.body = validUpdate;

      await programController.updateProgram(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid program ID'
      });
    });
  });
}); 