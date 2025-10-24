import { z } from "zod";

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters" })
    .max(30, { message: "First name must be at most 30 characters" }),

  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters" })
    .max(30, { message: "Last name must be at most 30 characters" }),

  email: z.email({ message: "Invalid email address" }),

  password: z
    .string()
    .min(5, { message: "Password must be at least 5 characters" })
    .max(100, { message: "Password must be at most 100 characters" }),
});

export const loginSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(5, { message: "Password must be at least 5 characters" }),
});
