import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import cors from "cors";
import cookieParser from "cookie-parser";
import ticketRoutes from "./routes/ticketRoute";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Test route
app.get("/test", (req, res) => res.send("Server is running"));

// Cookier parser middleware
app.use(cookieParser());

// Enable CORS
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
connectDB();

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);

// Start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
