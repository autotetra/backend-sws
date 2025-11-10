import { z } from "zod";

// Basic email regex (commonly used and safe for most apps)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters" })
    .max(30, { message: "First name must be at most 30 characters" }),

  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters" })
    .max(30, { message: "Last name must be at most 30 characters" }),

  email: z.string().refine((val) => emailRegex.test(val), {
    message: "Invalid email address",
  }),

  password: z
    .string()
    .min(5, { message: "Password must be at least 5 characters" })
    .max(100, { message: "Password must be at most 100 characters" }),
});

export const loginSchema = z.object({
  email: z.string().refine((val) => emailRegex.test(val), {
    message: "Invalid email address",
  }),
  password: z
    .string()
    .min(5, { message: "Password must be at least 5 characters" }),
});
