import Fastify, { FastifyInstance } from 'fastify';

const server: FastifyInstance = Fastify({
logger: true
});

// Health check endpoint
server.get('/health', async () => {
return { status: 'ok' };
});

// Start server
const start = async (): Promise<void> => {
try {
    await server.listen({ port: 8080, host: '0.0.0.0' });
} catch (err) {
    server.log.error(err);
    process.exit(1);
}
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
await server.close();
process.exit(0);
});

start();

