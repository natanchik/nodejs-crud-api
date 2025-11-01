import cluster, { Worker } from 'node:cluster';
import os from 'node:os';
import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import * as http from 'node:http';
import * as dotenv from 'dotenv';
import { app } from './index.js';

dotenv.config();

const isPortInUse = async (port: number): Promise<boolean> => {
    return new Promise((resolve) => {
        const server = createServer()
            .listen(port, () => {
                server.close();
                resolve(false);
            })
            .on('error', () => {
                resolve(true);
            });
    });
};

const findAvailablePort = async (startPort: number): Promise<number> => {
    let port = startPort;
    while (await isPortInUse(port)) {
        port++;
    }
    return port;
};

const BASE_PORT = Number(process.env.PORT ?? 4000);
const numCPUs = os.cpus().length - 1;

interface WorkerInfo {
    worker: Worker;
    port: number;
}

const setupCluster = async () => {
    if (cluster.isPrimary) {
        let currentWorkerIndex = 0;
        const workers: WorkerInfo[] = [];

        console.log(`Primary pid ${process.pid}`);
        console.log(`Starting ${numCPUs} workers...`);

        const loadBalancerPort = await findAvailablePort(BASE_PORT);
        console.log(
            `Found available port ${loadBalancerPort} for load balancer`
        );

        const loadBalancer = createServer(
            (req: IncomingMessage, res: ServerResponse) => {
                if (workers.length === 0) {
                    res.writeHead(500);
                    res.end('No workers available');
                    return;
                }

                const workerData = workers[currentWorkerIndex];
                const targetPort = workerData.port;

                currentWorkerIndex = (currentWorkerIndex + 1) % workers.length;

                const proxyOptions = {
                    hostname: 'localhost',
                    port: targetPort,
                    path: req.url,
                    method: req.method,
                    headers: req.headers
                };

                const proxyReq = http.request(proxyOptions, (proxyRes) => {
                    res.writeHead(proxyRes.statusCode ?? 500, proxyRes.headers);
                    proxyRes.pipe(res);
                });

                proxyReq.on('error', (error) => {
                    console.error(
                        `Proxy error for worker ${targetPort}:`,
                        error.message
                    );
                    res.writeHead(502);
                    res.end('Bad Gateway');
                });

                if (req.method !== 'GET' && req.method !== 'HEAD') {
                    req.pipe(proxyReq);
                } else {
                    proxyReq.end();
                }
            }
        );

        loadBalancer.on('error', (error) => {
            console.error('Load balancer error:', error);
            process.exit(1);
        });

        loadBalancer.listen(loadBalancerPort, () => {
            console.log(
                `Load balancer listening on http://localhost:${loadBalancerPort}`
            );

            (async () => {
                for (let i = 0; i < numCPUs; i++) {
                    const workerPort = await findAvailablePort(
                        loadBalancerPort + i + 1
                    );
                    const worker = cluster.fork({ WORKER_PORT: workerPort });
                    workers.push({ worker, port: workerPort });
                    console.log(
                        `Started worker ${i + 1} on port ${workerPort}`
                    );
                }
            })();
        });

        cluster.on('exit', (deadWorker) => {
            const index = workers.findIndex(
                (w) => w.worker.id === deadWorker.id
            );
            if (index !== -1) {
                console.log(`Worker ${deadWorker.id} died. Restarting...`);
                const { port } = workers[index];
                const newWorker = cluster.fork({ WORKER_PORT: port });
                workers[index] = { worker: newWorker, port };
            }
        });

        cluster.on('message', (worker, message) => {
            if (message.type === 'store-update') {
                workers.forEach(({ worker: w }) => {
                    if (w.id !== worker.id) {
                        w.send(message);
                    }
                });
            }
        });
    } else {
        const workerPort = Number(process.env.WORKER_PORT);

        app.listen(workerPort, () => {
            console.log(
                `Worker ${cluster.worker?.id} listening on http://localhost:${workerPort}`
            );
        });
    }
};

void setupCluster();
