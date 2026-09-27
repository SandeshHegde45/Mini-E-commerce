import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 100,
    },
    description: {
      type: String,
      required: true,
      minLength: 20,
      maxLength: 500,
    },
    image: {
      type: [
        {
          type: String,
        },
      ],
      validate: {
        validator: (image) => image.length === 1,
        message: "A product should have only one image",
      },
    },
    price: {
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        enum: ["INR", "USD"],
        default: "INR",
      },
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    seller: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      required: true,
    },
    published: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const productModel = mongoose.model("products", productSchema);

export default productModel;
