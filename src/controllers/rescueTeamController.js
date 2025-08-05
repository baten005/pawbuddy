const RescueTeam = require("../models/RescueTeam")
const { createError } = require("../utils/errorUtils")
const { createResponse } = require("../utils/responseUtils")
const { getPaginationOptions } = require("../utils/paginationUtils")
const fs = require("fs").promises

// @desc    Get all rescue team entries
// @route   GET /api/rescue-team
// @access  Private
const getRescueTeamEntries = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query)
    const { search, specialization, availability } = req.query

    const query = {}

    if (search) {
      query.$text = { $search: search }
    }

    if (specialization) {
      query.specialization = { $in: [specialization] }
    }

    if (availability) {
      query.availability = availability
    }

    const [entries, total] = await Promise.all([
      RescueTeam.find(query)
        .populate("createdBy", "username")
        .populate("updatedBy", "username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      RescueTeam.countDocuments(query),
    ])

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    }

    res.json(
      createResponse(true, "Rescue team entries retrieved successfully", {
        entries,
        pagination,
      }),
    )
  } catch (error) {
    next(error)
  }
}

// @desc    Get single rescue team entry
// @route   GET /api/rescue-team/:id
// @access  Private
const getRescueTeamEntry = async (req, res, next) => {
  try {
    const entry = await RescueTeam.findById(req.params.id)
      .populate("createdBy", "username")
      .populate("updatedBy", "username")

    if (!entry) {
      return next(createError(404, "Rescue team entry not found"))
    }

    res.json(createResponse(true, "Rescue team entry retrieved successfully", { entry }))
  } catch (error) {
    next(error)
  }
}

// @desc    Create rescue team entry
// @route   POST /api/rescue-team
// @access  Private
const createRescueTeamEntry = async (req, res, next) => {
  try {
    const entryData = {
      ...req.body,
      createdBy: req.user._id,
    }

    // Handle uploaded image
    if (req.file) {
      entryData.image = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
      }
    }

    const entry = await RescueTeam.create(entryData)

    await entry.populate("createdBy", "username")

    res.status(201).json(createResponse(true, "Rescue team entry created successfully", { entry }))
  } catch (error) {
    // Clean up uploaded file if entry creation fails
    if (req.file) {
      try {
        await fs.unlink(req.file.path)
      } catch (unlinkError) {
        console.error("Error deleting file:", unlinkError)
      }
    }
    next(error)
  }
}

// @desc    Update rescue team entry
// @route   PUT /api/rescue-team/:id
// @access  Private
const updateRescueTeamEntry = async (req, res, next) => {
  try {
    const entry = await RescueTeam.findById(req.params.id)

    if (!entry) {
      return next(createError(404, "Rescue team entry not found"))
    }

    const updateData = { ...req.body, updatedBy: req.user._id }

    // Handle new uploaded image
    if (req.file) {
      // Delete old image if exists
      if (entry.image && entry.image.path) {
        try {
          await fs.unlink(entry.image.path)
        } catch (unlinkError) {
          console.error("Error deleting old file:", unlinkError)
        }
      }

      updateData.image = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
      }
    }

    const updatedEntry = await RescueTeam.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("createdBy", "username")
      .populate("updatedBy", "username")

    res.json(createResponse(true, "Rescue team entry updated successfully", { entry: updatedEntry }))
  } catch (error) {
    // Clean up uploaded file if update fails
    if (req.file) {
      try {
        await fs.unlink(req.file.path)
      } catch (unlinkError) {
        console.error("Error deleting file:", unlinkError)
      }
    }
    next(error)
  }
}

// @desc    Delete rescue team entry
// @route   DELETE /api/rescue-team/:id
// @access  Private
const deleteRescueTeamEntry = async (req, res, next) => {
  try {
    const entry = await RescueTeam.findById(req.params.id)

    if (!entry) {
      return next(createError(404, "Rescue team entry not found"))
    }

    await RescueTeam.findByIdAndDelete(req.params.id)

    res.json(createResponse(true, "Rescue team entry deleted successfully"))
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getRescueTeamEntries,
  getRescueTeamEntry,
  createRescueTeamEntry,
  updateRescueTeamEntry,
  deleteRescueTeamEntry,
}
