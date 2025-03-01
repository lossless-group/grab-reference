import Fastify from 'fastify';
import cors from '@fastify/cors';
import prisma from './lib/prisma.js';
import registerRoutes from './routes/index.js';

// Initialize Fastify with a custom logger
const fastify = Fastify({
  logger: {
    level: 'debug',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

async function start() {
  try {
    // Connect to the database
    await prisma.$connect();
    console.log('Connected to database');
    
    // Register CORS
    await fastify.register(cors, {
      origin: process.env.NODE_ENV === 'development' ? true : false,
      credentials: true,
    });
    
    // Register all routes
    await fastify.register(registerRoutes);
    
    // Start the server
    await fastify.listen({ port: 8080, host: '0.0.0.0' });
    
    // Log all registered routes
    console.log('Registered routes:');
    fastify.printRoutes();
    
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Start the server
start();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await prisma.$disconnect();
  await fastify.close();
  process.exit(0);
}); 