import Fastify from 'fastify'
import prisma from './lib/prisma'

const fastify = Fastify({
  logger: true
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

