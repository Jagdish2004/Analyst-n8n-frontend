import React, { useEffect, useState } from "react";

export function SideBar({ onSelectSession }) {
  const [displayHistory, setDisplayHistory] = useState([]);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch("http://localhost:3000/history");
        const data = await response.json();
        setDisplayHistory(data); // store fetched history
      } catch (error) {
        console.error("❌ Error fetching history:", error);
      }
    }

    fetchHistory();
  }, []);
  return (
    <div className="sidebar">
      <h2>Sidebar</h2>
      <ul>
        {displayHistory.length > 0 ? (
          displayHistory.map((item, index) => (
            <li key={index} style={{cursor:"pointer"}} onClick={() => onSelectSession && onSelectSession(item.session_id)}>
             {item.title}
            </li>
          ))
        ) : (
          <li>No history found</li>
        )}
      </ul>
    </div>
  );
}
