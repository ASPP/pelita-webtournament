// pages/zmq.js
import { useEffect, useState } from 'react';

export default function ZMQMessages() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch('/api/messages');
      const data = await res.json();
      setMessages(data.messages);
    };

    fetchMessages();

    const interval = setInterval(fetchMessages, 1000); // Fetch new messages every second
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>ZMQ Messages</h1>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}
