import { IncomingMessage, ServerResponse } from 'http';
import { User } from './types.js';
import {
    addUser,
    editUser,
    getUsers,
    getOneUser,
    removeUser
} from './controllers/usersController.js';

function parseId(url: string): string | undefined {
    const m = url.match(
        /^\/api\/users\/([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i
    );
    return m ? decodeURIComponent(m[1]) : undefined;
}

export const route = async (req: IncomingMessage, res: ServerResponse) => {
    const method = req.method ?? 'GET';
    const url = req.url ?? '/';

    const parseBody = async (): Promise<string> => {
        return new Promise((resolve, reject) => {
            const chunks: Buffer[] = [];
            req.on('data', (c: Buffer) => chunks.push(c));
            req.on('end', () => {
                if (chunks.length === 0) return resolve('{}');
                const s = Buffer.concat(chunks).toString('utf8');
                resolve(s);
            });
            req.on('error', (err) => reject(err));
        });
    };

    interface ApiResponse {
        status: number;
        body: User | User[] | { message: string } | null;
    }

    const sendResponse = (result: ApiResponse) => {
        res.writeHead(result.status, { 'Content-Type': 'application/json' });
        if (result.body !== null) {
            res.end(JSON.stringify(result.body));
        } else {
            res.end();
        }
    };

    try {
        // Normalize URL by removing trailing slash
        const normalizedUrl = url.replace(/\/$/, '');

        if (normalizedUrl === '/api/users' && method === 'GET') {
            const result = await getUsers();
            return sendResponse(result);
        }

        if (normalizedUrl === '/api/users' && method === 'POST') {
            const body = await parseBody();
            const result = await addUser(body);
            return sendResponse(result);
        }

        const id = parseId(normalizedUrl);
        if (id && method === 'GET') {
            const result = await getOneUser(id);
            return sendResponse(result);
        }

        if (id && method === 'PUT') {
            const body = await parseBody();
            const result = await editUser(id, body);
            return sendResponse(result);
        }

        if (id && method === 'DELETE') {
            const result = await removeUser(id);
            return sendResponse(result);
        }

        sendResponse({
            status: 404,
            body: { message: 'Not found' }
        });
    } catch (err: unknown) {
        sendResponse({
            status: 500,
            body: { message: 'Internal server error' }
        });
    }
};
