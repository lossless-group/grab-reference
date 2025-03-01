import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma.js';

// Define interfaces for request parameters and body
interface IdParam {
  id: string;
}

interface CitationIdParam extends IdParam {
  citationId: string;
}

interface ChildIdParam extends IdParam {
  childId: string;
}

interface ClassifierBody {
  referredToAs: string;
  aliases?: string[];
}

// Define the routes related to classifiers
export default async function classifiersRoutes(fastify: FastifyInstance) {
  // Get all classifiers
  fastify.get('/', async (request, reply) => {
    try {
      const classifiers = await prisma.classifier.findMany({
        include: {
          citations: true,
          sources: true,
          authors: true,
          parentClassifiers: true,
          childClassifiers: true
        }
      });
      return classifiers;
    } catch (error) {
      fastify.log.error(`Error fetching classifiers: ${error}`);
      throw error;
    }
  });

  // Get a classifier by ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const id = request.params.id;
      
      const classifierId = parseInt(id, 10);
      if (isNaN(classifierId)) {
        fastify.log.error(`Invalid classifier ID: "${id}" is not a number`);
        return reply.status(400).send({ 
          error: 'Invalid classifier ID', 
          message: 'Classifier ID must be a number'
        });
      }
      
      const classifier = await prisma.classifier.findUnique({
        where: { id: classifierId },
        include: {
          citations: true,
          sources: true,
          authors: true,
          parentClassifiers: true,
          childClassifiers: true
        }
      });
      
      if (!classifier) {
        fastify.log.info(`Classifier with ID ${classifierId} not found`);
        return reply.status(404).send({ 
          error: 'Classifier not found', 
          message: 'The requested classifier does not exist'
        });
      }
      
      return classifier;
    } catch (error) {
      fastify.log.error(`Error fetching classifier by ID: ${error}`);
      return reply.status(500).send({ 
        error: 'Failed to fetch classifier',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Create a new classifier
  fastify.post('/', async (request, reply) => {
    try {
      fastify.log.info('POST /classifiers received');
      
      const body = request.body as any;
      const referredToAs = body.referredToAs;
      const aliases = body.aliases || [];
      
      // Check if required fields are provided
      if (!referredToAs) {
        return reply.status(400).send({
          error: 'Missing required fields',
          message: 'The referredToAs field is required'
        });
      }
      
      fastify.log.info({
        referredToAs,
        aliases
      }, 'Classifier data received');

      // Check if classifier with the same name already exists
      const existingClassifier = await prisma.classifier.findUnique({
        where: { referredToAs }
      });
      
      if (existingClassifier) {
        fastify.log.info(`Classifier with name "${referredToAs}" already exists`);
        return reply.status(409).send({
          error: 'Classifier already exists',
          message: `A classifier with the name "${referredToAs}" already exists`,
          classifier: existingClassifier
        });
      }
      
      // Create the classifier
      const classifier = await prisma.classifier.create({
        data: {
          referredToAs,
          aliases
        }
      });

      fastify.log.info({ classifierId: classifier.id }, 'Classifier created successfully');
      return classifier;
    } catch (error) {
      fastify.log.error('Error creating classifier:', error);
      return reply.status(500).send({ 
        error: 'Failed to create classifier',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Update a classifier
  fastify.put('/:id', async (request, reply) => {
    try {
      const id = request.params.id;
      const body = request.body as any;
      const referredToAs = body.referredToAs;
      const aliases = body.aliases || [];
      
      const classifierId = parseInt(id, 10);
      if (isNaN(classifierId)) {
        fastify.log.error(`Invalid classifier ID: "${id}" is not a number`);
        return reply.status(400).send({ 
          error: 'Invalid classifier ID', 
          message: 'Classifier ID must be a number'
        });
      }
      
      fastify.log.info(`PUT /classifiers/${classifierId} received`);
      
      // First check if the classifier exists
      const classifier = await prisma.classifier.findUnique({
        where: { id: classifierId }
      });
      
      if (!classifier) {
        fastify.log.info(`Classifier with ID ${classifierId} not found`);
        return reply.status(404).send({ 
          error: 'Classifier not found', 
          message: 'The requested classifier does not exist'
        });
      }
      
      // Check if the updated name conflicts with an existing classifier
      if (referredToAs && referredToAs !== classifier.referredToAs) {
        const existingClassifier = await prisma.classifier.findUnique({
          where: { referredToAs }
        });
        
        if (existingClassifier && existingClassifier.id !== classifierId) {
          fastify.log.info(`Classifier with name "${referredToAs}" already exists`);
          return reply.status(409).send({
            error: 'Classifier name conflict',
            message: `Another classifier with the name "${referredToAs}" already exists`
          });
        }
      }
      
      // Update the classifier
      const updateData = {
        ...(referredToAs ? { referredToAs } : {}),
        ...(aliases.length > 0 ? { aliases } : {})
      };
      
      const updatedClassifier = await prisma.classifier.update({
        where: { id: classifierId },
        data: updateData
      });
      
      fastify.log.info({ classifierId }, 'Classifier updated successfully');
      return updatedClassifier;
    } catch (error) {
      fastify.log.error(`Error updating classifier: ${error}`);
      return reply.status(500).send({ 
        error: 'Failed to update classifier',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Delete a classifier by ID
  fastify.delete('/:id', async (request, reply) => {
    try {
      const id = request.params.id;
      
      fastify.log.info(`DELETE /classifiers/ with raw id parameter: ${id}`);
      
      const classifierId = parseInt(id, 10);
      if (isNaN(classifierId)) {
        fastify.log.error(`Invalid classifier ID: "${id}" is not a number`);
        return reply.status(400).send({ 
          error: 'Invalid classifier ID', 
          message: 'Classifier ID must be a number'
        });
      }
      
      fastify.log.info(`DELETE /classifiers/${classifierId} received`);
      
      // First check if the classifier exists
      const classifier = await prisma.classifier.findUnique({
        where: { id: classifierId }
      });
      
      if (!classifier) {
        fastify.log.info(`Classifier with ID ${classifierId} not found`);
        return reply.status(404).send({ 
          error: 'Classifier not found', 
          message: 'The requested classifier does not exist'
        });
      }
      
      // Delete the classifier
      await prisma.classifier.delete({
        where: { id: classifierId }
      });
      
      fastify.log.info({ classifierId }, 'Classifier deleted successfully');
      
      // Return success with no content
      return reply.status(204).send(null);
    } catch (error) {
      fastify.log.error(`Error deleting classifier: ${error}`);
      return reply.status(500).send({ 
        error: 'Failed to delete classifier',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Associate a classifier with a citation
  fastify.post('/:id/citations/:citationId', async (request, reply) => {
    try {
      const id = request.params.id;
      const citationId = request.params.citationId;
      
      const classifierId = parseInt(id, 10);
      const parsedCitationId = parseInt(citationId, 10);
      
      if (isNaN(classifierId) || isNaN(parsedCitationId)) {
        return reply.status(400).send({ 
          error: 'Invalid ID format', 
          message: 'Both classifier ID and citation ID must be numbers'
        });
      }
      
      // Check if both entities exist
      const classifier = await prisma.classifier.findUnique({
        where: { id: classifierId }
      });
      
      const citation = await prisma.citation.findUnique({
        where: { id: parsedCitationId }
      });
      
      if (!classifier) {
        return reply.status(404).send({ 
          error: 'Classifier not found', 
          message: 'The requested classifier does not exist'
        });
      }
      
      if (!citation) {
        return reply.status(404).send({ 
          error: 'Citation not found', 
          message: 'The requested citation does not exist'
        });
      }
      
      // Connect the classifier to the citation
      await prisma.classifier.update({
        where: { id: classifierId },
        data: {
          citations: {
            connect: { id: parsedCitationId }
          }
        }
      });
      
      return { 
        message: 'Classifier associated with citation successfully',
        classifierId,
        citationId: parsedCitationId
      };
    } catch (error) {
      fastify.log.error(`Error associating classifier with citation: ${error}`);
      return reply.status(500).send({ 
        error: 'Failed to associate classifier with citation',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Add a parent-child relationship between classifiers
  fastify.post('/:id/children/:childId', async (request, reply) => {
    try {
      const id = request.params.id;
      const childId = request.params.childId;
      
      const parentId = parseInt(id, 10);
      const parsedChildId = parseInt(childId, 10);
      
      if (isNaN(parentId) || isNaN(parsedChildId)) {
        return reply.status(400).send({ 
          error: 'Invalid ID format', 
          message: 'Both parent and child classifier IDs must be numbers'
        });
      }
      
      if (parentId === parsedChildId) {
        return reply.status(400).send({ 
          error: 'Invalid relationship', 
          message: 'A classifier cannot be its own child'
        });
      }
      
      // Check if both classifiers exist
      const parent = await prisma.classifier.findUnique({
        where: { id: parentId },
        include: { childClassifiers: true }
      });
      
      const child = await prisma.classifier.findUnique({
        where: { id: parsedChildId }
      });
      
      if (!parent) {
        return reply.status(404).send({ 
          error: 'Parent classifier not found', 
          message: 'The requested parent classifier does not exist'
        });
      }
      
      if (!child) {
        return reply.status(404).send({ 
          error: 'Child classifier not found', 
          message: 'The requested child classifier does not exist'
        });
      }
      
      // Check if relationship already exists
      if (parent.childClassifiers.some(c => c.id === parsedChildId)) {
        return reply.status(409).send({ 
          error: 'Relationship already exists', 
          message: 'This parent-child relationship already exists'
        });
      }
      
      // Connect parent to child
      await prisma.classifier.update({
        where: { id: parentId },
        data: {
          childClassifiers: {
            connect: { id: parsedChildId }
          }
        }
      });
      
      return { 
        message: 'Parent-child relationship created successfully',
        parentId,
        childId: parsedChildId
      };
    } catch (error) {
      fastify.log.error(`Error creating parent-child relationship: ${error}`);
      return reply.status(500).send({ 
        error: 'Failed to create parent-child relationship',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
} 