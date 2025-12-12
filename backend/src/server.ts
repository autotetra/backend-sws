import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes";

import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import ticketRoutes from "./routes/ticketRoute";
import { socketAuth } from "./middleware/socketAuth";

// Load environment variables
dotenv.config();

if (!process.env.CLIENT_ORIGIN) {
  throw new Error("❌ CLIENT_ORIGIN is not defined in .env");
}

// Initialize Express app & HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// 🔥 WebSocket auth middleware
io.use(socketAuth);

// Handle WebSocket connections
io.on("connection", (socket) => {
  const user = (socket as any).user;

  console.log(`✅ WebSocket connected: ${user?.email || "Unknown user"}`);

  // Join user to their own room
  if (user?._id) {
    socket.join(user._id.toString());

    // Join role-based room (for internal/admin)
    if (user.role === "Admin" || user.role === "Agent") {
      socket.join("staff");
    }
  }

  socket.on("disconnect", () => {
    console.log(`❌ WebSocket disconnected: ${user?.email || "Unknown user"}`);
  });
});

// Middleware
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());

// Connect to MongoDB
connectDB();

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/users", userRoutes);

// Test route
app.get("/test", (_req, res) => {
  res.send("Server is running ✅");
});

// Start server
const PORT = process.env.PORT || 5050;
server.listen(PORT, () => {
  console.log(`🚀 Server + WebSocket running on port ${PORT}`);
});

export { io };
