const { PrismaClient } = require('@prisma/client');
let prisma = new PrismaClient();

const programController = {
  setPrismaClient: (client) => {
    prisma = client;
  },
  // Get all programs
  getAllPrograms: async (req, res) => {
    try {
      const programs = await prisma.program.findMany({
        select: {
          id: true,
          name: true,
          description: true
        }
      });
      
      res.json({
        status: 'success',
        data: programs
      });
    } catch (error) {
      console.error('Error fetching programs:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch programs'
      });
    }
  },

  // Create new program
  createProgram: async (req, res) => {
    try {
      const { name, description } = req.body;

      // Validate required fields
      if (!name?.trim()) {
        return res.status(400).json({
          status: 'error',
          message: 'Program name is required'
        });
      }

      // Validate name length
      if (name.length > 100) {
        return res.status(400).json({
          status: 'error',
          message: 'Program name must be less than 100 characters'
        });
      }

      // Validate description if provided
      if (description && description.length > 500) {
        return res.status(400).json({
          status: 'error',
          message: 'Description must be less than 500 characters'
        });
      }

      const program = await prisma.program.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null
        }
      });

      res.status(201).json({
        status: 'success',
        data: program
      });
    } catch (error) {
      console.error('Error creating program:', error);
      res.status(400).json({
        status: 'error',
        message: 'Failed to create program'
      });
    }
  }
};

module.exports = programController; 