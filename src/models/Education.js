const mongoose = require("mongoose")

const educationSchema = new mongoose.Schema(
  {
    tips: {
      type: String,
      required: [true, "Tips content is required"],
      trim: true,
      maxlength: [1000, "Tips cannot exceed 1000 characters"],
    },
    url: {
      type: String,
      required: [true, "URL is required"],
      trim: true,
      match: [/^https?:\/\/.+/, "Please enter a valid URL starting with http:// or https://"],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    category: {
      type: String,
      enum: ["Pet Care", "Training", "Health", "Nutrition", "Behavior", "Emergency Care", "General"],
      default: "General",
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 30,
      },
    ],
    isPublished: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for search and filtering
educationSchema.index({ tips: "text", title: "text" })
educationSchema.index({ category: 1 })
educationSchema.index({ tags: 1 })
educationSchema.index({ isPublished: 1, isActive: 1 })

module.exports = mongoose.model("Education", educationSchema)
