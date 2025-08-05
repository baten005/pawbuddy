const { body, param, query, validationResult } = require("express-validator")
const { createError } = require("../utils/errorUtils")

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg)
    return next(createError(400, errorMessages.join(", ")))
  }
  next()
}

// Auth validations
const validateRegister = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  body("role").optional().isIn(["user", "admin"]).withMessage("Role must be either user or admin"),
  handleValidationErrors,
]

const validateLogin = [
  //body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
]

const validateChangePassword = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("New password must contain at least one uppercase letter, one lowercase letter, and one number"),
  handleValidationErrors,
]

const validateCreateUser = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  body("role").optional().isIn(["user", "admin"]).withMessage("Role must be either user or admin"),
  handleValidationErrors,
]

const validateUpdateUser = [
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  body("email").optional().isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  body("role").optional().isIn(["user", "admin"]).withMessage("Role must be either user or admin"),
  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
  handleValidationErrors,
]

const validateResetPassword = [
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("New password must contain at least one uppercase letter, one lowercase letter, and one number"),
  handleValidationErrors,
]

// Generic validations
const validateId = [param("id").isMongoId().withMessage("Invalid ID format"), handleValidationErrors]

const validatePagination = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  handleValidationErrors,
]

// Vet Directory validations
const validateVetDirectory = [
  body("hospital")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Hospital name must be between 2 and 100 characters"),
  body("address").trim().isLength({ min: 5, max: 200 }).withMessage("Address must be between 5 and 200 characters"),
  body("phone")
    .trim()
    .matches(/^[+]?[1-9][\d]{0,15}$/)
    .withMessage("Please provide a valid phone number"),
  body("email").optional().isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("website").optional().isURL().withMessage("Please provide a valid website URL"),
  body("services").optional().isArray().withMessage("Services must be an array"),
  body("emergencyService").optional().isBoolean().withMessage("Emergency service must be a boolean"),
  body("rating").optional().isFloat({ min: 0, max: 5 }).withMessage("Rating must be between 0 and 5"),
  handleValidationErrors,
]

// Rescue Team validations
const validateRescueTeam = [
  body("teamName").trim().isLength({ min: 2, max: 100 }).withMessage("Team name must be between 2 and 100 characters"),
  body("teamAddress")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Team address must be between 5 and 200 characters"),
  body("phone")
    .trim()
    .matches(/^[+]?[1-9][\d]{0,15}$/)
    .withMessage("Please provide a valid phone number"),
  body("email").optional().isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("specialization").optional().isArray().withMessage("Specialization must be an array"),
  body("teamSize").optional().isInt({ min: 1, max: 50 }).withMessage("Team size must be between 1 and 50"),
  body("availability")
    .optional()
    .isIn(["24/7", "Business Hours", "Emergency Only"])
    .withMessage("Invalid availability option"),
  body("equipment").optional().isArray().withMessage("Equipment must be an array"),
  handleValidationErrors,
]

// Animal Food validations
const validateAnimalFood = [
  body("foodName").trim().isLength({ min: 2, max: 100 }).withMessage("Food name must be between 2 and 100 characters"),
  body("price").trim().notEmpty().withMessage("Price is required"),
  body("category")
    .optional()
    .isIn(["Dog Food", "Cat Food", "Bird Food", "Fish Food", "Small Animal Food", "Treats", "Supplements"])
    .withMessage("Invalid category"),
  body("brand").optional().trim().isLength({ max: 50 }).withMessage("Brand name cannot exceed 50 characters"),
  body("weight").optional().trim(),
  body("ingredients").optional().isArray().withMessage("Ingredients must be an array"),
  body("ageGroup").optional().isIn(["Puppy/Kitten", "Adult", "Senior", "All Ages"]).withMessage("Invalid age group"),
  body("inStock").optional().isBoolean().withMessage("In stock must be a boolean"),
  body("stockQuantity").optional().isInt({ min: 0 }).withMessage("Stock quantity must be a non-negative integer"),
  handleValidationErrors,
]

// Education validations
const validateEducation = [
  body("title").trim().isLength({ min: 5, max: 200 }).withMessage("Title must be between 5 and 200 characters"),
  body("content").trim().isLength({ min: 20 }).withMessage("Content must be at least 20 characters long"),
  body("category")
    .optional()
    .isIn(["Pet Care", "Training", "Health", "Nutrition", "Behavior", "General"])
    .withMessage("Invalid category"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("difficulty").optional().isIn(["Beginner", "Intermediate", "Advanced"]).withMessage("Invalid difficulty level"),
  body("estimatedReadTime").optional().isInt({ min: 1 }).withMessage("Estimated read time must be a positive integer"),
  handleValidationErrors,
]

// Report validations
const validateReport = [
  body("animalType")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Animal type must be between 2 and 50 characters"),
  body("animalCondition")
    .isIn(["Critical", "Injured", "Sick", "Healthy", "Unknown"])
    .withMessage("Invalid animal condition"),
  body("location").trim().isLength({ min: 5, max: 200 }).withMessage("Location must be between 5 and 200 characters"),
  body("description")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),
  body("contactName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Contact name must be between 2 and 100 characters"),
  body("contactPhone")
    .optional()
    .trim()
    .matches(/^[+]?[1-9][\d]{0,15}$/)
    .withMessage("Please provide a valid phone number"),
  body("contactEmail").optional().isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  handleValidationErrors,
]

module.exports = {
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateCreateUser,
  validateUpdateUser,
  validateResetPassword,
  validateId,
  validatePagination,
  validateVetDirectory,
  validateRescueTeam,
  validateAnimalFood,
  validateEducation,
  validateReport,
}
