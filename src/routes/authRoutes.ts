import express from "express";
import { login, register } from "../controllers/authController";
import validateBody from "../middleware/validateBody";
import { registerSchema, loginSchema } from "../validators/authValidation";
import requireAuth from "../middleware/requireAuth";
import requireRole from "../middleware/requireRole";

const router = express.Router();

// POST /api/auth/login
router.post("/login", validateBody(loginSchema), login);

// POST /api/auth/register
router.post("/register", validateBody(registerSchema), register);

// Protected routes
router.get("/adminOnly", requireAuth, requireRole("admin"), (req, res) => {
  res.status(200).json({ message: "Hello Admin" });
});

router.get(
  "/internalOnly",
  requireAuth,
  requireRole("internal"),
  (req, res) => {
    res.status(200).json({ message: "Hello Internal User" });
  }
);

router.get("/userOnly", requireAuth, requireRole("user"), (req, res) => {
  res.status(200).json({ message: "Hello User" });
});

export default router;
