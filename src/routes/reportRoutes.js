const express = require("express")
const {
  getReports,
  getReport,
  createReport,
  updateReport,
  deleteReport,
  addNote,
  updateReportStatus,
  getReportStats,
} = require("../controllers/reportController")
const { authenticate, authorize } = require("../middlewares/auth")
const { validateReport, validateId, validatePagination } = require("../middlewares/validation")
const { uploadReportImages } = require("../middlewares/upload")

const router = express.Router()

// Public route for creating reports
router.post("/", uploadReportImages, validateReport, createReport)

// Protected routes
router.use(authenticate)

router.get("/stats", authorize("admin"), getReportStats)
router.get("/", validatePagination, getReports)
router.get("/:id", validateId, getReport)
router.put("/:id", validateId, uploadReportImages, validateReport, updateReport)
router.delete("/:id", validateId, authorize("admin"), deleteReport)
router.post("/:id/notes", validateId, addNote)
router.patch("/:id/status", validateId, authorize("admin"), updateReportStatus)

module.exports = router
