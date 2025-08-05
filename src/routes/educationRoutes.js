const express = require("express")
const {
  getEducationEntries,
  getEducationEntry,
  createEducationEntry,
  updateEducationEntry,
  deleteEducationEntry,
  likeEducationEntry,
} = require("../controllers/educationController")
const { authenticate } = require("../middlewares/auth")
const { validateEducation, validateId, validatePagination } = require("../middlewares/validation")

const router = express.Router()

// All routes are protected
router.use(authenticate)

router.route("/").get(validatePagination, getEducationEntries).post(createEducationEntry)

router
  .route("/:id")
  .get(validateId, getEducationEntry)
  .put(validateId, updateEducationEntry)
  .delete(validateId, deleteEducationEntry)

router.post("/:id/like", validateId, likeEducationEntry)

module.exports = router
