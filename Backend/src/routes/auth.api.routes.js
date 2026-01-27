import express from "express";
import { signup, login, logout } from "../controllers/auth.api.controller.js";
import { validateSignup, validateLogin } from "../middleware/auth.validator.js";

const router = express.Router();

router.post("/signup", validateSignup, signup);
router.post("/login", validateLogin, login);
router.post("/logout", logout);

export default router;
