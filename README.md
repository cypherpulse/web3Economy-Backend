<div align="center">

# 🌐 Web3 Economy Backend

### Empowering the Next Generation of Web3 Builders

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-lightgrey?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**The backend powering Web3 Economy — a community dedicated to onboarding everyone onchain through education, events, and hands-on building.**

[Getting Started](#-quick-start) • [API Docs](#-api-reference) • [Contributing](#-contributing) • [Community](#-community)

</div>

---

## 🎯 About Web3 Economy

**Web3 Economy** is a vibrant Web3 community focused on bringing the next billion users onchain. We believe that blockchain technology should be accessible to everyone, regardless of their technical background.

### Our Mission
- 🎓 **Education First** — Comprehensive learning resources for all skill levels
- 🎪 **Community Events** — Regular workshops, hackathons, and meetups
- 🛠️ **Builder Support** — Showcase and support emerging Web3 projects
- 🌍 **Global Onboarding** — Making Web3 accessible to everyone, everywhere

This repository contains the backend API that powers our platform, managing events, educational resources, creator profiles, builder showcases, and community engagement.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Secure Authentication** | JWT-based admin auth with role-based access control |
| 📅 **Event Management** | Full CRUD for community events, workshops & hackathons |
| 👥 **Creator Profiles** | Showcase community educators and content creators |
| 🏗️ **Builder Projects** | Highlight innovative Web3 projects from our community |
| 📚 **Learning Resources** | Curated educational content for all skill levels |
| 📧 **Email Integration** | Newsletter management and contact form handling |
| 🖼️ **Media Storage** | Cloudinary integration for image uploads |
| 🛡️ **Enterprise Security** | Helmet, CORS, rate limiting & input validation |

---

## 🛠️ Tech Stack

<table>
<tr>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=ts" width="48" height="48" alt="TypeScript" />
<br>TypeScript
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=nodejs" width="48" height="48" alt="Node.js" />
<br>Node.js
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=express" width="48" height="48" alt="Express" />
<br>Express
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=mongodb" width="48" height="48" alt="MongoDB" />
<br>MongoDB
</td>
</tr>
</table>

| Category | Technologies |
|----------|-------------|
| **Runtime** | Node.js 18+ |
| **Language** | TypeScript 5.3+ |
| **Framework** | Express.js 4.18+ |
| **Database** | MongoDB Atlas + Mongoose ODM |
| **Auth** | JWT + bcryptjs |
| **Email** | Nodemailer |
| **Storage** | Cloudinary |
| **Validation** | express-validator + Joi |
| **Logging** | Winston |

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **pnpm** (recommended) or npm ([Install pnpm](https://pnpm.io/installation))
- **MongoDB Atlas** account ([Sign up free](https://www.mongodb.com/atlas))
- **Cloudinary** account ([Sign up free](https://cloudinary.com/))

### Installation

```bash
# Clone the repository
git clone https://github.com/cypherpulse/web3Economy-Backend.git
cd web3Economy-Backend

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
```

### Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://your-connection-string

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Running the Application

```bash
# Development mode (with hot reload)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Seed database with sample data
pnpm seed
```

The API will be available at `http://localhost:3001`

---

## 📁 Project Structure

```
web3Economy-Backend/
├── 📂 src/
│   ├── 📂 config/           # App & database configuration
│   ├── 📂 controllers/      # Request handlers & business logic
│   ├── 📂 middleware/       # Auth, CORS, rate limiting, error handling
│   ├── 📂 models/           # Mongoose schemas & data models
│   ├── 📂 routes/           # API route definitions
│   ├── 📂 services/         # External services (email, Cloudinary)
│   ├── 📂 types/            # TypeScript interfaces & types
│   ├── 📂 scripts/          # Database seeding & utilities
│   └── 📄 server.ts         # Application entry point
├── 📂 docs/                 # Additional documentation
├── 📄 package.json
├── 📄 tsconfig.json
└── 📄 README.md
```

---

## 📖 API Reference

### Base URL
```
Development: http://localhost:3001/api
Production: https://api.web3economy.com/api
```

### Authentication
All admin endpoints require a JWT token:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints Overview

<details>
<summary><b>🔐 Authentication</b></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:----:|
| `POST` | `/admin/login` | Admin login | ❌ |
| `POST` | `/admin/register` | Register new admin | ✅ |
| `GET` | `/admin/me` | Get current profile | ✅ |
| `PUT` | `/admin/password` | Change password | ✅ |

</details>

<details>
<summary><b>📅 Events</b></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:----:|
| `GET` | `/events` | List all events | ❌ |
| `GET` | `/events/:id` | Get event by ID | ❌ |
| `POST` | `/events` | Create event | ✅ |
| `PUT` | `/events/:id` | Update event | ✅ |
| `DELETE` | `/events/:id` | Delete event | ✅ |

**Query Parameters:**
- `status` — Filter by status (`upcoming`, `past`, `live`)
- `type` — Filter by event type
- `page` — Page number (default: 1)
- `limit` — Items per page (default: 20)

</details>

<details>
<summary><b>👥 Creators</b></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:----:|
| `GET` | `/creators` | List all creators | ❌ |
| `GET` | `/creators/:id` | Get creator by ID | ❌ |
| `POST` | `/creators` | Create creator | ✅ |
| `PUT` | `/creators/:id` | Update creator | ✅ |
| `DELETE` | `/creators/:id` | Delete creator | ✅ |

</details>

<details>
<summary><b>🏗️ Builder Projects</b></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:----:|
| `GET` | `/builders/projects` | List all projects | ❌ |
| `GET` | `/builders/projects/:id` | Get project by ID | ❌ |
| `POST` | `/builders/projects` | Create project | ✅ |
| `PUT` | `/builders/projects/:id` | Update project | ✅ |
| `DELETE` | `/builders/projects/:id` | Delete project | ✅ |

</details>

<details>
<summary><b>📚 Resources</b></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:----:|
| `GET` | `/resources` | List resources | ❌ |
| `GET` | `/resources/:slug` | Get by slug | ❌ |
| `GET` | `/resources/id/:id` | Get by ID | ❌ |
| `POST` | `/resources` | Create resource | ✅ |
| `PUT` | `/resources/:id` | Update resource | ✅ |
| `DELETE` | `/resources/:id` | Delete resource | ✅ |
| `POST` | `/resources/:id/download` | Track download | ❌ |

**Query Parameters:**
- `category` — Filter by category
- `type` — Tutorial, Documentation, Tool, Video
- `level` — Beginner, Intermediate, Advanced
- `search` — Search in title, description, tags
- `featured` — Filter featured resources

</details>

<details>
<summary><b>📬 Contact & Newsletter</b></summary>

**Contact:**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:----:|
| `POST` | `/contact` | Submit form | ❌ |
| `GET` | `/contact` | List submissions | ✅ |
| `GET` | `/contact/:id` | Get submission | ✅ |
| `DELETE` | `/contact/:id` | Delete submission | ✅ |

**Newsletter:**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:----:|
| `POST` | `/newsletter/subscribe` | Subscribe | ❌ |
| `POST` | `/newsletter/unsubscribe` | Unsubscribe | ❌ |
| `GET` | `/newsletter/subscribers` | List subscribers | ✅ |
| `DELETE` | `/newsletter/subscribers/:id` | Delete subscriber | ✅ |

</details>

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
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

### Rate Limits

| Endpoint Type | Limit |
|--------------|-------|
| General API | 100 requests / 15 min |
| Contact Form | 5 requests / hour |
| Newsletter | 5 requests / hour |
| Login | 10 attempts / 15 min |
| Downloads | 30 requests / min |

---

## 🤝 Contributing

We love contributions from our community! Web3 Economy is built by builders, for builders.

### How to Contribute

1. **Fork the repository**
   ```bash
   git fork https://github.com/cypherpulse/web3Economy-Backend.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add tests if applicable
   - Update documentation as needed

4. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
   
   We follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` — New feature
   - `fix:` — Bug fix
   - `docs:` — Documentation changes
   - `style:` — Code style changes
   - `refactor:` — Code refactoring
   - `test:` — Adding tests
   - `chore:` — Maintenance tasks

5. **Push and create a Pull Request**
   ```bash
   git push origin feature/amazing-feature
   ```

### Development Guidelines

- ✅ Write clean, readable TypeScript code
- ✅ Follow existing project structure
- ✅ Add JSDoc comments for public functions
- ✅ Handle errors gracefully
- ✅ Use meaningful variable and function names
- ✅ Keep functions small and focused

### First-Time Contributors

Look for issues labeled [`good first issue`](https://github.com/cypherpulse/web3Economy-Backend/labels/good%20first%20issue) — these are great starting points!

---

## 🚢 Deployment

### Production Build

```bash
# Build the application
pnpm build

# The compiled files will be in the dist/ folder
```

### Deploy with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start dist/server.js --name web3economy-api

# Save the process list
pm2 save

# Set up startup script
pm2 startup
```

### Environment Variables for Production

Ensure all environment variables are properly set in your production environment. Never commit `.env` files to version control.

---

## 🗺️ Roadmap

- [ ] GraphQL API support
- [ ] WebSocket for real-time updates
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] OAuth integration (Google, GitHub)
- [ ] Blockchain wallet authentication
- [ ] Event RSVP and ticketing system

---

## 🌍 Community

Join our growing Web3 community!

<div align="center">

[![Twitter](https://img.shields.io/badge/Twitter-@Web3Economy-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/web3economy)
[![Discord](https://img.shields.io/badge/Discord-Join_Us-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/web3economy)
[![Website](https://img.shields.io/badge/Website-web3economy.com-FF6B6B?style=for-the-badge&logo=google-chrome&logoColor=white)](https://web3economy.com)

</div>

---

## 📄 License

This project is licensed under the **ISC License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- All our amazing community contributors
- The Web3 builders who inspire us daily
- Open-source projects that make this possible

---

<div align="center">

**Built with ❤️ by the Web3 Economy Community**

*Onboarding everyone onchain, one builder at a time.*

⭐ Star this repo if you find it helpful!

</div>
