// Simple delete handler
import prisma from './lib/prisma.js';

/**
 * Handler function for DELETE requests to /citations/:id
 */
export async function deleteCitation(request, reply) {
  try {
    console.log("DELETE handler called");
    const { id } = request.params;
    console.log(`Raw ID: ${id}`);

    // Parse and validate ID
    const citationId = parseInt(id, 10);
    if (isNaN(citationId)) {
      console.error(`Invalid citation ID: "${id}" is not a number`);
      return reply.status(400).send({
        error: 'Invalid citation ID',
        message: 'Citation ID must be a number'
      });
    }

    console.log(`Attempting to delete citation with ID: ${citationId}`);

    // Check if citation exists
    const citation = await prisma.citation.findUnique({
      where: { id: citationId }
    });

    if (!citation) {
      console.log(`Citation with ID ${citationId} not found`);
      return reply.status(404).send({
        error: 'Citation not found',
        message: 'The requested citation does not exist'
      });
    }

    // Delete the citation
    await prisma.citation.delete({
      where: { id: citationId }
    });

    console.log(`Citation with ID ${citationId} deleted successfully`);

    // Return success
    return reply.status(204).send();
  } catch (error) {
    console.error(`Error deleting citation: ${error}`);
    return reply.status(500).send({
      error: 'Failed to delete citation',
      message: error.message || 'Unknown error'
    });
  }
} 