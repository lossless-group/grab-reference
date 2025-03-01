import Fastify from 'fastify'
import cors from '@fastify/cors'
import prisma from './lib/prisma.js'
import { FastifyError } from '@fastify/error'

const fastify = Fastify({
  logger: {
    level: 'debug',
    transport: {
      target: 'pino-pretty'
    }
  }
})

// Health check endpoint
fastify.get('/health', async () => {
  return { status: 'ok' }
})

// Example endpoint using Prisma
fastify.get('/citations', async () => {
  try {
    const citations = await prisma.citation.findMany({
      include: {
        authors: true,
        source: true,
        classifiers: true
      }
    })
    return citations
  } catch (error) {
    fastify.log.error(`Error fetching citations: ${error}`)
    throw error
  }
})

// Add POST endpoint for citations
fastify.post('/citations', async (request, reply) => {
  try {
    const { title, publishedTime, responseDescription, source } = request.body as any;

    // Create or find the source first
    const sourceRecord = await prisma.source.upsert({
      where: { url: source.url },
      update: { referredToAs: source.referredToAs },
      create: {
        referredToAs: source.referredToAs,
        url: source.url,
        type: source.type
      }
    });

    // Create the citation
    const citation = await prisma.citation.create({
      data: {
        title,
        url: source.url,
        publishedTime,
        responseDescription,
        sourceId: sourceRecord.id
      }
    });

    return citation;
  } catch (error) {
    fastify.log.error(error);
    throw error;
  }
});

// Start server
const start = async (): Promise<void> => {
  try {
    // Test database connection
    await prisma.$connect()
    console.log('Successfully connected to database')

    // Register CORS only once with combined configuration
    await fastify.register(cors, {
      // Allow localhost in development, but also support the methods and credentials from the first config
      origin: (origin, cb) => {
        // If no origin or localhost, allow it
        if (!origin || origin.startsWith('http://localhost:')) {
          return cb(null, true)
        }
        cb(new Error('Not allowed'), false)
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    })

    // Start server
    await fastify.listen({ port: 8080, host: '0.0.0.0' })
    console.log('Server started on port 8080')
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...')
  await prisma.$disconnect()
  await fastify.close()
  process.exit(0)
})

start()

