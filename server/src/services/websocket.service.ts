import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';

interface BroadcastMessage {
    type: string;
    payload: unknown;
}

class WebSocketService {
    private wss?: WebSocketServer;

    initialize(server: http.Server) {
        if (this.wss) {
            console.warn('WebSocket server already running');
            return;
        }

        this.wss = new WebSocketServer({ server });
        this.setupEventHandlers();
    }

    private setupEventHandlers() {
        this.wss!
            .on('connection', (ws) => {
                ws.on('error', console.error);
            })
            .on('error', console.error);
    }

    broadcast(message: BroadcastMessage) {
        if (!this.wss) return;

        const data = JSON.stringify(message);
        this.wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data, console.error);
            }
        });
    }

    close() {
        if (!this.wss) return;

        this.wss.clients.forEach(client => client.terminate());
        this.wss.close((error) => {
            if (error) console.error(error);
            delete this.wss;
        });
    }
}

export default new WebSocketService();
