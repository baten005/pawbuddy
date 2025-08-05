const Education = require("../models/Education")
const { createError } = require("../utils/errorUtils")
const { createResponse } = require("../utils/responseUtils")
const { getPaginationOptions } = require("../utils/paginationUtils")

// @desc    Get all education entries
// @route   GET /api/education
// @access  Private
const getEducationEntries = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query)
    const { search, category, difficulty, isPublished } = req.query

    const query = {}

    if (search) {
      query.$text = { $search: search }
    }

    if (category) {
      query.category = category
    }

    if (difficulty) {
      query.difficulty = difficulty
    }

    if (isPublished !== undefined) {
      query.isPublished = isPublished === "true"
    }

    const [entries, total] = await Promise.all([
      Education.find(query)
        .populate("createdBy", "username")
        .populate("updatedBy", "username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Education.countDocuments(query),
    ])

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    }

    res.json(
      createResponse(true, "Education entries retrieved successfully", {
        entries,
        pagination,
      }),
    )
  } catch (error) {
    next(error)
  }
}

// @desc    Get single education entry
// @route   GET /api/education/:id
// @access  Private
const getEducationEntry = async (req, res, next) => {
  try {
    const entry = await Education.findById(req.params.id)
      .populate("createdBy", "username")
      .populate("updatedBy", "username")

    if (!entry) {
      return next(createError(404, "Education entry not found"))
    }

    // Increment views
    await Education.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } })

    res.json(createResponse(true, "Education entry retrieved successfully", { entry }))
  } catch (error) {
    next(error)
  }
}

// @desc    Create education entry
// @route   POST /api/education
// @access  Private
const createEducationEntry = async (req, res, next) => {
  try {
    const entryData = {
      ...req.body,
      createdBy: req.user._id,
    }

    const entry = await Education.create(entryData)

    await entry.populate("createdBy", "username")

    res.status(201).json(createResponse(true, "Education entry created successfully", { entry }))
  } catch (error) {
    next(error)
  }
}

// @desc    Update education entry
// @route   PUT /api/education/:id
// @access  Private
const updateEducationEntry = async (req, res, next) => {
  try {
    const entry = await Education.findById(req.params.id)

    if (!entry) {
      return next(createError(404, "Education entry not found"))
    }

    const updatedEntry = await Education.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true },
    )
      .populate("createdBy", "username")
      .populate("updatedBy", "username")

    res.json(createResponse(true, "Education entry updated successfully", { entry: updatedEntry }))
  } catch (error) {
    next(error)
  }
}

// @desc    Delete education entry
// @route   DELETE /api/education/:id
// @access  Private
const deleteEducationEntry = async (req, res, next) => {
  try {
    const entry = await Education.findById(req.params.id)

    if (!entry) {
      return next(createError(404, "Education entry not found"))
    }

    await Education.findByIdAndDelete(req.params.id)

    res.json(createResponse(true, "Education entry deleted successfully"))
  } catch (error) {
    next(error)
  }
}

// @desc    Like education entry
// @route   POST /api/education/:id/like
// @access  Private
const likeEducationEntry = async (req, res, next) => {
  try {
    const entry = await Education.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true })

    if (!entry) {
      return next(createError(404, "Education entry not found"))
    }

    res.json(createResponse(true, "Education entry liked successfully", { likes: entry.likes }))
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getEducationEntries,
  getEducationEntry,
  createEducationEntry,
  updateEducationEntry,
  deleteEducationEntry,
  likeEducationEntry,
}
