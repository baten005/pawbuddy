const AnimalFood = require("../models/AnimalFood")
const fs = require("fs").promises
const { createError } = require("../utils/errorUtils")
const { createResponse } = require("../utils/responseUtils")
const { getPaginationOptions } = require("../utils/paginationUtils")

// @desc    Get all animal food entries
// @route   GET /api/animal-food
// @access  Private
const getAnimalFoodEntries = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query)
    const { search, category, minPrice, maxPrice, inStock } = req.query

    const query = {}

    if (search) {
      query.$text = { $search: search }
    }

    if (category) {
      query.category = category
    }

    if (minPrice || maxPrice) {
      query.priceNumeric = {}
      if (minPrice) query.priceNumeric.$gte = Number.parseFloat(minPrice)
      if (maxPrice) query.priceNumeric.$lte = Number.parseFloat(maxPrice)
    }

    if (inStock !== undefined) {
      query.inStock = inStock === "true"
    }

    const [entries, total] = await Promise.all([
      AnimalFood.find(query)
        .populate("createdBy", "username")
        .populate("updatedBy", "username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AnimalFood.countDocuments(query),
    ])

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    }

    res.json(
      createResponse(true, "Animal food entries retrieved successfully", {
        entries,
        pagination,
      }),
    )
  } catch (error) {
    next(error)
  }
}

// @desc    Get single animal food entry
// @route   GET /api/animal-food/:id
// @access  Private
const getAnimalFoodEntry = async (req, res, next) => {
  try {
    const entry = await AnimalFood.findById(req.params.id)
      .populate("createdBy", "username")
      .populate("updatedBy", "username")

    if (!entry) {
      return next(createError(404, "Animal food entry not found"))
    }

    res.json(createResponse(true, "Animal food entry retrieved successfully", { entry }))
  } catch (error) {
    next(error)
  }
}

// @desc    Create animal food entry
// @route   POST /api/animal-food
// @access  Private
const createAnimalFoodEntry = async (req, res, next) => {
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

    const entry = await AnimalFood.create(entryData)

    await entry.populate("createdBy", "username")

    res.status(201).json(createResponse(true, "Animal food entry created successfully", { entry }))
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

// @desc    Update animal food entry
// @route   PUT /api/animal-food/:id
// @access  Private
const updateAnimalFoodEntry = async (req, res, next) => {
  try {
    const entry = await AnimalFood.findById(req.params.id)

    if (!entry) {
      return next(createError(404, "Animal food entry not found"))
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

    const updatedEntry = await AnimalFood.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("createdBy", "username")
      .populate("updatedBy", "username")

    res.json(createResponse(true, "Animal food entry updated successfully", { entry: updatedEntry }))
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

// @desc    Delete animal food entry
// @route   DELETE /api/animal-food/:id
// @access  Private
const deleteAnimalFoodEntry = async (req, res, next) => {
  try {
    const entry = await AnimalFood.findById(req.params.id)

    if (!entry) {
      return next(createError(404, "Animal food entry not found"))
    }

    await AnimalFood.findByIdAndDelete(req.params.id)

    res.json(createResponse(true, "Animal food entry deleted successfully"))
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getAnimalFoodEntries,
  getAnimalFoodEntry,
  createAnimalFoodEntry,
  updateAnimalFoodEntry,
  deleteAnimalFoodEntry,
}
