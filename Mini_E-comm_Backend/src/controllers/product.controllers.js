import productModel from "../models/product.model.js";
import { uploadFile } from "../services/storage.services.js";

function parseBoolean(value) {
  if (value === undefined) return undefined;
  return value === true || value === "true";
}

function buildProductData(body, userId, file) {
  const data = {
    title: body.title,
    description: body.description,
    price: {
      amount: Number(body.priceAmount),
      currency: body.currency || "INR",
    },
    stock: body.stock === undefined ? 0 : Number(body.stock),
    seller: userId,
    published: parseBoolean(body.published) ?? false,
  };

  if (file) {
    data.image = [file.url];
  }

  return data;
}

async function uploadProductImage(file) {
  const uploadedFile = await uploadFile({
    buffer: file.buffer,
    fileName: `${Date.now()}-${file.originalname}`,
  });

  return uploadedFile.url;
}

export async function createProduct(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Product image is required" });
    }

    const imageUrl = await uploadProductImage(req.file);
    const product = await productModel.create({
      ...buildProductData(req.body, req.user.userId),
      image: [imageUrl],
    });

    return res.status(201).json({
      message: "Product created successfully",
      data: { product },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to create product",
      error: error.message,
    });
  }
}

export async function getAllProducts(req, res) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const [products, total] = await Promise.all([
      productModel
        .find({ published: true })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      productModel.countDocuments({ published: true }),
    ]);

    return res.status(200).json({
      message: "Products fetched successfully",
      data: { products, pagination: { page, limit, total } },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Unable to fetch products", error: error.message });
  }
}

export async function getProductById(req, res) {
  try {
    const product = await productModel.findOne({
      _id: req.params.id,
      published: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res
      .status(200)
      .json({ message: "Product fetched successfully", data: { product } });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Unable to fetch product", error: error.message });
  }
}

export async function updateProduct(req, res) {
  try {
    const product = await productModel.findOne({
      _id: req.params.id,
      seller: req.user.userId,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updates = {};
    ["title", "description", "currency"].forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "currency") updates["price.currency"] = req.body[field];
        else updates[field] = req.body[field];
      }
    });
    if (req.body.priceAmount !== undefined)
      updates["price.amount"] = Number(req.body.priceAmount);
    if (req.body.stock !== undefined) updates.stock = Number(req.body.stock);
    if (req.body.published !== undefined)
      updates.published = parseBoolean(req.body.published);
    if (req.file) updates.image = [await uploadProductImage(req.file)];

    const updatedProduct = await productModel.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    return res
      .status(200)
      .json({
        message: "Product updated successfully",
        data: { product: updatedProduct },
      });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Unable to update product", error: error.message });
  }
}

export async function deleteProduct(req, res) {
  try {
    const product = await productModel.findOneAndDelete({
      _id: req.params.id,
      seller: req.user.userId,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res
      .status(200)
      .json({ message: "Product deleted successfully", data: { product } });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Unable to delete product", error: error.message });
  }
}
