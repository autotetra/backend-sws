import { z } from "zod";

/**
 * Ticket creation validation schema.
 */
export const createTicketSchema = z.object({
  title: z.string().min(1, "Title is required"),

  description: z.string().optional(),

  category: z.enum(["Billing", "Technical", "General"], {
    message: "Invalid category",
  }),
});
