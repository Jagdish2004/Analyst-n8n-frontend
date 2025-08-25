import { useEffect, useState, useRef } from "react";
import initClient from "../socketClient";

export function ChatInterface({ sessionId }) {
  const [message, setMessage] = useState("");       
  const [messages, setMessages] = useState([]); 

  // ✅ Keep socket stable across renders
  const socketRef = useRef(null);

  useEffect(() => {
    // create socket only once
    socketRef.current = initClient();

    // cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []); // empty deps → runs once

  useEffect(() => {
    if (!sessionId) {
      setMessages([])
      return
    }
    async function fetchHistory() {
      try {
        const response = await fetch(`http://localhost:3000/${sessionId}/history`, {
          method: "GET",
          credentials: "include"
        });
        const data = await response.json();
        // normalize to {text, sessionId, role}
        const normalized = data.map((row) => ({
          text: row.message?.text || row.message || row.text || String(row.message),
          sessionId: row.session_id || sessionId,
          role: row.role || "user"
        }))
        setMessages(normalized);
      } catch (error) {
        console.error("❌ Error fetching history:", error);
      }
    }

    fetchHistory();
  }, [sessionId]);

  useEffect(() => {
    if (!socketRef.current) return;

    // Listen for incoming messages
    socketRef.current.on("message", (msg) => {
      const normalized = typeof msg === 'string' ? { text: msg } : msg
      setMessages((prev) => [...prev, normalized]);
    });

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.off("message");
      }
    };
  }, [sessionId]);

  // Send message to server
  function sendChat() {
    if (message.trim() === "" || !sessionId) return;
    const outgoing = { sessionId, text: message, role: "user" }
    if (socketRef.current) {
      socketRef.current.emit("message", outgoing);
    }
    setMessages((prev) => [...prev, outgoing])
    console.log( outgoing);
    setMessage("");
  }

  return (
    <div className="chat-interface">
      <h2>Chat Interface {sessionId ? `(Session: ${sessionId})` : '(pick a session from sidebar)'} </h2>
      <div className="messages">
        {messages.map((msg, i) => (
          <p key={i}>{msg.text || msg}</p>
        ))}
      </div>
      <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendChat}>Send</button>
    </div>
  );
}
