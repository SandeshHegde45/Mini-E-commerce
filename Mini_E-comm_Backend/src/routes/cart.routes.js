import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { addToCart, getCart } from "../controllers/cart.controllers.js";
import { addToCartValidator } from "../validators/cart.validators.js";

const router = Router();

router.post("/", authenticate, addToCartValidator, addToCart);
router.get("/", authenticate, getCart);

export default router;
