const { PrismaClient } = require('@prisma/client');
let prisma = new PrismaClient();

const memberController = {
  setPrismaClient: (client) => {
    prisma = client;
  },
  // Get all members of a household
  getHouseholdMembers: async (req, res) => {
    try {
      const { householdId } = req.params;
      
      // Validate household ID
      const id = parseInt(householdId);
      if (isNaN(id)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid household ID'
        });
      }

      const members = await prisma.householdMember.findMany({
        where: {
          householdId: id
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          relationship: true
        }
      });

      res.json({
        status: 'success',
        data: members
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch household members'
      });
    }
  },

  // Add new member to household
  addHouseholdMember: async (req, res) => {
    try {
      const { householdId } = req.params;
      const { first_name, last_name, date_of_birth, relationship } = req.body;

      // Validate household ID
      const id = parseInt(householdId);
      if (isNaN(id)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid household ID'
        });
      }

      // Validate required fields
      if (!first_name?.trim() || !last_name?.trim() || !date_of_birth || !relationship?.trim()) {
        return res.status(400).json({
          status: 'error',
          message: 'All fields are required'
        });
      }

      // Validate date format
      const dateObj = new Date(date_of_birth);
      if (isNaN(dateObj.getTime())) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid date format'
        });
      }

      const member = await prisma.householdMember.create({
        data: {
          householdId: id,
          firstName: first_name.trim(),
          lastName: last_name.trim(),
          dateOfBirth: dateObj,
          relationship: relationship.trim()
        }
      });

      res.status(201).json({
        status: 'success',
        data: member
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: 'Failed to add household member'
      });
    }
  }
};

module.exports = memberController; 