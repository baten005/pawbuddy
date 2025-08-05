const multer = require("multer")
const path = require("path")
const fs = require("fs")
const { createError } = require("../utils/errorUtils")

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../../uploads")
const vetDir = path.join(uploadsDir, "vet")
const rescueTeamDir = path.join(uploadsDir, "rescue-team")
const animalFoodDir = path.join(uploadsDir, "animal-food")
const reportsDir = path.join(uploadsDir, "reports")

// Create directories if they don't exist
const createDirectories = () => {
  const dirs = [uploadsDir, vetDir, rescueTeamDir, animalFoodDir, reportsDir]
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  })
}

createDirectories()

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith("image/")) {
    cb(null, true)
  } else {
    cb(createError(400, "Only image files are allowed"), false)
  }
}

// Storage configuration for different entities
const createStorage = (subfolder) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(uploadsDir, subfolder)
      cb(null, uploadPath)
    },
    filename: (req, file, cb) => {
      // Create unique filename
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
      const ext = path.extname(file.originalname)
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
    },
  })
}

// Multer configurations for different entities
const vetUpload = multer({
  storage: createStorage("vet"),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
})

const rescueTeamUpload = multer({
  storage: createStorage("rescue-team"),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
})

const animalFoodUpload = multer({
  storage: createStorage("animal-food"),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
})

const reportUpload = multer({
  storage: createStorage("reports"),
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for reports
    files: 5, // Maximum 5 files
  },
})

// Middleware functions
const uploadVetImage = vetUpload.single("image")
const uploadRescueTeamImage = rescueTeamUpload.single("image")
const uploadAnimalFoodImage = animalFoodUpload.single("image")
const uploadReportImages = reportUpload.array("photos", 5) // Maximum 5 photos

// Error handling middleware
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return next(createError(400, "File too large"))
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return next(createError(400, "Too many files"))
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return next(createError(400, "Unexpected file field"))
    }
  }
  next(error)
}

module.exports = {
  uploadVetImage,
  uploadRescueTeamImage,
  uploadAnimalFoodImage,
  uploadReportImages,
  handleMulterError,
}
