import { FastifyInstance } from 'fastify';
import classifiersRoutes from './classifiers.js';

// Register all routes
export default async function registerRoutes(fastify: FastifyInstance) {
  // Health check endpoint
  fastify.get('/health', async () => {
    return { status: 'ok' };
  });

  // Test endpoint
  fastify.get('/test/:id', async (request, reply) => {
    const id = request.params.id;
    return { message: `Test endpoint received ID: ${id}` };
  });

  // Register classifier routes
  fastify.register(classifiersRoutes, { prefix: '/classifiers' });
} 