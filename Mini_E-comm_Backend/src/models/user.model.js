import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 2, //I have choosen 2 because "OM"
    maxLength: 50,
  },
  email: {
    type: String,
    required: true,
    match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
    minLength: 6,
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "seller"],
  },
  refreshToken: {
    type: String,
  },
});

const userModel = mongoose.model("users", userSchema);
export default userModel;
