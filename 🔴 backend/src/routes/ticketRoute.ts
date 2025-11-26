import express from "express";
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
} from "../controllers/ticketController";
import validateBody from "../middleware/validateBody";
import { createTicketSchema } from "../validators/ticketValidation";
import requireAuth from "../middleware/requireAuth";

const router = express.Router();

router.post("/", requireAuth, validateBody(createTicketSchema), createTicket);

router.get("/", requireAuth, getTickets);

router.get("/:id", requireAuth, getTicketById);

router.patch("/:id", requireAuth, updateTicket);

router.delete("/:id", requireAuth, deleteTicket);

export default router;
