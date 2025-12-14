import express from "express";
import requireAuth from "../middleware/requireAuth";
import requireRole from "../middleware/requireRole";
import {
  getUsers,
  createUser,
  deleteUser,
  updateUser,
} from "../controllers/userController";

/**
 * User management routes
 * - Authentication required
 * - Admin-only access
 */
const router = express.Router();

router.use(requireAuth);

// Admin-only user management
router.get("/", requireRole("Admin"), getUsers);
router.post("/", requireRole("Admin"), createUser);
router.patch("/:id", requireRole("Admin"), updateUser);
router.delete("/:id", requireRole("Admin"), deleteUser);

export default router;
