const Report = require("../models/Report")
const { createError } = require("../utils/errorUtils")
const { createResponse } = require("../utils/responseUtils")
const { getPaginationOptions } = require("../utils/paginationUtils")
const fs = require("fs").promises
const path = require("path")

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private
const getReports = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query)
    const { search, status, priority, animalCondition, animalType } = req.query

    // Build query
    const query = { isActive: true }

    if (search) {
      query.$text = { $search: search }
    }

    if (status) {
      query.status = status
    }

    if (priority) {
      query.priority = priority
    }

    if (animalCondition) {
      query.animalCondition = animalCondition
    }

    if (animalType) {
      query.animalType = { $regex: animalType, $options: "i" }
    }

    // Execute query with pagination
    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate("reportedBy", "username email")
        .populate("assignedTo", "username email")
        .populate("notes.addedBy", "username")
        .sort({ reportedAt: -1 })
        .skip(skip)
        .limit(limit),
      Report.countDocuments(query),
    ])

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    }

    res.json(
      createResponse(true, "Reports retrieved successfully", {
        reports,
        pagination,
      }),
    )
  } catch (error) {
    next(error)
  }
}

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Private
const getReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("reportedBy", "username email")
      .populate("assignedTo", "username email")
      .populate("notes.addedBy", "username")

    if (!report || !report.isActive) {
      return next(createError(404, "Report not found"))
    }

    res.json(createResponse(true, "Report retrieved successfully", { report }))
  } catch (error) {
    next(error)
  }
}

// @desc    Create report
// @route   POST /api/reports
// @access  Public
const createReport = async (req, res, next) => {
  try {
    const reportData = {
      ...req.body,
      reportedBy: req.user ? req.user._id : null,
    }

    // Handle uploaded photos
    if (req.files && req.files.length > 0) {
      reportData.photos = req.files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
      }))
    }

    const report = await Report.create(reportData)

    await report.populate("reportedBy", "username email")

    res.status(201).json(createResponse(true, "Report created successfully", { report }))
  } catch (error) {
    // Clean up uploaded files if report creation fails
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path)
        } catch (unlinkError) {
          console.error("Error deleting file:", unlinkError)
        }
      }
    }
    next(error)
  }
}

// @desc    Update report
// @route   PUT /api/reports/:id
// @access  Private
const updateReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)

    if (!report || !report.isActive) {
      return next(createError(404, "Report not found"))
    }

    // Handle new uploaded photos
    if (req.files && req.files.length > 0) {
      const newPhotos = req.files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
      }))

      // Add new photos to existing ones
      req.body.photos = [...(report.photos || []), ...newPhotos]
    }

    const updatedReport = await Report.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("reportedBy", "username email")
      .populate("assignedTo", "username email")
      .populate("notes.addedBy", "username")

    res.json(createResponse(true, "Report updated successfully", { report: updatedReport }))
  } catch (error) {
    // Clean up uploaded files if update fails
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path)
        } catch (unlinkError) {
          console.error("Error deleting file:", unlinkError)
        }
      }
    }
    next(error)
  }
}

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private
const deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)

    if (!report || !report.isActive) {
      return next(createError(404, "Report not found"))
    }

    // Soft delete
    await Report.findByIdAndUpdate(req.params.id, { isActive: false })

    res.json(createResponse(true, "Report deleted successfully"))
  } catch (error) {
    next(error)
  }
}

// @desc    Add note to report
// @route   POST /api/reports/:id/notes
// @access  Private
const addNote = async (req, res, next) => {
  try {
    const { content } = req.body

    const report = await Report.findById(req.params.id)

    if (!report || !report.isActive) {
      return next(createError(404, "Report not found"))
    }

    report.notes.push({
      content,
      addedBy: req.user._id,
    })

    await report.save()

    await report.populate("notes.addedBy", "username")

    res.json(createResponse(true, "Note added successfully", { report }))
  } catch (error) {
    next(error)
  }
}

// @desc    Update report status
// @route   PATCH /api/reports/:id/status
// @access  Private
const updateReportStatus = async (req, res, next) => {
  try {
    const { status, assignedTo } = req.body

    const report = await Report.findById(req.params.id)

    if (!report || !report.isActive) {
      return next(createError(404, "Report not found"))
    }

    const updateData = { status }
    if (assignedTo) {
      updateData.assignedTo = assignedTo
    }

    const updatedReport = await Report.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("reportedBy", "username email")
      .populate("assignedTo", "username email")

    res.json(createResponse(true, "Report status updated successfully", { report: updatedReport }))
  } catch (error) {
    next(error)
  }
}

// @desc    Get report statistics
// @route   GET /api/reports/stats
// @access  Private
const getReportStats = async (req, res, next) => {
  try {
    const [totalReports, pendingReports, inProgressReports, resolvedReports, criticalReports, highPriorityReports] =
      await Promise.all([
        Report.countDocuments({ isActive: true }),
        Report.countDocuments({ status: "Pending", isActive: true }),
        Report.countDocuments({ status: "In Progress", isActive: true }),
        Report.countDocuments({ status: "Resolved", isActive: true }),
        Report.countDocuments({ animalCondition: "Critical", isActive: true }),
        Report.countDocuments({ priority: "High", isActive: true }),
      ])

    const stats = {
      totalReports,
      pendingReports,
      inProgressReports,
      resolvedReports,
      criticalReports,
      highPriorityReports,
    }

    res.json(createResponse(true, "Report statistics retrieved successfully", { stats }))
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getReports,
  getReport,
  createReport,
  updateReport,
  deleteReport,
  addNote,
  updateReportStatus,
  getReportStats,
}
