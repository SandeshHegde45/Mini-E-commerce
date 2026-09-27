import { readAccessToken } from "../utils/auth.utils.js";

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!accessToken) {
    return res.status(401).json({
      message: "Access token is not found",
    });
  }

  try {
    const decoded = readAccessToken(accessToken);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid access token",
    });
  }
}

export function authenticateSeller(req, res, next) {
  if (req.user?.role !== "seller") {
    return res.status(403).json({
      message: "Seller access is required",
    });
  }

  next();
}
