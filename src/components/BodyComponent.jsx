import React, { useState } from "react";
import { SideBar } from "./SideBar";
import { ChatInterface } from "./ChatInterface";

export default function BodyComponent() {
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [selectedSessionTitle, setSelectedSessionTitle] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSessionSelect = (sessionId, sessionTitle) => {
    setSelectedSessionId(sessionId);
    setSelectedSessionTitle(sessionTitle);
  };

  const handleSessionCreated = (sessionId, sessionTitle) => {
    console.log("🎯 BodyComponent: Session created callback received:", { sessionId, sessionTitle });
    setSelectedSessionId(sessionId);
    setSelectedSessionTitle(sessionTitle);
    console.log("✅ BodyComponent: State updated:", { selectedSessionId: sessionId, selectedSessionTitle: sessionTitle });
  };

  return (
    <div className="chat-layout">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="mobile-toggle"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${!sidebarOpen ? 'mobile-hidden' : ''}`}>
        <SideBar 
          onSelectSession={handleSessionSelect}
          selectedSessionId={selectedSessionId}
        />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main chat area */}
      <div className="chat-main">
        <ChatInterface 
          sessionId={selectedSessionId}
          sessionTitle={selectedSessionTitle}
          onSessionCreated={handleSessionCreated}
        />
      </div>
    </div>
  );
}