import express from 'express';
import http from 'http';
import path from 'path';

import databaseService from './services/database.service.js';
import webSocketService from './services/websocket.service.js';
import messageBatcher from './services/message.service.js';
import messageRoutes from './routes/messages.route.js';

const PORT = 6969;
const app = express();
const server = http.createServer(app);
const publicPath = path.resolve('public');


app.use(express.json());
app.use(express.static(publicPath));
app.use('/api/messages', messageRoutes);


app.get('*', (_, response) => {
    response.sendFile(path.join(publicPath, 'index.html'), (error) => {
        if (error) response.status(500).send("Error serving application");
    });
});


async function startServer() {
    try {
        webSocketService.initialize(server);
        await databaseService.connect();
        databaseService.startChangeStream();

        server.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
}


async function shutdown(signal: string) {
    console.log(`\nShutting down (${signal})...`);

    webSocketService.close();

    server.close(async (error) => {
        await messageBatcher.flushRemaining();
        await databaseService.close();
        process.exit((error) ? (1) : (0));
    });

    setTimeout(() => {
        console.error('Shutdown timeout');
        process.exit(1);
    }, 10000);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();
