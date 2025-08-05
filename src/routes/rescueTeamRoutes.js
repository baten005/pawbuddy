const express = require("express")
const {
  getRescueTeamEntries,
  getRescueTeamEntry,
  createRescueTeamEntry,
  updateRescueTeamEntry,
  deleteRescueTeamEntry,
} = require("../controllers/rescueTeamController")
const { authenticate } = require("../middlewares/auth")
const { validateRescueTeam, validateId, validatePagination } = require("../middlewares/validation")
const { uploadRescueTeamImage } = require("../middlewares/upload")

const router = express.Router()

// All routes are protected
router.use(authenticate)

router
  .route("/")
  .get(validatePagination, getRescueTeamEntries)
  .post(uploadRescueTeamImage, validateRescueTeam, createRescueTeamEntry)

router
  .route("/:id")
  .get(validateId, getRescueTeamEntry)
  .put(validateId, uploadRescueTeamImage, validateRescueTeam, updateRescueTeamEntry)
  .delete(validateId, deleteRescueTeamEntry)

module.exports = router
