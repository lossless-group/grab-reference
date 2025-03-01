import { Prisma } from '@prisma/client'

declare global {
  namespace PrismaJson {
    interface ClassifierCreateInput extends Prisma.ClassifierCreateInput {
      aliases: string[];
    }
    
    interface ClassifierUpdateInput extends Prisma.ClassifierUpdateInput {
      aliases?: string[];
    }
  }
}

declare module '@prisma/client' {
  namespace Prisma {
    interface ClassifierCreateInput {
      aliases?: string[];
    }
    
    interface ClassifierUpdateInput {
      aliases?: string[];
    }
  }
} 