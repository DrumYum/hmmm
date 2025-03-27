import { useQuery } from '@tanstack/react-query';
import { Message } from '../types';
import { messagesQueryKey } from './useWebSocket';

const fetchMessages = async (): Promise<Message[]> => {
    const response = await fetch('/api/messages');
    if (!response.ok) throw new Error(`Failed to fetch messages: ${response.status}`);
    return response.json();
};

export const useMessages = () => {
    return useQuery<Message[]>({
        queryKey: messagesQueryKey,
        queryFn: fetchMessages,
        staleTime: Infinity
    });
};
