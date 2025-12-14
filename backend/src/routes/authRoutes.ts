import express from "express";
import { login, register } from "../controllers/authController";
import validateBody from "../middleware/validateBody";
import { loginSchema, registerSchema } from "../validators/authValidation";

/**
 * Authentication routes
 * - No authentication required
 * - Request bodies are validated
 */
const router = express.Router();

router.post("/login", validateBody(loginSchema), login);
router.post("/register", validateBody(registerSchema), register);

export default router;
