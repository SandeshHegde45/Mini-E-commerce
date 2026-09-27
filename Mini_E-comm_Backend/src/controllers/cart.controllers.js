import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";

export async function addToCart(req, res) {
  try {
    const { productId } = req.body;
    const quantity = Number(req.body.quantity);
    const product = await productModel.findOne({
      _id: productId,
      published: true,
    });

    if (!product) {
      return res.status(404).json({
        message: "Published product not found",
      });
    }

    if (product.stock < 1) {
      return res.status(409).json({
        message: "Product is out of stock",
      });
    }

    let cart = await cartModel.findOne({ user: req.user.userId });
    if (!cart) {
      cart = new cartModel({ user: req.user.userId, items: [] });
    }

    const item = cart.items.find(
      (cartItem) => cartItem.product.toString() === productId,
    );
    const nextQuantity = item ? item.quantity + quantity : quantity;

    if (nextQuantity > product.stock) {
      return res.status(409).json({
        message: `Only ${product.stock} item(s) available in stock`,
        availableStock: product.stock,
      });
    }

    if (item) {
      item.quantity = nextQuantity;
    } else {
      cart.items.push({ product: product._id, quantity });
    }

    await cart.save();

    const populatedCart = await cartModel
      .findById(cart._id)
      .populate("items.product");

    return res.status(200).json({
      message: "Product added to cart successfully",
      data: { cart: populatedCart },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Cart already exists; please retry the request",
      });
    }

    return res.status(500).json({
      message: "Unable to add product to cart",
      error: error.message,
    });
  }
}

export async function getCart(req, res) {
  try {
    const cart = await cartModel
      .findOne({ user: req.user.userId })
      .populate("items.product");

    if (!cart) {
      return res.status(200).json({
        message: "Cart fetched successfully",
        data: {
          cart: {
            items: [],
            totalItems: 0,
            totalAmount: 0,
          },
        },
      });
    }

    let totalItems = 0;
    let totalAmount = 0;
    const items = cart.items.map((item) => {
      const product = item.product;
      const available = Boolean(
        product?.published && product.stock >= item.quantity,
      );
      const subtotal = product ? product.price.amount * item.quantity : 0;

      totalItems += item.quantity;
      totalAmount += subtotal;

      return {
        product,
        quantity: item.quantity,
        subtotal,
        available,
      };
    });

    return res.status(200).json({
      message: "Cart fetched successfully",
      data: {
        cart: {
          id: cart._id,
          items,
          totalItems,
          totalAmount,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to fetch cart",
      error: error.message,
    });
  }
}
