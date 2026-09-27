import { body, param, validationResult } from "express-validator";
import mongoose from "mongoose";

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Invalid product data",
      errors: errors.array(),
    });
  }

  next();
};

const productIdValidator = param("id").custom((id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error("Invalid product id");
  }

  return true;
});

export const createProductValidator = [
  body("title")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Title must be between 2 and 100 characters"),
  body("description")
    .trim()
    .isLength({ min: 20, max: 500 })
    .withMessage("Description must be between 20 and 500 characters"),
  body("priceAmount")
    .isFloat({ min: 0 })
    .withMessage("Price amount must be a non-negative number"),
  body("currency")
    .optional()
    .isIn(["INR", "USD"])
    .withMessage("Currency must be INR or USD"),
  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),
  body("published")
    .optional()
    .isBoolean()
    .withMessage("Published must be a boolean"),
  validateRequest,
];

export const updateProductValidator = [
  productIdValidator,
  body("title")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Title must be between 2 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 20, max: 500 })
    .withMessage("Description must be between 20 and 500 characters"),
  body("priceAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price amount must be a non-negative number"),
  body("currency")
    .optional()
    .isIn(["INR", "USD"])
    .withMessage("Currency must be INR or USD"),
  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),
  body("published")
    .optional()
    .isBoolean()
    .withMessage("Published must be a boolean"),
  validateRequest,
];

export const productIdOnlyValidator = [productIdValidator, validateRequest];
