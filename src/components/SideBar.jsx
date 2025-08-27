import React, { useEffect, useState } from "react";

export function SideBar({ onSelectSession, selectedSessionId }) {
  const [displayHistory, setDisplayHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      setError(null);
      try {
        console.log("🔄 Fetching history from backend...");
        const response = await fetch("http://localhost:3000/history");
        console.log("📡 Response status:", response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("📊 Fetched data:", data);
        setDisplayHistory(data);
      } catch (error) {
        console.error("❌ Error fetching history:", error);
        setError(error.message);
        
        // Fallback: Add some sample data for testing
        console.log("🔄 Adding fallback data for testing...");
        const fallbackData = [
          {
            session_id: "test-1",
            title: "Email Automation Task",
            created_at: new Date().toISOString()
          },
          {
            session_id: "test-2", 
            title: "Data Analysis Report",
            created_at: new Date().toISOString()
          }
        ];
        setDisplayHistory(fallbackData);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  const handleSessionSelect = (item) => {
    console.log("🎯 Session selected:", item);
    if (onSelectSession) {
      onSelectSession(item.session_id, item.title);
    }
  };

  const handleGoHome = () => {
    console.log("🏠 Home button clicked - navigating to home");
    if (onSelectSession) {
      console.log("📞 Calling onSelectSession with null values");
      onSelectSession(null, null); // This will redirect to home
    } else {
      console.log("❌ onSelectSession function is not available");
    }
  };

  return (
    <div className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="brand-text">
            <h1>AI Agent</h1>
            <p>Your Personal Task Automation Assistant</p>
          </div>
        </div>
      </div>

      {/* Home Button */}
      <div className="sidebar-home-section">
        <button 
          onClick={handleGoHome}
          className="home-button"
          title="Go to Home"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Home</span>
        </button>
      </div>

      {/* Sessions List */}
      <div className="sessions-container">
        <div className="sessions-title">
          Recent Automation Tasks
        </div>
        
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <span className="loading-text">Loading tasks...</span>
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="empty-text">Connection Error</p>
            <p className="empty-subtitle">{error}</p>
            <p className="empty-subtext">Using sample data for testing</p>
          </div>
        ) : displayHistory.length > 0 ? (
          <div>
            {displayHistory.map((item, index) => (
              <div
                key={index}
                onClick={() => handleSessionSelect(item)}
                className={`session-item ${selectedSessionId === item.session_id ? 'active' : ''}`}
              >
                <div className="session-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="session-info">
                  <div className="session-title">
                    {item.title || `Task ${item.session_id}`}
                  </div>
                  <div className="session-id">
                    {item.session_id}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="empty-text">No automation tasks yet</p>
            <p className="empty-subtext">Create your first AI-powered task</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="ai-status">
          <div className="status-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="status-text">
            <h3>AI Agent</h3>
            <p>Ready to automate tasks</p>
          </div>
        </div>
      </div>
    </div>
  );
}
