import { MessageList } from './components/MessageList';
import { MessageInput } from './components/MessageInput';
import { useWebSocket } from './hooks/useWebSocket';

function App() {
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`;
    useWebSocket(wsUrl);

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
            <h1>Hmmm</h1>
            <MessageList />
            <MessageInput />
        </div>
    );
}

export default App;
