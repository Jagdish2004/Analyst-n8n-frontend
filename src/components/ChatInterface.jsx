import React, { useState, useEffect, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

export function ChatInterface({ sessionId: propSessionId, sessionTitle: propSessionTitle, onSessionCreated }) {
  const [sessionId, setSessionId] = useState(null);
  const [sessionName, setSessionName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSessionTitle, setCurrentSessionTitle] = useState("");
  const [isTyping, setIsTyping] = useState(false); // New state for typing indicator
  
  // Ref for chat messages container
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Format text with basic Markdown-style formatting
  const formatMessageText = (text) => {
    if (!text) return '';
    
    // Convert **text** to <strong>text</strong> (bold)
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert *text* to <em>text</em> (italic)
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert `text` to <code>text</code> (inline code)
    formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');
    
    return formatted;
  };

  // 🔑 Sync propSessionId → local sessionId and reset state when going home
  useEffect(() => {
    if (propSessionId) {
      setSessionId(propSessionId);
    } else {
      // Reset all state when going home
      setSessionId(null);
      setSessionName("");
      setIsCreating(false);
      setMessages([]);
      setNewMessage("");
      setLoading(false);
      setError(null);
      setCurrentSessionTitle("");
    }
  }, [propSessionId]);

  const createSession = async (e) => {
    e.preventDefault();
    console.log("🚀 Creating session with name:", sessionName);
    setError(null);
    
    if (!sessionName.trim()) {
      setError("Task name cannot be empty");
      return;
    }
    
    try {
      console.log("📡 Sending request to:", `${API_BASE}/new-session`);
      const res = await fetch(`${API_BASE}/new-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: sessionName }),
      });
      
      console.log("📡 Response status:", res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to create session: ${res.status} - ${errorText}`);
      }
      
      const data = await res.json();
      console.log("📊 Response data:", data);
      
      // Set the session ID
      const newSessionId = data.sessionId || data.id || data.session_id;
      console.log("🆔 New session ID:", newSessionId);
      
      if (!newSessionId) {
        throw new Error("No session ID received from server");
      }
      
      // Set the session ID
      setSessionId(newSessionId);
      
      // Set the current session title
      setCurrentSessionTitle(sessionName);
      
      // Clear the form
      setSessionName("");
      setIsCreating(false);
      
      // Notify parent component about the new session
      if (onSessionCreated) {
        console.log("📞 Notifying parent component:", { id: newSessionId, name: sessionName });
        onSessionCreated(newSessionId, sessionName);
      }
      
      console.log("✅ Session created successfully:", { id: newSessionId, name: sessionName });
      
    } catch (err) {
      console.error("❌ Error creating session:", err);
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
    
    const userMessage = newMessage.trim();
    
    try {
      // Add user message immediately
      setMessages((prev) => [...prev, { message: userMessage, sender: "You" }]);
      setNewMessage("");
      
      // Show typing indicator
      setIsTyping(true);
      
      // Send message to AI
      const res = await fetch(`${API_BASE}/${sessionId}/newChat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      
      if (!res.ok) throw new Error("Failed to send message");

      const data = await res.json();
      
      // Hide typing indicator and add AI response
      setIsTyping(false);
      setMessages((prev) => [...prev, { message: data.message, sender: "AI" }]);
      
    } catch (err) {
      setIsTyping(false);
      setError(err.message);
    }
  };

  // 🔑 Whenever sessionId changes → load history
  useEffect(() => {
    if (sessionId) fetchHistory();
  }, [sessionId]);

  // Get the display title - prioritize session title over session ID
  const getDisplayTitle = () => {
    // First priority: current session title (for newly created sessions)
    if (currentSessionTitle && currentSessionTitle.trim()) {
      return currentSessionTitle;
    }
    // Second priority: prop session title (for sessions selected from sidebar)
    if (propSessionTitle && propSessionTitle.trim()) {
      return propSessionTitle;
    }
    // Fallback: formatted session ID
    return `Task ${sessionId?.slice(0, 8)}...`;
  };

  return (
    <div className="chat-interface">
      {!sessionId ? (
        // Welcome Screen
        <div className="welcome-screen">
          <div className="welcome-content">
            <div className="welcome-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="welcome-title">Welcome to AI Agent</h2>
            <p className="welcome-subtitle">Your intelligent task automation assistant</p>
            
            {!isCreating ? (
              <button 
                onClick={() => setIsCreating(true)} 
                className="btn btn-primary"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create New Task</span>
              </button>
            ) : (
              <form onSubmit={createSession} className="form-group">
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="Enter task name (e.g., Send email to jagdish@fuzzysearch.com)"
                  required
                  className="form-input"
                />
                <div className="form-actions">
                  <button 
                    type="submit"
                    className="btn btn-primary"
                  >
                    Start Task
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : (
        // Chat Interface
        <div className="chat-interface">
          {/* Chat Header */}
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="chat-header-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="chat-header-info">
                <h3 className="chat-session-title">
                  {getDisplayTitle()}
                </h3>
                <p className="chat-session-subtitle">AI Agent • Automating Your Task</p>
              </div>
            </div>
            <div className="chat-header-actions">
              <button 
                onClick={() => setIsCreating(true)} 
                className="btn btn-secondary btn-sm"
                title="Create New Task"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Task</span>
              </button>
              <button 
                onClick={() => setSessionId(null)} 
                className="chat-close"
                title="End Task"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="chat-messages">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <span className="loading-text">Loading task history...</span>
              </div>
            ) : messages.length > 0 ? (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`message ${msg.sender === "You" ? "user" : "ai"}`}
                >
                  <div className={`message-bubble ${msg.sender === "You" ? "user" : "ai"}`}>
                    <div className="message-content">
                      {msg.sender === "AI" && (
                        <div className="message-avatar">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                      )}
                      <div className="message-text">
                        <div className="message-sender">
                          {msg.sender === "You" ? "You" : "AI Agent"}
                        </div>
                        <div className="message-content-text" dangerouslySetInnerHTML={{ __html: formatMessageText(msg.message) }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="empty-text">No task history yet</p>
                <p className="empty-subtext">Start giving commands to your AI Agent!</p>
              </div>
            )}
            <div ref={messagesEndRef} />
            
            {/* Typing Indicator - shows when AI is responding */}
            {isTyping && (
              <div className="message ai">
                <div className="message-bubble ai">
                  <div className="message-content">
                    <div className="message-avatar">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="message-text">
                      <div className="message-sender">AI Agent</div>
                      <div className="typing-indicator">
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Scroll to bottom button - only show when there are many messages */}
            {messages.length > 5 && (
              <button
                onClick={scrollToBottom}
                className="scroll-to-bottom"
                title="Scroll to bottom"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            )}
          </div>

          {/* Chat Input */}
          <div className="chat-input-container">
            <form onSubmit={sendMessage} className="chat-input-form">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Give your AI Agent a command (e.g., send email to jagdish@fuzzysearch.com)"
                className="chat-input-field"
              />
              <button 
                type="submit"
                disabled={!newMessage.trim() || isTyping}
                className="chat-send-btn"
              >
                {isTyping ? (
                  <>
                    <div className="button-spinner"></div>
                    <span>AI is typing...</span>
                  </>
                ) : (
                  <>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Send Command</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Session Modal */}
      {isCreating && (
        <div className="modal-overlay" onClick={() => setIsCreating(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Task</h3>
              <button 
                onClick={() => setIsCreating(false)} 
                className="modal-close"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={createSession} className="modal-form">
              <div className="form-group">
                <label htmlFor="sessionName">Task Name</label>
                <input
                  id="sessionName"
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="Enter task name (e.g., Send email to jagdish@fuzzysearch.com)"
                  required
                  className="form-input"
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="submit"
                  className="btn btn-primary"
                >
                  Create Task
                </button>
                <button 
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-toast">
          <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Error: {error}</span>
        </div>
      )}
    </div>
  );
}
