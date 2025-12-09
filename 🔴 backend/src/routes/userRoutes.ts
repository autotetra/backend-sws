import express from "express";
import requireAuth from "../middleware/requireAuth";
import requireRole from "../middleware/requireRole";
import {
  getUsers,
  createUser,
  deleteUser,
  updateUser,
} from "../controllers/userController";

const router = express.Router();

router.use(requireAuth);

// For now, only admin can manage users.
// If later you want agents to also create users, just add "agent" here.
router.get("/", requireRole("Admin"), getUsers);
router.post("/", requireRole("Admin"), createUser);
router.delete("/:id", requireRole("Admin"), deleteUser);
router.patch("/:id", requireRole("Admin"), updateUser);

export default router;
