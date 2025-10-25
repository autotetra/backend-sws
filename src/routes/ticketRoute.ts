import express from "express";
import createTicket from "../controllers/ticketController";
import validateBody from "../middleware/validateBody";
import { createTicketSchema } from "../validators/ticketValidation";
import requireAuth from "../middleware/requireAuth";

const router = express.Router();

router.post("/", requireAuth, validateBody(createTicketSchema), createTicket);

export default router;
