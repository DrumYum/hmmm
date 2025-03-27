import React, { useState } from 'react';

export const MessageInput = () => {
    const [text, setText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedText = text.trim();
        if (!trimmedText) return;

        setIsSending(true);
        setError(null);

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: trimmedText }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || response.statusText);
            }

            setText('');
        } catch (err: any) {
            setError(err.message || 'Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your message..."
                disabled={isSending}
                style={{ flexGrow: 1, padding: '8px' }}
            />
            <button type="submit" disabled={isSending}>
                {isSending ? 'Sending...' : 'Send'}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
    );
};
