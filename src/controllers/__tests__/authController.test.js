const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authController = require('../authController');

// Mock PrismaClient
jest.mock('@prisma/client');

describe('Auth Controller', () => {
  let mockReq;
  let mockRes;
  let mockPrisma;

  beforeEach(() => {
    // Reset mocks
    mockReq = {
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Setup Prisma mock
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn()
      }
    };

    // Inject mock prisma into controller
    authController.setPrismaClient(mockPrisma);
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      // Create hashed password
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      // Mock user in database
      const mockUser = {
        id: 1,
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'System Admin',
        role: 'ADMIN'
      };

      // Setup request
      mockReq.body = {
        email: 'admin@example.com',
        password: 'admin123'
      };

      // Mock findUnique to return our mock user
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      // Execute login
      await authController.login(mockReq, mockRes);

      // Verify response
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'admin@example.com' }
      });

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            user: expect.objectContaining({
              email: 'admin@example.com',
              role: 'ADMIN'
            }),
            token: expect.any(String)
          })
        })
      );
    });

    it('should reject invalid credentials', async () => {
      mockReq.body = {
        email: 'admin@example.com',
        password: 'wrongpassword'
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);

      await authController.login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid credentials'
      });
    });
  });
});