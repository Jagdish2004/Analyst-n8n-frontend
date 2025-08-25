import { io } from "socket.io-client";

function initClient() {
  const socket = io("http://localhost:3000");

  socket.on("connect", () => {
    console.log("✅ Connected to server with ID:", socket.id);
    socket.emit("message", "Client: Hello from client!");
  });
  
  socket.on("message", (msg) => {
    console.log("📩 Server says:", msg);
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected from server");
  });

  return socket;
}
export default initClient;
