import express from "express";
import { registerValidator } from "../validators/auth.validators.js";
import { register } from "../controllers/auth.controllers.js";

const router = express.Router()

router.post("/register", registerValidator, register);
export default router;