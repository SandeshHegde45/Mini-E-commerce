import { body, validationResult } from "express-validator";
import mongoose from "mongoose";

export const addToCartValidator = [
  body("productId").isMongoId().withMessage("A valid productId is required"),
  body("quantity")
    .isInt({ min: 1, max: 99 })
    .withMessage("Quantity must be an integer between 1 and 99"),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid cart item",
        errors: errors.array(),
      });
    }

    next();
  },
];

export const cartProductIdValidator = [
  body("productId")
    .custom((productId) => mongoose.isValidObjectId(productId))
    .withMessage("A valid productId is required"),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid cart item",
        errors: errors.array(),
      });
    }

    next();
  },
];
