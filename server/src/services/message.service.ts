import { Message } from '../types.js';
import databaseService from './database.service.js';

type NewMessagePayload = Omit<Message, '_id' | 'timestamp'>;

class MessageBatcher {
    private batch: Message[] = [];
    private timeout?: NodeJS.Timeout;
    private isFlushing = false;
    private readonly BATCH_SIZE = 10;
    private readonly BATCH_TIMEOUT = 1000;

    async addToBatch(messagePayload: NewMessagePayload) {
        const message: Message = {
            ...messagePayload,
            timestamp: new Date().toISOString()
        };

        this.batch.push(message);

        if (this.batch.length >= this.BATCH_SIZE) {
            await this.flush();
        } else if (!this.timeout && !this.isFlushing) {
            this.timeout = setTimeout(() => this.flush(), this.BATCH_TIMEOUT);
        }
    }

    private async flush() {
        if (this.isFlushing || this.batch.length === 0) return;

        this.isFlushing = true;
        this.clearTimeout();

        const batchToInsert = [...this.batch];
        this.batch = [];

        try {
            const connection = await databaseService.connect();

            await connection
                .collection<Message>('messages')
                .insertMany(batchToInsert);
        } catch (error) {
            console.error("Batch insert failed:", error);
        } finally {
            this.isFlushing = false;
            if (this.batch.length > 0) {
                this.timeout = setTimeout(() => this.flush(), this.BATCH_TIMEOUT);
            }
        }
    }

    private clearTimeout() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            delete this.timeout;
        }
    }

    async flushRemaining() {
        this.clearTimeout();
        await this.flush();
    }
}

export default new MessageBatcher();
