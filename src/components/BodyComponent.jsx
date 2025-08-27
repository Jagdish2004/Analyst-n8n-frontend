import React, { useState } from "react";
import { SideBar } from "./SideBar";
import { ChatInterface } from "./ChatInterface";

export default function App() {
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  return (
    <div style={{ display: "flex" }}>
      <SideBar onSelectSession={setSelectedSessionId} />
      <ChatInterface sessionId={selectedSessionId }/>
    </div>
  );
}