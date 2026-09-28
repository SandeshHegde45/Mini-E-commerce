import { body, param, validationResult } from "express-validator";
import mongoose from "mongoose";

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Invalid cart item",
      errors: errors.array(),
    });
  }

  next();
};

// Used by POST /api/cart and PATCH /api/cart
export const addToCartValidator = [
  body("productId").isMongoId().withMessage("A valid productId is required"),
  body("quantity")
    .isInt({ min: 1, max: 99 })
    .withMessage("Quantity must be an integer between 1 and 99"),
  validateRequest,
];

export const cartProductIdValidator = [
  body("productId")
    .custom((productId) => mongoose.isValidObjectId(productId))
    .withMessage("A valid productId is required"),
  validateRequest,
];

// Used by DELETE /api/cart/:productId
export const removeCartItemValidator = [
  param("productId").isMongoId().withMessage("A valid productId is required"),
  validateRequest,
];
