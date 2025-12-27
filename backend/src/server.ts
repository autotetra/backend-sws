import dotenv from "dotenv";
import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import ticketRoutes from "./routes/ticketRoute";
import userRoutes from "./routes/userRoutes";
import { socketAuth } from "./middleware/socketAuth";

// ---------------------------------------------------
// ENV SETUP
// ---------------------------------------------------
dotenv.config();

if (!process.env.CLIENT_ORIGIN) {
  throw new Error("❌ CLIENT_ORIGIN is not defined in .env");
}

// ---------------------------------------------------
// EXPRESS & HTTP SERVER
// ---------------------------------------------------
const app = express();
const server = http.createServer(app);

// ---------------------------------------------------
// SOCKET.IO SETUP
// ---------------------------------------------------
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Attach authentication middleware to Socket.IO
io.use(socketAuth);

// Handle WebSocket connections
io.on("connection", (socket) => {
  const user = (socket as any).user;

  console.log(`✅ WebSocket connected: ${user?.email || "Unknown user"}`);

  /**
   * Room strategy:
   * - Each user joins their own private room (userId)
   * - Admins & Agents additionally join the shared "staff" room
   */
  if (user?._id) {
    socket.join(user._id.toString());

    if (user.role === "Admin" || user.role === "Agent") {
      socket.join("staff");
    }
  }

  socket.on("disconnect", () => {
    console.log(`❌ WebSocket disconnected: ${user?.email || "Unknown user"}`);
  });
});

// ---------------------------------------------------
// MIDDLEWARE
// ---------------------------------------------------
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());

// ---------------------------------------------------
// DATABASE
// ---------------------------------------------------
connectDB();

// ---------------------------------------------------
// ROUTES
// ---------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/users", userRoutes);

// ---------------------------------------------------
// START SERVER
// ---------------------------------------------------
const PORT = process.env.PORT || 5050;

server.listen(PORT, () => {
  console.log(`🚀 Server + WebSocket running on port ${PORT}`);
});

// Export Socket.IO instance for emitters
export { io };

// ---------------------------------------------------
// HEALTH CHECK
// ---------------------------------------------------
app.get("/test", (_req, res) => {
  res.send("Server is running ✅");
});
