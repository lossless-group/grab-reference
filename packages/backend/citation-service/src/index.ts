import Fastify from 'fastify'
import cors from '@fastify/cors'
import prisma from './lib/prisma'

const fastify = Fastify({
  logger: true
})

// Register CORS
await fastify.register(cors, {
  origin: (origin, cb) => {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return cb(null, true)
    
    // Allow localhost with any port
    if (origin.startsWith('http://localhost:')) {
      return cb(null, true)
    }
    
    // Deny other origins
    cb(new Error('Not allowed'), false)
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE']
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
    fastify.log.error(error)
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
    await fastify.listen({ port: 8080, host: '0.0.0.0' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await fastify.close()
  process.exit(0)
})

start()

