import { z } from "zod";

export const createTicketSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  category: z.enum(["billing", "techincal", "general"], {
    message: "Invalid category",
  }),
});
