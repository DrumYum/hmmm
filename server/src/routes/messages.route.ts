import { Router } from 'express';
import messageBatcher from '../services/message.service.js';
import databaseService from '../services/database.service.js';
import { Message } from '../types.js';

const router = Router();

router.post('/', async (request, response) => {
    const text = request.body.text?.trim();

    if (!text) return void(response.status(400).json({ error: 'Message text is required' }));

    try {
        await messageBatcher.addToBatch({ text });
        response.status(202).json({ message: 'Message queued for batching' });
    } catch (error) {
        console.error("Batch error:", error);
        response.status(500).json({ error: 'Failed to queue message' });
    }
});

router.get('/', async (_, response) => {
    try {
        const connection = await databaseService.connect();
        const messages = await connection
            .collection<Message>('messages')
            .find()
            .sort({ timestamp: 1 })
            .toArray();

        response.json(messages);
    } catch (error) {
        console.error("Fetch error:", error);
        response.status(500).json({ error: 'Failed to fetch messages' });
    }
});

export default router;
