import express from "express";
import {
  createTicket,
  getTickets,
  getTicketById,
} from "../controllers/ticketController";
import validateBody from "../middleware/validateBody";
import { createTicketSchema } from "../validators/ticketValidation";
import requireAuth from "../middleware/requireAuth";

const router = express.Router();

router.post("/", requireAuth, validateBody(createTicketSchema), createTicket);

router.get("/", requireAuth, getTickets);

router.get("/:id", requireAuth, getTicketById);

export default router;
