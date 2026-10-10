import { buildServer } from '../src/server.js';

// Initialize Fastify server once for warm container re-use
const app = buildServer();

export default async function handler(req: any, res: any) {
  await app.ready();
  app.server.emit('request', req, res);
}
