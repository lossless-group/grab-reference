import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma.js';

// Define the routes related to citations
export default async function citationsRoutes(fastify: FastifyInstance) {
  // Get all citations
  fastify.get('/', async (request, reply) => {
    try {
      const citations = await prisma.citation.findMany({
        include: {
          authors: true,
          source: true,
          classifiers: true
        }
      });
      return citations;
    } catch (error) {
      fastify.log.error(`Error fetching citations: ${error}`);
      throw error;
    }
  });

  // Create a new citation
  fastify.post('/', async (request, reply) => {
    try {
      fastify.log.info('POST /citations received');
      
      // Don't log the entire body as it might contain large text
      const { title, publishedTime, responseDescription, source } = request.body as any;
      
      fastify.log.info({
        title,
        publishedTime,
        sourceUrl: source?.url,
        sourceType: source?.type,
        responseDescriptionLength: responseDescription?.length || 0
      }, 'Citation data received');

      // Ensure responseDescription is properly handled
      const safeResponseDescription = responseDescription || '';
      
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
          responseDescription: safeResponseDescription,
          sourceId: sourceRecord.id
        }
      });

      fastify.log.info({ citationId: citation.id }, 'Citation created successfully');
      return citation;
    } catch (error) {
      fastify.log.error('Error creating citation:', error);
      reply.status(500).send({ 
        error: 'Failed to create citation',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Delete a citation by ID
  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      
      fastify.log.info(`DELETE /citations/ with raw id parameter: ${id}`);
      
      const citationId = parseInt(id, 10);
      if (isNaN(citationId)) {
        fastify.log.error(`Invalid citation ID: "${id}" is not a number`);
        return reply.status(400).send({ 
          error: 'Invalid citation ID', 
          message: 'Citation ID must be a number'
        });
      }
      
      fastify.log.info(`DELETE /citations/${citationId} received`);
      
      // First check if the citation exists
      const citation = await prisma.citation.findUnique({
        where: { id: citationId }
      });
      
      if (!citation) {
        fastify.log.info(`Citation with ID ${citationId} not found`);
        return reply.status(404).send({ 
          error: 'Citation not found', 
          message: 'The requested citation does not exist'
        });
      }
      
      // Delete the citation
      await prisma.citation.delete({
        where: { id: citationId }
      });
      
      fastify.log.info({ citationId }, 'Citation deleted successfully');
      
      // Return success with no content
      return reply.status(204).send();
    } catch (error) {
      fastify.log.error(`Error deleting citation: ${error}`);
      return reply.status(500).send({ 
        error: 'Failed to delete citation',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
} 