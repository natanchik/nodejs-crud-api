import * as dotenv from 'dotenv';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { route } from './router.js';

dotenv.config();

const PORT = Number(process.env.PORT ?? 3000);

export const requestHandler = (req: IncomingMessage, res: ServerResponse) => {
    void route(req, res);
};

export const app = createServer(requestHandler);

// Start the server if this is the main module
if (!process.env.JEST_WORKER_ID) {
    app.listen(PORT, () => {
        // eslint-disable-next-line no-console
        console.log(`Server listening on http://localhost:${PORT}`);
    });

    process.on('SIGINT', () => {
        // eslint-disable-next-line no-console
        console.log('Shutting down');
        app.close(() => process.exit(0));
    });
}
