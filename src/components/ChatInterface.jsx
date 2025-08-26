// ChatInterface.jsx
import { useEffect, useState, useRef } from "react";
import initClient from "../socketClient";

export function ChatInterface({ sessionId }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const socketRef = useRef(null);

  // --- Setup socket connection once ---
  useEffect(() => {
    socketRef.current = initClient();

    const handler = (msg) => {
      const normalized =
        typeof msg === "string" ? { text: msg, role: "assistant" } : msg;
      setMessages((prev) => [...prev, normalized]);
    };

    socketRef.current.on("message", handler);

    return () => {
      socketRef.current.off("message", handler);
      socketRef.current.disconnect();
      socketRef.current = null;
    };
  }, []);

  // --- Fetch history when session changes ---
  useEffect(() => {
    if (!sessionId) {
      setMessages([]);
      return;
    }

    async function fetchHistory() {
      try {
        const response = await fetch(
          `http://localhost:3000/${sessionId}/history`,
          { method: "GET", credentials: "include" }
        );
        const data = await response.json();

        // Normalize DB rows
        const normalized = data.map((row) => ({
          text:String(row.message),
          role: row.type || "user",
          sessionId: row.session_id || sessionId,
        }));

        setMessages(normalized);
      } catch (err) {
        console.error("❌ Error fetching history:", err);
      }
    }

    setMessages([]); // clear old session messages
    fetchHistory();
  }, [sessionId]);

  // --- Send message to server ---
  function sendChat() {
    if (message.trim() === "" || !sessionId) return;

    const outgoing = { sessionId, text: message, role: "user" };

    // Send to backend
    socketRef.current?.emit("message", outgoing);

    // Append locally
    setMessages((prev) => [...prev, outgoing]);

    setMessage("");
  }

  return (
    <div className="chat-interface">
      <h2>
        Chat Interface{" "}
        {sessionId
          ? `(Session: ${sessionId})`
          : "(pick a session from sidebar)"}
      </h2>

      <div className="messages">
        {messages.map((msg, i) => (
          <p key={i} className={msg.role}>
            <strong>{msg.role}:</strong> {msg.text}
          </p>
        ))}
      </div>

      <div className="input-box">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendChat()}
        />
        <button onClick={sendChat}>Send</button>
      </div>
    </div>
  );
}
