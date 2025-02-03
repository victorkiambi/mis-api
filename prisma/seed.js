const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { encrypt, decrypt } = require('../src/utils/encryption');
const prisma = new PrismaClient();

async function main() {
  try {
    // Clean existing data
    await prisma.householdMember.deleteMany();
    await prisma.household.deleteMany();
    await prisma.geoSublocation.deleteMany();
    await prisma.geoLocation.deleteMany();
    await prisma.geoSubcounty.deleteMany();
    await prisma.geoCounty.deleteMany();
    await prisma.program.deleteMany();
    await prisma.user.deleteMany();

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'System Admin',
        role: 'ADMIN'
      }
    });
    console.log('Created admin user:', admin.email);

    // Create programs
    const programs = await Promise.all([
      prisma.program.create({
        data: {
          name: 'Cash Transfer Program',
          description: 'Monthly cash transfer to vulnerable households'
        }
      }),
      prisma.program.create({
        data: {
          name: 'Food Security Program',
          description: 'Monthly food basket distribution'
        }
      }),
      prisma.program.create({
        data: {
          name: 'Education Support',
          description: 'School fees and supplies support'
        }
      })
    ]);
    console.log('Created programs:', programs.length);

    // Create geographical hierarchy
    const county = await prisma.geoCounty.create({
      data: {
        name: 'Nairobi',
        code: 'NAI',
        subcounties: {
          create: {
            name: 'Westlands',
            code: 'WST',
            locations: {
              create: {
                name: 'Parklands',
                code: 'PKL',
                sublocations: {
                  create: [
                    {
                      name: 'Parklands North',
                      code: 'PKL-N'
                    },
                    {
                      name: 'Parklands South',
                      code: 'PKL-S'
                    }
                  ]
                }
              }
            }
          }
        }
      },
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
    console.log('Created geographical hierarchy');

    // Create sample households with proper error handling
    const sublocation = county.subcounties[0].locations[0].sublocations[0];
    
    console.log('Encrypting phone numbers...');
    const phone1 = encrypt('254712345678');
    const phone2 = encrypt('254723456789');
    console.log('Phone numbers encrypted successfully');

    const households = await Promise.all([
      prisma.household.create({
        data: {
          programId: programs[0].id,
          sublocationId: sublocation.id,
          headFirstName: 'John',
          headLastName: 'Doe',
          headIdNumber: '12345678',
          encryptedPhone: phone1,
          members: {
            create: [
              {
                firstName: 'Jane',
                lastName: 'Doe',
                dateOfBirth: new Date('1990-01-01'),
                relationship: 'Spouse'
              },
              {
                firstName: 'Jimmy',
                lastName: 'Doe',
                dateOfBirth: new Date('2010-05-15'),
                relationship: 'Son'
              }
            ]
          }
        }
      }),
      prisma.household.create({
        data: {
          programId: programs[1].id,
          sublocationId: sublocation.id,
          headFirstName: 'Alice',
          headLastName: 'Smith',
          headIdNumber: '87654321',
          encryptedPhone: phone2,
          members: {
            create: [
              {
                firstName: 'Bob',
                lastName: 'Smith',
                dateOfBirth: new Date('1985-03-20'),
                relationship: 'Spouse'
              }
            ]
          }
        }
      })
    ]);

    console.log('Created households:', households.length);
    
    // Test decryption
    console.log('Testing decryption...');
    const decrypted1 = decrypt(households[0].encryptedPhone);
    const decrypted2 = decrypt(households[1].encryptedPhone);
    console.log('Decryption test successful:', decrypted1, decrypted2);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 