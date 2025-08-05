const express = require("express")
const {
  getAnimalFoodEntries,
  getAnimalFoodEntry,
  createAnimalFoodEntry,
  updateAnimalFoodEntry,
  deleteAnimalFoodEntry,
} = require("../controllers/animalFoodController")
const { authenticate } = require("../middlewares/auth")
const { validateAnimalFood, validateId, validatePagination } = require("../middlewares/validation")
const { uploadAnimalFoodImage } = require("../middlewares/upload")

const router = express.Router()

// All routes are protected
router.use(authenticate)

router
  .route("/")
  .get(validatePagination, getAnimalFoodEntries)
  .post(uploadAnimalFoodImage, createAnimalFoodEntry)

router
  .route("/:id")
  .get(validateId, getAnimalFoodEntry)
  .put(validateId, uploadAnimalFoodImage, updateAnimalFoodEntry)
  .delete(validateId, deleteAnimalFoodEntry)

module.exports = router
