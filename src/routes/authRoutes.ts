import express from "express";
import { login, register } from "../controllers/authController";
import validateResource from "../middleware/validateResource";
import { registerSchema, loginSchema } from "../validators/authValidation";

const router = express.Router();

// POST /api/auth/login
router.post("/login", validateResource(loginSchema), login);

// POST /api/auth/register
router.post("/register", validateResource(registerSchema), register);

export default router;
