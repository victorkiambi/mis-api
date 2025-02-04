const { PrismaClient } = require('@prisma/client');
const { encrypt, decrypt } = require('../utils/encryption');
let prisma = new PrismaClient();

const householdController = {
  setPrismaClient: (client) => {
    prisma = client;
  },
  // Get all households
  getAllHouseholds: async (req, res) => {
    try {
      const households = await prisma.household.findMany({
        include: {
          program: {
            select: {
              id: true,
              name: true
            }
          },
          sublocation: {
            select: {
              name: true,
              location: {
                select: {
                  name: true,
                  subcounty: {
                    select: {
                      name: true,
                      county: {
                        select: {
                          name: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      // Decrypt phone numbers
      const formattedHouseholds = households.map(household => ({
        id: household.id,
        head_first_name: household.headFirstName,
        head_last_name: household.headLastName,
        head_id_number: household.headIdNumber,
        phone: decrypt(household.encryptedPhone),
        program: household.program,
        location: {
          sublocation: household.sublocation.name,
          location: household.sublocation.location.name,
          subcounty: household.sublocation.location.subcounty.name,
          county: household.sublocation.location.subcounty.county.name
        }
      }));

      res.json({
        status: 'success',
        data: formattedHouseholds
      });
    } catch (error) {
      console.error('Error fetching households:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch households'
      });
    }
  },

  // Create new household
  createHousehold: async (req, res) => {
    try {
      const {
        program_id,
        sublocation_id,
        head_first_name,
        head_last_name,
        head_id_number,
        phone
      } = req.body;

      // Validate required fields
      if (!program_id || !sublocation_id || !head_first_name?.trim() || 
          !head_last_name?.trim() || !head_id_number?.trim() || !phone) {
        return res.status(400).json({
          status: 'error',
          message: 'All fields are required'
        });
      }

      // Validate phone number format (Kenyan format)
      const phoneRegex = /^254[0-9]{9}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid phone number format. Use format: 254XXXXXXXXX'
        });
      }

      // Validate ID number
      if (head_id_number.length < 5 || head_id_number.length > 20) {
        return res.status(400).json({
          status: 'error',
          message: 'ID number must be between 5 and 20 characters'
        });
      }

      const household = await prisma.household.create({
        data: {
          programId: parseInt(program_id),
          sublocationId: parseInt(sublocation_id),
          headFirstName: head_first_name.trim(),
          headLastName: head_last_name.trim(),
          headIdNumber: head_id_number.trim(),
          encryptedPhone: encrypt(phone)
        }
      });

      res.status(201).json({
        status: 'success',
        data: household
      });
    } catch (error) {
      console.error('Error creating household:', error);
      res.status(400).json({
        status: 'error',
        message: 'Failed to create household'
      });
    }
  }
};

module.exports = householdController; 