import Fastify from 'fastify'
import cors from '@fastify/cors'
import prisma from './lib/prisma.js'
import registerRoutes from './routes/index.js'

const fastify = Fastify({
  logger: {
    level: 'debug',
    transport: {
      target: 'pino-pretty'
    }
  }
})

// Start server
const start = async (): Promise<void> => {
  try {
    // Test database connection
    await prisma.$connect()
    console.log('Successfully connected to database')

    // Register CORS
    await fastify.register(cors, {
      origin: (origin, cb) => {
        // Allow all origins in development
        return cb(null, true);
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    })
    
    // Register all routes
    await fastify.register(registerRoutes)
    
    // Start server
    await fastify.listen({ port: 8080, host: '0.0.0.0' })
    console.log('Server started on port 8080')
    
    // Log all registered routes
    console.log('Registered routes:')
    console.log(fastify.printRoutes())
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