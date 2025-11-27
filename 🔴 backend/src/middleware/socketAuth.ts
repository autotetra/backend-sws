import jwt from "jsonwebtoken";
import User from "../models/userModel";

export const socketAuth = async (socket: any, next: any) => {
  try {
    const rawCookie = socket.request.headers.cookie;
    if (!rawCookie) return next();

    const tokenCookie = rawCookie
      .split(";")
      .map((c: string) => c.trim())
      .find((c: string) => c.startsWith("token="))
      ?.split("=")[1];

    if (!tokenCookie) return next();

    const decoded = jwt.verify(tokenCookie, process.env.JWT_SECRET!) as any;

    const user = await User.findById(decoded.id);

    if (user) {
      (socket as any).user = user;
    }

    next();
  } catch (err) {
    next(); // just connect as unauthenticated
  }
};
