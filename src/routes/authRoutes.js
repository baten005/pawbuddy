const express = require("express")
const {
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
} = require("../controllers/authController")
const { authenticate, authorize } = require("../middlewares/auth")
const {
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateCreateUser,
  validateUpdateUser,
  validateResetPassword,
  validateId,
  validatePagination,
} = require("../middlewares/validation")

const router = express.Router()

// Public routes
router.post("/register", register)
router.post("/login", login)

// Protected routes
router.get("/me", authenticate, getMe)
router.put("/change-password", authenticate, validateChangePassword, changePassword)

// Admin only routes
router.use(authenticate, authorize("admin"))

router.get("/users", validatePagination, getUsers)
router.get("/users/:id", validateId, getUser)
router.post("/users", validateCreateUser, createUser)
router.put("/users/:id", validateId, validateUpdateUser, updateUser)
router.delete("/users/:id", validateId, deleteUser)
router.patch("/users/:id/toggle-status", validateId, toggleUserStatus)
router.patch("/users/:id/reset-password", validateId, validateResetPassword, resetUserPassword)
router.get("/stats", getUserStats)

module.exports = router
