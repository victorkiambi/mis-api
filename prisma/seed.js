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

    // Create users
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const users = await Promise.all([
      prisma.user.create({
        data: {
          email: 'admin@example.com',
          password: hashedPassword,
          name: 'System Admin',
          role: 'ADMIN'
        }
      }),
      prisma.user.create({
        data: {
          email: 'user1@example.com',
          password: hashedPassword,
          name: 'Field Officer 1',
          role: 'USER'
        }
      }),
      prisma.user.create({
        data: {
          email: 'user2@example.com',
          password: hashedPassword,
          name: 'Field Officer 2',
          role: 'USER'
        }
      }),
      prisma.user.create({
        data: {
          email: 'supervisor@example.com',
          password: hashedPassword,
          name: 'Field Supervisor',
          role: 'SUPERVISOR'
        }
      }),
      prisma.user.create({
        data: {
          email: 'manager@example.com',
          password: hashedPassword,
          name: 'Program Manager',
          role: 'MANAGER'
        }
      })
    ]);
    console.log('Created users:', users.length);

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
      }),
      prisma.program.create({
        data: {
          name: 'Healthcare Access',
          description: 'Medical coverage for vulnerable households'
        }
      }),
      prisma.program.create({
        data: {
          name: 'Youth Employment',
          description: 'Skills training and job placement for youth'
        }
      })
    ]);
    console.log('Created programs:', programs.length);

    // Create geographical hierarchy
    const counties = await Promise.all([
      prisma.geoCounty.create({
        data: {
          name: 'Nairobi',
          code: 'NAI',
          subcounties: {
            create: [
              {
                name: 'Westlands',
                code: 'WST',
                locations: {
                  create: [
                    {
                      name: 'Parklands',
                      code: 'PKL',
                      sublocations: {
                        create: [
                          { name: 'Parklands North', code: 'PKL-N' },
                          { name: 'Parklands South', code: 'PKL-S' }
                        ]
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      }),
      prisma.geoCounty.create({
        data: {
          name: 'Mombasa',
          code: 'MSA',
          subcounties: {
            create: [
              {
                name: 'Nyali',
                code: 'NYL',
                locations: {
                  create: [
                    {
                      name: 'Kongowea',
                      code: 'KNG',
                      sublocations: {
                        create: [
                          { name: 'Kongowea North', code: 'KNG-N' },
                          { name: 'Kongowea South', code: 'KNG-S' }
                        ]
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      }),
      prisma.geoCounty.create({
        data: {
          name: 'Kisumu',
          code: 'KSM',
          subcounties: {
            create: [
              {
                name: 'Kisumu Central',
                code: 'KSM-C',
                locations: {
                  create: [
                    {
                      name: 'Milimani',
                      code: 'MLM',
                      sublocations: {
                        create: [
                          { name: 'Milimani Upper', code: 'MLM-U' },
                          { name: 'Milimani Lower', code: 'MLM-L' }
                        ]
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      }),
      prisma.geoCounty.create({
        data: {
          name: 'Nakuru',
          code: 'NKR',
          subcounties: {
            create: [
              {
                name: 'Nakuru Town East',
                code: 'NKR-E',
                locations: {
                  create: [
                    {
                      name: 'Bondeni',
                      code: 'BND',
                      sublocations: {
                        create: [
                          { name: 'Bondeni East', code: 'BND-E' },
                          { name: 'Bondeni West', code: 'BND-W' }
                        ]
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      }),
      prisma.geoCounty.create({
        data: {
          name: 'Uasin Gishu',
          code: 'UAS',
          subcounties: {
            create: [
              {
                name: 'Eldoret East',
                code: 'ELD-E',
                locations: {
                  create: [
                    {
                      name: 'Langas',
                      code: 'LNG',
                      sublocations: {
                        create: [
                          { name: 'Langas Central', code: 'LNG-C' },
                          { name: 'Langas South', code: 'LNG-S' }
                        ]
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      })
    ]);
    console.log('Created geographical hierarchy');

    // Create sample households with encrypted phone numbers
    const households = await Promise.all([
      prisma.household.create({
        data: {
          programId: programs[0].id,
          sublocationId: 1,
          headFirstName: 'John',
          headLastName: 'Doe',
          headIdNumber: '12345678',
          encryptedPhone: encrypt('254712345678')
        }
      }),
      prisma.household.create({
        data: {
          programId: programs[1].id,
          sublocationId: 2,
          headFirstName: 'Jane',
          headLastName: 'Smith',
          headIdNumber: '23456789',
          encryptedPhone: encrypt('254723456789')
        }
      }),
      prisma.household.create({
        data: {
          programId: programs[2].id,
          sublocationId: 3,
          headFirstName: 'Peter',
          headLastName: 'Jones',
          headIdNumber: '34567890',
          encryptedPhone: encrypt('254734567890')
        }
      }),
      prisma.household.create({
        data: {
          programId: programs[3].id,
          sublocationId: 4,
          headFirstName: 'Mary',
          headLastName: 'Johnson',
          headIdNumber: '45678901',
          encryptedPhone: encrypt('254745678901')
        }
      }),
      prisma.household.create({
        data: {
          programId: programs[4].id,
          sublocationId: 5,
          headFirstName: 'James',
          headLastName: 'Williams',
          headIdNumber: '56789012',
          encryptedPhone: encrypt('254756789012')
        }
      })
    ]);
    console.log('Created households:', households.length);

    // Create household members
    const members = await Promise.all([
      prisma.householdMember.create({
        data: {
          householdId: households[0].id,
          firstName: 'Sarah',
          lastName: 'Doe',
          dateOfBirth: new Date('1995-03-15'),
          relationship: 'Spouse'
        }
      }),
      prisma.householdMember.create({
        data: {
          householdId: households[1].id,
          firstName: 'Michael',
          lastName: 'Smith',
          dateOfBirth: new Date('2010-07-22'),
          relationship: 'Son'
        }
      }),
      prisma.householdMember.create({
        data: {
          householdId: households[2].id,
          firstName: 'Emma',
          lastName: 'Jones',
          dateOfBirth: new Date('2012-11-30'),
          relationship: 'Daughter'
        }
      }),
      prisma.householdMember.create({
        data: {
          householdId: households[3].id,
          firstName: 'David',
          lastName: 'Johnson',
          dateOfBirth: new Date('2008-04-18'),
          relationship: 'Son'
        }
      }),
      prisma.householdMember.create({
        data: {
          householdId: households[4].id,
          firstName: 'Lucy',
          lastName: 'Williams',
          dateOfBirth: new Date('2015-09-25'),
          relationship: 'Daughter'
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
    console.error('Error seeding data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 