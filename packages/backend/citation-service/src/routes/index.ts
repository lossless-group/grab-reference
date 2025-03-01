import { FastifyInstance } from 'fastify';
import citationsRoutes from './citations.js';

// Register all routes
export default async function registerRoutes(fastify: FastifyInstance) {
  // Health check endpoint
  fastify.get('/health', async () => {
    return { status: 'ok' };
  });

  // Test endpoint to verify routing
  fastify.get('/test/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    return { message: `Test endpoint received ID: ${id}` };
  });

  // Register the citations endpoints with path prefix
  await fastify.register(citationsRoutes, { prefix: '/citations' });
} 