import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { createAccessToken, createRefreshToken, readRefreshToken } from "../utils/auth.utils.js";
export async function register(req, res) {
  const { name, email, password } = req.body;

  const isUserExists = await userModel.findOne({ email });

  if (isUserExists) {
    return res.status(409).json({
      message: "User already exists with this email address",
      errors: [
        {
          field: "email",
          message: "Duplicate Email address",
        },
      ],
    });
  }

  const user = await userModel.create({
    email,
    name,
    passwordHash: await bcrypt.hash(password, 10),
  });

  const accessToken = createAccessToken({
    userId: user._id,
    role: user.role,
  });

  const refreshToken = createRefreshToken({
    userId: user._id,
    role: user.role,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
  });

  await userModel.findByIdAndUpdate(user._id, { refreshToken });

  res.status(201).json({
    message: "User created successfully",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    },
  });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await userModel.findOne({
    email,
  });
  if (!user) {
    return res.status(400).json({
      message: "Invalid email or password",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return res.status(400).json({
      message: "Invalid email or password",
    });
  }

  const accessToken = createAccessToken({
    userId: user._id,
    role: user.role,
  });

  const refreshToken = createRefreshToken({
    userId: user._id,
    role: user.role,
  });

  await userModel.findByIdAndUpdate(user._id, {
    refreshToken,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
  });

  res.status(200).json({
    message: "User logged in successfully",
    data: {
      user: {
        userId: user._id,
        email: user.email,
        name: user.name,
      },
      accessToken,
    },
  });
}

export async function refresh(req, res) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({
      message: "Refresh token required.",
    });
  }
  try {
    const decoded = readRefreshToken(refreshToken);
    const { userId, role } = decoded;
    const user = await userModel.findById(userId);
    if (refreshToken != user.refreshToken) {
      await userModel.findByIdAndUpdate(user._id, {
        refreshToken: null,
        isAccountFreeze: true,
      });
      return res.status(401).json({
        message: "Refresh token mismatch",
      });
    }
    const accessToken = createAccessToken({
      userId,
      role,
    });
    const newRefreshToken = createRefreshToken({
      userId,
      role,
    });

    await userModel.findByIdAndUpdate(user._id, {
      refreshToken: newRefreshToken,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
    });

    res.status(200).json({
      message: "Tokens Rotated successfully",
      data: {
        user: {
          userId: user._id,
          email: user.email,
          name: user.name,
        },
        accessToken,
      },
    });
  } catch (error) {
    return res.status(401).json({
      message: "Invalid refresh token",
    });
  }
}
export async function getMe(req, res) {
  const { userId } = req.user
  const user = await userModel.findById(userId)
  res.status(200).json({
    message: "User data fetched successfully.",
    data: {
      user: {
        email:user.email,
        name:user.name,
        id:user._id
      }
    }
  })
}

export async function logout(req, res) {
  const { userId } = req.user;

  await userModel.findByIdAndUpdate(userId, {
    refreshToken: null,
  });

  res.clearCookie("refreshToken");

  return res.status(200).json({
    message: "Logout successful",
  });
}
