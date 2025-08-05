const express = require("express")
const {
  getVetEntries,
  getVetEntry,
  createVetEntry,
  updateVetEntry,
  deleteVetEntry,
} = require("../controllers/vetController")
const { authenticate } = require("../middlewares/auth")
const { validateVetDirectory, validateId, validatePagination } = require("../middlewares/validation")
const { uploadVetImage } = require("../middlewares/upload")

const router = express.Router()

// All routes are protected
router.use(authenticate)

router.route("/").get(validatePagination, getVetEntries).post(uploadVetImage, validateVetDirectory, createVetEntry)

router
  .route("/:id")
  .get(validateId, getVetEntry)
  .put(validateId, uploadVetImage, validateVetDirectory, updateVetEntry)
  .delete(validateId, deleteVetEntry)

module.exports = router
