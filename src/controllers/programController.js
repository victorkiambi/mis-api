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
  },
  getProgramHouseholds: async (req, res) => {
    try {
      const { programId } = req.params;

      // Validate program ID
      const id = parseInt(programId);
      if (isNaN(id)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid program ID'
        });
      }

      const members = await prisma.household.findMany({
        where: {
          programId: id
        },
        select: {
          id: true,
          headFirstName: true,
          headLastName: true,
          headIdNumber: true,
        }
      });

      res.json({
        status: 'success',
        data: members
      });
    } catch (error) {
      console.error('Error fetching program members:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch program members'
      });
    }
  },
  // Update program
  updateProgram: async (req, res) => {
    try {
      const { programId } = req.params;
      const { name, description } = req.body;

      // Validate program ID
      const id = parseInt(programId);
      if (isNaN(id)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid program ID'
        });
      }

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

      // Check if program exists
      const existingProgram = await prisma.program.findUnique({
        where: { id }
      });

      if (!existingProgram) {
        return res.status(404).json({
          status: 'error',
          message: 'Program not found'
        });
      }

      // Update program
      const updatedProgram = await prisma.program.update({
        where: { id },
        data: {
          name: name.trim(),
          description: description?.trim() || null
        }
      });

      res.json({
        status: 'success',
        data: updatedProgram
      });
    } catch (error) {
      console.error('Error updating program:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update program'
      });
    }
  }
};

module.exports = programController; 