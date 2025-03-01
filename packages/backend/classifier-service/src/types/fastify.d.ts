declare module 'fastify' {
  export interface FastifyInstance {
    log: {
      info: (...args: any[]) => void;
      error: (...args: any[]) => void;
      debug: (...args: any[]) => void;
      warn: (...args: any[]) => void;
    };
    printRoutes: () => void;
    register: (plugin: any, options?: any) => Promise<void>;
    get: (path: string, handler: (request: any, reply: any) => Promise<any>) => void;
    post: (path: string, handler: (request: any, reply: any) => Promise<any>) => void;
    put: (path: string, handler: (request: any, reply: any) => Promise<any>) => void;
    delete: (path: string, handler: (request: any, reply: any) => Promise<any>) => void;
    listen: (options: { port: number; host: string }) => Promise<void>;
    close: () => Promise<void>;
  }

  export interface FastifyRequest<T = any> {
    params: T extends { Params: infer P } ? P : any;
    body: T extends { Body: infer B } ? B : any;
  }

  export interface FastifyReply {
    status: (code: number) => FastifyReply;
    send: (data?: any) => FastifyReply;
  }

  export default function Fastify(options?: any): FastifyInstance;
} 