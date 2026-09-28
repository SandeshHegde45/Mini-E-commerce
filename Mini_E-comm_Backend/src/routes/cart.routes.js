import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  addToCart,
  checkoutCart,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../controllers/cart.controllers.js";
import {
  addToCartValidator,
  removeCartItemValidator,
} from "../validators/cart.validators.js";

const router = Router();

router.post("/", authenticate, addToCartValidator, addToCart);
router.get("/", authenticate, getCart);
router.patch("/", authenticate, addToCartValidator, updateCartItem);
router.post("/checkout", authenticate, checkoutCart);
router.delete("/", authenticate, clearCart);
router.delete(
  "/:productId",
  authenticate,
  removeCartItemValidator,
  removeCartItem,
);

export default router;
