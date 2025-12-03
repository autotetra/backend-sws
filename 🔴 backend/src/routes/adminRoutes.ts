import express from "express";
import {
  getAllUsers,
  createUserAsAdmin,
  deleteUser,
  adminDeleteTicket,
  adminCreateTicket,
} from "../controllers/adminController";
import requireAuth from "../middleware/requireAuth";
import requireRole from "../middleware/requireRole";
import { getTickets } from "../controllers/ticketController";

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("admin"));

router.get("/users", getAllUsers);
router.post("/users", createUserAsAdmin);
router.delete("/users/:id", requireRole("admin"), deleteUser);
router.get("/tickets", getTickets);
router.post("/tickets", adminCreateTicket);
router.delete("/tickets/:id", adminDeleteTicket);

export default router;
