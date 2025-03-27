import { MongoClient, Db, ChangeStream, MongoServerError } from 'mongodb';
import webSocketService from './websocket.service.js';

const MONGO_URI = 'mongodb://mongodb:27017/hmmm';
const DB_NAME = 'hmmm';

class DatabaseService {
    private client = new MongoClient(MONGO_URI);
    private db?: Db;
    private changeStream?: ChangeStream;
    private resumeToken?: unknown;

    async connect() {
        if (this.db) return this.db;

        await this.client.connect();
        this.db = this.client.db(DB_NAME);
        await this.createCollectionIfNeeded();
        return this.db;
    }

    private async createCollectionIfNeeded() {
        try {
            await this.db!.createCollection('messages');
        } catch (error) {
            if (error instanceof MongoServerError && error.codeName === 'NamespaceExists') return;

            throw error;
        }
    }

    startChangeStream() {
        if (this.changeStream) return;

        this.changeStream = this.db!.collection('messages')
            .watch([], this.resumeToken ? { resumeAfter: this.resumeToken } : {});

        this.changeStream
            .on('change', (change) => {
                this.resumeToken = change._id;
                if (change.operationType === 'insert' && change.fullDocument) {
                    webSocketService.broadcast({
                        type: 'newMessage',
                        payload: change.fullDocument
                    });
                }
            })
            .on('error', (error) => {
                console.error('Change stream error:', error);
                delete this.changeStream;
            })
            .on('close', () => {
                delete this.changeStream
            });
    }

    async close() {
        await this.changeStream?.close();
        await this.client.close();
    }
}

export default new DatabaseService();
