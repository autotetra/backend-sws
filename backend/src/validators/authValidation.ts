import { z } from "zod";

/**
 * Simple email regex.
 * Sufficient for validation (not RFC-perfect by design).
 */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Register validation schema.
 */
export const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(30, "First name must be at most 30 characters"),

  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(30, "Last name must be at most 30 characters"),

  email: z.string().refine((value) => emailRegex.test(value), {
    message: "Invalid email address",
  }),

  password: z
    .string()
    .min(5, "Password must be at least 5 characters")
    .max(100, "Password must be at most 100 characters"),
});

/**
 * Login validation schema.
 */
export const loginSchema = z.object({
  email: z.string().refine((value) => emailRegex.test(value), {
    message: "Invalid email address",
  }),

  password: z.string().min(5, "Password must be at least 5 characters"),
});
