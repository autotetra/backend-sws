import express from "express";
import {
  getAllUsers,
  createUserAsAdmin,
} from "../controllers/adminUserController";
import requireAuth from "../middleware/requireAuth";
import requireRole from "../middleware/requireRole";

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("admin"));

router.get("/users", getAllUsers);
router.post("/users", createUserAsAdmin);

export default router;
