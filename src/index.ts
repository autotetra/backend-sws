import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (socket) => {
  console.log("🟢 A user connected");

  socket.on("message", (message) => {
    console.log("📩 Received:", message.toString());
    socket.send(`Server received: ${message}`);
  });

  socket.on("close", () => {
    console.log("🔴 A user disconnected");
  });
});
