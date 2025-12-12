import express from "express";
import { login, register } from "../controllers/authController";
import validateBody from "../middleware/validateBody";
import { registerSchema, loginSchema } from "../validators/authValidation";

const router = express.Router();

// POST /api/auth/login
router.post("/login", validateBody(loginSchema), login);

// POST /api/auth/register
router.post("/register", validateBody(registerSchema), register);

export default router;
