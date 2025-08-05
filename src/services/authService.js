const User = require("../models/User")
const { generateToken } = require("../configs/jwt")
const { createError } = require("../utils/errorUtils")

class AuthService {
  async createUser(userData) {
    try {
      const user = await User.create(userData)
      return user
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0]
        throw createError(400, `${field} already exists`)
      }
      throw error
    }
  }

  async authenticateUser(identifier, password) {
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select("+password")

    if (!user || user.isLocked || !user.isActive) {
      throw createError(401, "Invalid credentials or account locked")
    }

    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      await user.incLoginAttempts()
      throw createError(401, "Invalid credentials")
    }

    await user.resetLoginAttempts()
    return user
  }

  generateAuthToken(user) {
    return generateToken({
      userId: user._id,
      role: user.role,
    })
  }

  async getUserById(userId) {
    const user = await User.findById(userId)
    if (!user) {
      throw createError(404, "User not found")
    }
    return user
  }
}

module.exports = new AuthService()
