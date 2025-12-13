# Web3 Economy Backend API

A robust, production-ready backend API for the Web3 Economy platform built with TypeScript, Express.js, and MongoDB.

## Features

- 🔐 **JWT Authentication** - Secure admin authentication with role-based access
- 📊 **Full CRUD Operations** - Complete API for Events, Creators, Builders, Resources
- 📧 **Email Service** - Nodemailer integration for contact forms and newsletters
- 🖼️ **Image Storage** - Cloudinary integration for image uploads
- 🛡️ **Security** - Helmet, CORS, rate limiting, and input validation
- 📝 **Validation** - Request validation with express-validator
- 🗄️ **MongoDB Atlas** - Cloud database with Mongoose ODM

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.0+
- **Framework**: Express.js 4.18+
- **Database**: MongoDB Atlas with Mongoose
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **Email**: Nodemailer
- **Image Storage**: Cloudinary
- **Validation**: express-validator

## Prerequisites

- Node.js 18 or higher
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (for image uploads)
- SMTP credentials (for email)

## Installation

1. **Clone the repository**
   ```bash
   cd web3Economy-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   MONGODB_URI="mongodb+srv://..."
   JWT_SECRET="your-secret-key"
   SMTP_HOST="smtp.gmail.com"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   CLOUDINARY_CLOUD_NAME="your-cloud"
   CLOUDINARY_API_KEY="your-key"
   CLOUDINARY_API_SECRET="your-secret"
   ```

4. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run seed` | Seed database with sample data |

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/admin/login` | Admin login | No |
| POST | `/api/admin/register` | Register new admin | Yes |
| GET | `/api/admin/me` | Get current admin profile | Yes |
| PUT | `/api/admin/password` | Change password | Yes |

### Events
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/events` | List all events | No |
| GET | `/api/events/:id` | Get event by ID | No |
| POST | `/api/events` | Create event | Yes |
| PUT | `/api/events/:id` | Update event | Yes |
| DELETE | `/api/events/:id` | Delete event | Yes |

### Creators
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/creators` | List all creators | No |
| GET | `/api/creators/:id` | Get creator by ID | No |
| POST | `/api/creators` | Create creator | Yes |
| PUT | `/api/creators/:id` | Update creator | Yes |
| DELETE | `/api/creators/:id` | Delete creator | Yes |

### Builder Projects
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/builders/projects` | List all projects | No |
| GET | `/api/builders/projects/:id` | Get project by ID | No |
| POST | `/api/builders/projects` | Create project | Yes |
| PUT | `/api/builders/projects/:id` | Update project | Yes |
| DELETE | `/api/builders/projects/:id` | Delete project | Yes |

### Resources
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/resources` | List resources (with filters) | No |
| GET | `/api/resources/:slug` | Get resource by slug | No |
| GET | `/api/resources/id/:id` | Get resource by ID | No |
| POST | `/api/resources` | Create resource | Yes |
| PUT | `/api/resources/:id` | Update resource | Yes |
| DELETE | `/api/resources/:id` | Delete resource | Yes |
| POST | `/api/resources/:id/download` | Track download | No |

### Contact
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/contact` | Submit contact form | No |
| GET | `/api/contact` | List submissions | Yes |
| GET | `/api/contact/:id` | Get submission | Yes |
| DELETE | `/api/contact/:id` | Delete submission | Yes |

### Newsletter
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/newsletter/subscribe` | Subscribe | No |
| POST | `/api/newsletter/unsubscribe` | Unsubscribe | No |
| GET | `/api/newsletter/subscribers` | List subscribers | Yes |
| DELETE | `/api/newsletter/subscribers/:id` | Delete subscriber | Yes |

## Query Parameters

### Events
- `status`: Filter by status (upcoming, past, live)
- `type`: Filter by event type
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

### Resources
- `category`: Filter by category
- `type`: Filter by type (Tutorial, Documentation, Tool, Video)
- `level`: Filter by level (Beginner, Intermediate, Advanced)
- `search`: Search in title, description, tags
- `featured`: Filter featured resources
- `page`, `limit`: Pagination

## Authentication

Admin endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

To obtain a token, login via `/api/admin/login`:

```bash
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@web3economy.com", "password": "Admin123!"}'
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": { ... }
  }
}
```

## Rate Limiting

| Endpoint Type | Limit |
|--------------|-------|
| General endpoints | 100 requests/15 min |
| Contact form | 5 requests/hour |
| Newsletter subscribe | 5 requests/hour |
| Login | 10 attempts/15 min |
| Downloads | 30 requests/min |

## Project Structure

```
src/
├── config/          # Database and app configuration
├── controllers/     # Request handlers
├── middleware/      # Auth, error handling, rate limiting
├── models/          # Mongoose schemas
├── routes/          # API route definitions
├── services/        # Email, Cloudinary services
├── types/           # TypeScript interfaces
├── scripts/         # Database seeding
└── server.ts        # Application entry point
```

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Set environment variables for production

3. Start with PM2:
   ```bash
   pm2 start dist/server.js --name web3economy-api
   ```

## License

ISC
