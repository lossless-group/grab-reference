import { PrismaClient } from '@prisma/client';

// Extend the PrismaClient types to include our model specifics
declare global {
  namespace PrismaJson {
    type PrismaClientOptions = {};
  }
}

// Extend the Prisma namespace to add our custom types
declare namespace Prisma {
  interface ClassifierCreateInput {
    referredToAs: string;
    aliases: string[];
  }

  interface ClassifierUpdateInput {
    referredToAs?: string | undefined;
    aliases?: string[] | undefined;
  }
}

export {}; 