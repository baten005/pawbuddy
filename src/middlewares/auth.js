const { verifyToken } = require("../configs/jwt")
const User = require("../models/User")
const { createError } = require("../utils/errorUtils")

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(createError(401, "Access token is required"))
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    if (!token) {
      return next(createError(401, "Access token is required"))
    }

    // Verify token
    const decoded = verifyToken(token)

    // Find user
    const user = await User.findById(decoded.id).select("-password")

    if (!user) {
      return next(createError(401, "User not found"))
    }

    if (!user.isActive) {
      return next(createError(401, "Account is deactivated"))
    }

    if (user.isLocked) {
      return next(createError(401, "Account is temporarily locked"))
    }

    // Attach user to request
    req.user = user
    next()
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(createError(401, "Invalid token"))
    }
    if (error.name === "TokenExpiredError") {
      return next(createError(401, "Token expired"))
    }
    next(createError(401, "Authentication failed"))
  }
}

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createError(401, "Authentication required"))
    }

    if (!roles.includes(req.user.role)) {
      return next(createError(403, "Insufficient permissions"))
    }

    next()
  }
}

module.exports = {
  authenticate,
  authorize,
}
