import { Router } from "express";
import {
  authenticate,
  authenticateSeller,
} from "../middlewares/auth.middleware.js";
import { upload } from "../services/storage.services.js";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "../controllers/product.controllers.js";
import {
  createProductValidator,
  productIdOnlyValidator,
  updateProductValidator,
} from "../validators/product.validators.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authenticateSeller,
  upload.single("image"),
  createProductValidator,
  createProduct,
);
router.get("/", getAllProducts);
router.get("/:id", productIdOnlyValidator, getProductById);
router.put(
  "/:id",
  authenticate,
  authenticateSeller,
  upload.single("image"),
  updateProductValidator,
  updateProduct,
);
router.delete(
  "/:id",
  authenticate,
  authenticateSeller,
  productIdOnlyValidator,
  deleteProduct,
);

export default router;
