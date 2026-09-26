import express from "express";
import { loginValidator, registerValidator } from "../validators/auth.validators.js";
import { getMe, login, logout, refresh, register } from "../controllers/auth.controllers.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router()

router.post("/register", registerValidator, register);

router.post("/login", loginValidator, login);

router.post("/refresh-token", refresh);

router.get("/me", authenticate, getMe);

router.post("/logout", authenticate, logout);
export default router;