import 'dotenv/config';
import { createServer } from 'http';
import { route } from './router.js';

const PORT = Number(process.env.PORT ?? 3000);

const server = createServer((req, res) => {
  // route returns a Promise; errors handled inside
  void route(req, res);
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  // eslint-disable-next-line no-console
  console.log('Shutting down');
  server.close(() => process.exit(0));
});
