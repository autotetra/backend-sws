import jwt from "jsonwebtoken";
import User from "../models/userModel";

/**
 * Socket.IO authentication middleware.
 *
 * - Reads JWT from `token` cookie
 * - Verifies token
 * - Attaches user document to socket (if valid)
 *
 * IMPORTANT:
 * - Socket connection is NEVER blocked
 * - If auth fails, socket connects as unauthenticated
 */
export const socketAuth = async (socket: any, next: any) => {
  try {
    const rawCookie = socket.request.headers.cookie;
    if (!rawCookie) return next();

    // Extract `token` cookie
    const token = rawCookie
      .split(";")
      .map((c: string) => c.trim())
      .find((c: string) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) return next();

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };

    // Load user from DB
    const user = await User.findById(decoded.id);

    if (user) {
      (socket as any).user = user;
    }

    next();
  } catch (err) {
    // Fail open: allow socket connection without auth
    next();
  }
};
