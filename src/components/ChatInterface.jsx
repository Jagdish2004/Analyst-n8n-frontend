import React, { useState, useEffect } from "react";
import "./ChatInterface.css";

const API_BASE = "http://localhost:3000";

export function ChatInterface({ sessionId: propSessionId ,sessionName:title}) {
  const [sessionId, setSessionId] = useState(null);
  const [sessionName, setSessionName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔑 Sync propSessionId → local sessionId
  useEffect(() => {
    if (propSessionId) {
      setSessionId(propSessionId);
    }
  }, [propSessionId]);

  const createSession = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/new-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: sessionName }),
      });
      if (!res.ok) throw new Error("Failed to create session");
      const data = await res.json();
      setSessionId(data.sessionId || data.id || data.session_id);
      setIsCreating(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchHistory = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${sessionId}/history`);
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      console.log("Fetched history:", data);

      const normalized = (data.rows || data).map(item => ({
          ...item,
          sender: item.message?.type === "human" ? "You" : "AI",
          message: item.message?.content || "", 
        }));

      setMessages(normalized);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setError(null);
    try {
      setMessages((prev) => [...prev, { message: newMessage, sender: "You" }]);
      setNewMessage("");
      const res = await fetch(`${API_BASE}/${sessionId}/newChat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage }),
      });
      if (!res.ok) throw new Error("Failed to send message");

      const data = await res.json();
      setMessages((prev) => [...prev, { message: data.message, sender: "AI" }]);
    } catch (err) {
      setError(err.message);
    }
  };

  // 🔑 Whenever sessionId changes → load history
  useEffect(() => {
    if (sessionId) fetchHistory();
  }, [sessionId]);

  return (
    <div className="chat-container">
      {!sessionId ? (
        <div className="chat-session">
          {!isCreating ? (
            <button onClick={() => setIsCreating(true)} className="btn-create">
              Create Session
            </button>
          ) : (
            <form onSubmit={createSession} className="session-form">
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="Enter session name"
                required
              />
              <button type="submit">Start</button>
            </form>
          )}
        </div>
      ) : (
        <div className="chat-box">
          <div className="chat-header">
            <h3>Session: {sessionName}</h3>
            <button className="btn-end" onClick={() => setSessionId(null)}>
              End Session
            </button>
          </div>

          <div className="chat-messages">
            {loading ? (
              <p>Loading...</p>
            ) : messages.length > 0 ? (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`chat-message ${
                    msg.sender === "You" ? "user" : "ai"
                  }`}
                >
                  <strong>{msg.sender || "AI"}: </strong>
                  <span>{msg.message}</span>
                </div>
              ))
            ) : (
              <p>No messages yet.</p>
            )}
          </div>

          <form onSubmit={sendMessage} className="chat-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}

      {error && <div className="chat-error">Error: {error}</div>}
    </div>
  );
}
