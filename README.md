# Social Protection Program MIS

A Management Information System (MIS) API component to track social protection program beneficiaries, their households, and program details across different geographical locations.

## Database Schema

```mermaid
erDiagram
    User {
        int id PK
        string email UK
        string password
        string name
        string role
        datetime createdAt
        datetime updatedAt
    }
    Program {
        int id PK
        string name
        string description
        datetime createdAt
        datetime updatedAt
    }
    GeoCounty {
        int id PK
        string name
        string code UK
    }
    GeoSubcounty {
        int id PK
        int countyId FK
        string name
        string code UK
    }
    GeoLocation {
        int id PK
        int subcountyId FK
        string name
        string code UK
    }
    GeoSublocation {
        int id PK
        int locationId FK
        string name
        string code UK
    }
    Household {
        int id PK
        int programId FK
        int sublocationId FK
        string headFirstName
        string headLastName
        string headIdNumber UK
        string encryptedPhone
        datetime createdAt
        datetime updatedAt
    }
    HouseholdMember {
        int id PK
        int householdId FK
        string firstName
        string lastName
        datetime dateOfBirth
        string relationship
        datetime createdAt
        datetime updatedAt
    }
    GeoCounty ||--o{ GeoSubcounty : "has many"
    GeoSubcounty ||--o{ GeoLocation : "has many"
    GeoLocation ||--o{ GeoSublocation : "has many"
    GeoSublocation ||--o{ Household : "has many"
    Program ||--o{ Household : "has many"
    Household ||--o{ HouseholdMember : "has many"
```

## Tech Stack

- **Database**: PostgreSQL
- **ORM**: Prisma
- **Backend**: Node.js with Express
- **Security**: bcrypt for encryption
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest & Supertest

## Features

- CRUD operations for programs and beneficiaries
- Encrypted storage of sensitive data
- Geographical hierarchy management
- RESTful API endpoints
- Comprehensive API documentation
- Automated tests

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/social-protection-mis.git
cd social-protection-mis
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

Edit .env file with your configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/mis_db"
JWT_SECRET="your-secret-key"
ENCRYPTION_KEY="your-encryption-key"
```

4. Initialize Prisma and run migrations
```bash
npx prisma generate
npx prisma migrate dev
```

5. Seed the database
```bash
npx prisma db seed
```

6. Start the development server
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### API Documentation

Once the server is running, you can access the Swagger documentation at:
`http://localhost:3000/api-docs`

## API Endpoints

### Programs
- `GET /api/v1/programs` - List all programs
- `POST /api/v1/programs` - Create a new program
- `GET /api/v1/programs/:id` - Get program details

### Households
- `GET /api/v1/households` - List all households
- `POST /api/v1/households` - Create a new household
- `GET /api/v1/households/:id` - Get household details
- `PUT /api/v1/households/:id` - Update household details

### Household Members
- `GET /api/v1/households/:id/members` - List household members
- `POST /api/v1/households/:id/members` - Add new household member

## Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details