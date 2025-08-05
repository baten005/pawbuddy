const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { createError } = require("../utils/errorUtils")
const { createResponse } = require("../utils/responseUtils")
const { getPaginationOptions } = require("../utils/paginationUtils")

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      return next(createError(400, "User already exists"))
    }


    // Create user
    const user = await User.create({
      username,
      email,
      password: password,
      role,
    })

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    })

    res.status(201).json(
      createResponse(true, "User registered successfully", {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      }),
    )
  } catch (error) {
    next(error)
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body

    // Check for user
    const user = await User.findOne({ username }).select("+password")

    if (!user || !user.isActive) {
      return next(createError(401, "Invalid credentials"))
    }

    console.log("Plain password:", password)
    console.log("Stored hashed password:", user.password)
    const isMatch = await user.comparePassword(password)

    console.log("Password match:", isMatch)


    if (!isMatch) {
      return next(createError(401, "Invalid credentials"))
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    })

    res.json(
      createResponse(true, "Login successful", {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      }),
    )
  } catch (error) {
    next(error)
  }
}

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)

    res.json(
      createResponse(true, "User retrieved successfully", {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      }),
    )
  } catch (error) {
    next(error)
  }
}

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body

    // Get user with password
    const user = await User.findById(req.user._id).select("+password")

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password)

    if (!isMatch) {
      return next(createError(400, "Current password is incorrect"))
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // Update password
    await User.findByIdAndUpdate(req.user._id, {
      password: hashedPassword,
    })

    res.json(createResponse(true, "Password changed successfully"))
  } catch (error) {
    next(error)
  }
}

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query)
    const { search, role, isActive } = req.query

    // Build query
    const query = {}

    if (search) {
      query.$or = [{ username: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
    }

    if (role) {
      query.role = role
    }

    if (isActive !== undefined) {
      query.isActive = isActive === "true"
    }

    // Execute query with pagination
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ])

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    }

    res.json(
      createResponse(true, "Users retrieved successfully", {
        users,
        pagination,
      }),
    )
  } catch (error) {
    next(error)
  }
}

// @desc    Get single user (Admin only)
// @route   GET /api/auth/users/:id
// @access  Private/Admin
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return next(createError(404, "User not found"))
    }

    res.json(createResponse(true, "User retrieved successfully", { user }))
  } catch (error) {
    next(error)
  }
}

// @desc    Create user (Admin only)
// @route   POST /api/auth/users
// @access  Private/Admin
const createUser = async (req, res, next) => {
  try {
    const { username, email, password, role = "user" } = req.body

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      return next(createError(400, "User already exists"))
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
    })

    res.status(201).json(createResponse(true, "User created successfully", { user }))
  } catch (error) {
    next(error)
  }
}

// @desc    Update user (Admin only)
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
const updateUser = async (req, res, next) => {
  try {
    const { username, email, role, isActive, password } = req.body

    const user = await User.findById(req.params.id)

    if (!user) {
      return next(createError(404, "User not found"))
    }

    // Check if trying to update username/email to existing one
    if (username || email) {
      const existingUser = await User.findOne({
        $and: [
          { _id: { $ne: req.params.id } },
          {
            $or: [...(username ? [{ username }] : []), ...(email ? [{ email }] : [])],
          },
        ],
      })

      if (existingUser) {
        return next(createError(400, "Username or email already exists"))
      }
    }

    // Prepare update data
    const updateData = {}
    if (username) updateData.username = username
    if (email) updateData.email = email
    if (role) updateData.role = role
    if (isActive !== undefined) updateData.isActive = isActive

    // Hash password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10)
      updateData.password = await bcrypt.hash(password, salt)
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })

    res.json(createResponse(true, "User updated successfully", { user: updatedUser }))
  } catch (error) {
    next(error)
  }
}

// @desc    Delete user (Admin only)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return next(createError(404, "User not found"))
    }

    // Prevent self-deletion
    if (req.user._id.toString() === req.params.id) {
      return next(createError(400, "Cannot delete your own account"))
    }

    await User.findByIdAndDelete(req.params.id)

    res.json(createResponse(true, "User deleted successfully"))
  } catch (error) {
    next(error)
  }
}

// @desc    Toggle user status (Admin only)
// @route   PATCH /api/auth/users/:id/toggle-status
// @access  Private/Admin
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return next(createError(404, "User not found"))
    }

    // Prevent self-deactivation
    if (req.user._id.toString() === req.params.id) {
      return next(createError(400, "Cannot modify your own account status"))
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, { isActive: !user.isActive }, { new: true })

    res.json(
      createResponse(true, `User ${updatedUser.isActive ? "activated" : "deactivated"} successfully`, {
        user: updatedUser,
      }),
    )
  } catch (error) {
    next(error)
  }
}

// @desc    Reset user password (Admin only)
// @route   PATCH /api/auth/users/:id/reset-password
// @access  Private/Admin
const resetUserPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body

    const user = await User.findById(req.params.id)

    if (!user) {
      return next(createError(404, "User not found"))
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    await User.findByIdAndUpdate(req.params.id, {
      password: hashedPassword,
    })

    res.json(createResponse(true, "Password reset successfully"))
  } catch (error) {
    next(error)
  }
}

// @desc    Get user statistics (Admin only)
// @route   GET /api/auth/stats
// @access  Private/Admin
const getUserStats = async (req, res, next) => {
  try {
    const [totalUsers, activeUsers, adminUsers, userUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "user" }),
    ])

    const stats = {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      adminUsers,
      userUsers,
    }

    res.json(createResponse(true, "User statistics retrieved successfully", { stats }))
  } catch (error) {
    next(error)
  }
}

module.exports = {
  register,
  login,
  getMe,
  changePassword,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  resetUserPassword,
  getUserStats,
}
