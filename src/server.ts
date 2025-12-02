import 'dotenv/config';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import { connectDatabase, isDatabaseConnected } from './config';
import {
  corsMiddleware,
  generalLimiter,
  errorHandler,
  notFoundHandler,
} from './middleware';
import {
  adminRoutes,
  eventRoutes,
  creatorRoutes,
  builderRoutes,
  resourceRoutes,
  contactRoutes,
  newsletterRoutes,
  blogRoutes,
  showcaseRoutes,
} from './routes';
import { configureCloudinary } from './services';

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Configure Cloudinary
configureCloudinary();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:', 'http:'],
    },
  },
}));

// CORS
app.use(corsMiddleware);

// Rate limiting
app.use(generalLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: isDatabaseConnected() ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/creators', creatorRoutes);
app.use('/api/builders', builderRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/showcase', showcaseRoutes);

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'Web3 Economy API',
    version: '1.0.0',
    status: 'running',
    documentation: '/api',
    health: '/health',
  });
});

// API documentation endpoint
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    name: 'Web3 Economy API',
    version: '1.0.0',
    endpoints: {
      admin: {
        login: 'POST /api/admin/login',
        register: 'POST /api/admin/register (auth required)',
        me: 'GET /api/admin/me (auth required)',
        changePassword: 'PUT /api/admin/password (auth required)',
      },
      events: {
        list: 'GET /api/events',
        get: 'GET /api/events/:id',
        create: 'POST /api/events (auth required)',
        update: 'PUT /api/events/:id (auth required)',
        delete: 'DELETE /api/events/:id (auth required)',
      },
      creators: {
        list: 'GET /api/creators',
        get: 'GET /api/creators/:id',
        create: 'POST /api/creators (auth required)',
        update: 'PUT /api/creators/:id (auth required)',
        delete: 'DELETE /api/creators/:id (auth required)',
      },
      builders: {
        listProjects: 'GET /api/builders/projects',
        getProject: 'GET /api/builders/projects/:id',
        createProject: 'POST /api/builders/projects (auth required)',
        updateProject: 'PUT /api/builders/projects/:id (auth required)',
        deleteProject: 'DELETE /api/builders/projects/:id (auth required)',
      },
      resources: {
        list: 'GET /api/resources',
        getBySlug: 'GET /api/resources/:slug',
        getById: 'GET /api/resources/id/:id',
        create: 'POST /api/resources (auth required)',
        update: 'PUT /api/resources/:id (auth required)',
        delete: 'DELETE /api/resources/:id (auth required)',
        trackDownload: 'POST /api/resources/:id/download',
      },
      contact: {
        submit: 'POST /api/contact',
        list: 'GET /api/contact (auth required)',
        get: 'GET /api/contact/:id (auth required)',
        delete: 'DELETE /api/contact/:id (auth required)',
      },
      newsletter: {
        subscribe: 'POST /api/newsletter/subscribe',
        unsubscribe: 'POST /api/newsletter/unsubscribe',
        listSubscribers: 'GET /api/newsletter/subscribers (auth required)',
        deleteSubscriber: 'DELETE /api/newsletter/subscribers/:id (auth required)',
      },
      blogs: {
        list: 'GET /api/blogs',
        featured: 'GET /api/blogs/featured',
        categories: 'GET /api/blogs/categories',
        trending: 'GET /api/blogs/trending',
        getBySlug: 'GET /api/blogs/slug/:slug',
        getRelated: 'GET /api/blogs/slug/:slug/related',
        getById: 'GET /api/blogs/:id',
        like: 'POST /api/blogs/:id/like',
        bookmark: 'POST /api/blogs/:id/bookmark',
        adminList: 'GET /api/blogs/admin/all (auth required)',
        create: 'POST /api/blogs (auth required)',
        update: 'PUT /api/blogs/:id (auth required)',
        delete: 'DELETE /api/blogs/:id (auth required)',
      },
      showcase: {
        list: 'GET /api/showcase',
        categories: 'GET /api/showcase/categories',
        stats: 'GET /api/showcase/stats',
        featured: 'GET /api/showcase/featured',
        trending: 'GET /api/showcase/trending',
        getBySlug: 'GET /api/showcase/slug/:slug',
        getById: 'GET /api/showcase/:id',
        star: 'POST /api/showcase/:id/star',
        adminList: 'GET /api/showcase/admin/all (auth required)',
        create: 'POST /api/showcase (auth required)',
        update: 'PUT /api/showcase/:id (auth required)',
        delete: 'DELETE /api/showcase/:id (auth required)',
      },
    },
  });
});

// Error handling
app.use(errorHandler);

// 404 handler (must be last)
app.use('*', notFoundHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`
🚀 Web3 Economy API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Server:      http://localhost:${PORT}
📍 Health:      http://localhost:${PORT}/health
📍 API Docs:    http://localhost:${PORT}/api
📍 Environment: ${process.env.NODE_ENV || 'development'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
