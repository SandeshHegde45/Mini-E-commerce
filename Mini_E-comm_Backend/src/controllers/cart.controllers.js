import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";

// Shape a populated cart document into the response the UI needs.
function buildCartData(cart) {
  let totalItems = 0;
  let totalAmount = 0;

  const items = cart.items
    .filter((item) => item.product)
    .map((item) => {
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

  return { id: cart._id, items, totalItems, totalAmount };
}

const emptyCartData = { items: [], totalItems: 0, totalAmount: 0 };

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
        data: { cart: emptyCartData },
      });
    }

    return res.status(200).json({
      message: "Cart fetched successfully",
      data: { cart: buildCartData(cart) },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to fetch cart",
      error: error.message,
    });
  }
}

// PATCH /api/cart  { productId, quantity } — sets the quantity of an item already in the cart.
export async function updateCartItem(req, res) {
  try {
    const { productId } = req.body;
    const quantity = Number(req.body.quantity);

    const cart = await cartModel.findOne({ user: req.user.userId });
    const item = cart?.items.find(
      (cartItem) => cartItem.product.toString() === productId,
    );

    if (!item) {
      return res.status(404).json({
        message: "Item not found in cart",
      });
    }

    const product = await productModel.findOne({
      _id: productId,
      published: true,
    });

    if (!product) {
      return res.status(404).json({
        message: "Published product not found",
      });
    }

    if (quantity > product.stock) {
      return res.status(409).json({
        message: `Only ${product.stock} item(s) available in stock`,
        availableStock: product.stock,
      });
    }

    item.quantity = quantity;
    await cart.save();

    const populatedCart = await cartModel
      .findById(cart._id)
      .populate("items.product");

    return res.status(200).json({
      message: "Cart item updated successfully",
      data: { cart: buildCartData(populatedCart) },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to update cart item",
      error: error.message,
    });
  }
}

// DELETE /api/cart/:productId — removes one item from the cart.
export async function removeCartItem(req, res) {
  try {
    const { productId } = req.params;

    const cart = await cartModel.findOne({ user: req.user.userId });
    const hasItem = cart?.items.some(
      (cartItem) => cartItem.product.toString() === productId,
    );

    if (!hasItem) {
      return res.status(404).json({
        message: "Item not found in cart",
      });
    }

    cart.items = cart.items.filter(
      (cartItem) => cartItem.product.toString() !== productId,
    );
    await cart.save();

    const populatedCart = await cartModel
      .findById(cart._id)
      .populate("items.product");

    return res.status(200).json({
      message: "Item removed from cart successfully",
      data: { cart: buildCartData(populatedCart) },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to remove item from cart",
      error: error.message,
    });
  }
}

// DELETE /api/cart — empties the cart.
export async function clearCart(req, res) {
  try {
    await cartModel.findOneAndUpdate(
      { user: req.user.userId },
      { $set: { items: [] } },
    );

    return res.status(200).json({
      message: "Cart cleared successfully",
      data: { cart: emptyCartData },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to clear cart",
      error: error.message,
    });
  }
}

export async function checkoutCart(req, res) {
  const reservedItems = [];

  try {
    const cart = await cartModel
      .findOne({ user: req.user.userId })
      .populate("items.product");

    if (!cart?.items.length) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    for (const item of cart.items) {
      const product = item.product;
      if (!product) {
        await releaseReservedStock(reservedItems);
        return res
          .status(409)
          .json({ message: "A cart product is no longer available" });
      }

      const result = await productModel.updateOne(
        {
          _id: product._id,
          published: true,
          stock: { $gte: item.quantity },
        },
        { $inc: { stock: -item.quantity } },
      );

      if (result.modifiedCount !== 1) {
        await releaseReservedStock(reservedItems);
        return res.status(409).json({
          message: `${product.title} no longer has enough stock`,
        });
      }

      reservedItems.push({ productId: product._id, quantity: item.quantity });
    }

    await cartModel.updateOne({ _id: cart._id }, { $set: { items: [] } });

    return res.status(200).json({
      message: "Order placed successfully",
      data: { productIds: reservedItems.map(({ productId }) => productId) },
    });
  } catch (error) {
    await releaseReservedStock(reservedItems);
    return res.status(500).json({
      message: "Unable to place order",
      error: error.message,
    });
  }
}

async function releaseReservedStock(items) {
  await Promise.all(
    items.map(({ productId, quantity }) =>
      productModel.updateOne({ _id: productId }, { $inc: { stock: quantity } }),
    ),
  );
  items.length = 0;
}
