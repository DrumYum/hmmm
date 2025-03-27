import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Message } from '../types';

export const messagesQueryKey = ['messages'];

export const useWebSocket = (url: string) => {
    const queryClient = useQueryClient();
    const ws = useRef<WebSocket | null>(null);
    const retryCount = useRef(0);

    const connect = () => {
        if (ws.current?.readyState === WebSocket.OPEN) return;

        ws.current = new WebSocket(url);

        ws.current.onopen = () => {
            retryCount.current = 0;
        };

        ws.current.onclose = () => {
            const maxRetries = 5;
            if (retryCount.current < maxRetries) {
                const delay = Math.min(1000 * Math.pow(2, retryCount.current), 30000);
                setTimeout(() => {
                    retryCount.current++;
                    connect();
                }, delay);
            }
        };

        ws.current.onmessage = (event) => {
            try {
                const { type, payload } = JSON.parse(event.data);
                if (type === 'newMessage') {
                    queryClient.setQueryData<Message[]>(messagesQueryKey, (old = []) =>
                        old.some(m => m._id === payload._id) ? old : [...old, payload]
                    );
                }
            } catch (error) {
                console.error('WebSocket message error:', error);
            }
        };
    };

    useEffect(() => {
        connect();
        return () => {
            ws.current?.close();
        };
    }, [url]);
};
