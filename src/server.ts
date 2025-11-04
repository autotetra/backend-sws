import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import ticketRoutes from "./routes/ticketRoute";
import { UserDocument } from "./models/user.model";

// Load environment variables
dotenv.config();

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

// Handle WebSocket connections
io.on("connection", (socket) => {
  const user = (socket as any).user;
  console.log(`✅ WebSocket connected: ${user.email}`);

  // Join user to their own room + role-based room if needed
  socket.join(user._id.toString());
  if (user.role === "admin" || user.role === "internal") {
    socket.join("staff");
  }

  socket.on("disconnect", () => {
    console.log(`❌ WebSocket disconnected: $(user.email)`);
  });
});

// Middleware
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

// Connect to DB
connectDB();

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);

// Test Route
app.get("/test", (req, res) => {
  res.send("Server is running ✅");
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server + WebSocket running on port ${PORT}`);
});

export { io };
