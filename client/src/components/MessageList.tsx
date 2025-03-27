import { useMessages } from '../hooks/useMessages';

export const MessageList = () => {
    const { data: messages, isLoading, error } = useMessages();

    if (isLoading) return <div>Loading messages...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!messages?.length) return <div>No messages yet</div>;

    return (
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {messages.map((msg) => (
                    <li key={msg._id || msg.timestamp} style={{ marginBottom: '8px' }}>
                        <p style={{ margin: '0 0 5px 0' }}>{msg.text}</p>
                        <small style={{ color: '#888' }}>
                            {msg.timestamp}
                        </small>
                    </li>
                ))}
            </ul>
        </div>
    );
};
