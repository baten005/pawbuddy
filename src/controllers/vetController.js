const VetDirectory = require("../models/VetDirectory")
const { createError } = require("../utils/errorUtils")
const { createResponse } = require("../utils/responseUtils")
const { getPaginationOptions } = require("../utils/paginationUtils")
const fs = require("fs").promises

// @desc    Get all vet entries
// @route   GET /api/vet
// @access  Private
const getVetEntries = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query)
    const { search, isActive } = req.query

    // Build query
    const query = {}

    if (search) {
      query.$text = { $search: search }
    }

    if (isActive !== undefined) {
      query.isActive = isActive === "true"
    }

    // Execute query with pagination
    const [entries, total] = await Promise.all([
      VetDirectory.find(query)
        .populate("createdBy", "username")
        .populate("updatedBy", "username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      VetDirectory.countDocuments(query),
    ])

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    }

    res.json(
      createResponse(true, "Vet entries retrieved successfully", {
        entries,
        pagination,
      }),
    )
  } catch (error) {
    next(error)
  }
}

// @desc    Get single vet entry
// @route   GET /api/vet/:id
// @access  Private
const getVetEntry = async (req, res, next) => {
  try {
    const entry = await VetDirectory.findById(req.params.id)
      .populate("createdBy", "username")
      .populate("updatedBy", "username")

    if (!entry) {
      return next(createError(404, "Vet entry not found"))
    }

    res.json(createResponse(true, "Vet entry retrieved successfully", { entry }))
  } catch (error) {
    next(error)
  }
}

// @desc    Create vet entry
// @route   POST /api/vet
// @access  Private
const createVetEntry = async (req, res, next) => {
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

    const entry = await VetDirectory.create(entryData)

    await entry.populate("createdBy", "username")

    res.status(201).json(createResponse(true, "Vet entry created successfully", { entry }))
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

// @desc    Update vet entry
// @route   PUT /api/vet/:id
// @access  Private
const updateVetEntry = async (req, res, next) => {
  try {
    const entry = await VetDirectory.findById(req.params.id)

    if (!entry) {
      return next(createError(404, "Vet entry not found"))
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

    const updatedEntry = await VetDirectory.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("createdBy", "username")
      .populate("updatedBy", "username")

    res.json(createResponse(true, "Vet entry updated successfully", { entry: updatedEntry }))
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

// @desc    Delete vet entry
// @route   DELETE /api/vet/:id
// @access  Private
const deleteVetEntry = async (req, res, next) => {
  try {
    const entry = await VetDirectory.findById(req.params.id)

    if (!entry) {
      return next(createError(404, "Vet entry not found"))
    }

    await VetDirectory.findByIdAndDelete(req.params.id)

    res.json(createResponse(true, "Vet entry deleted successfully"))
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getVetEntries,
  getVetEntry,
  createVetEntry,
  updateVetEntry,
  deleteVetEntry,
}
