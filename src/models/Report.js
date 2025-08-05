const mongoose = require("mongoose")

const reportSchema = new mongoose.Schema(
  {
    animalType: {
      type: String,
      required: [true, "Animal type is required"],
      trim: true,
      maxlength: [50, "Animal type cannot exceed 50 characters"],
    },
    animalCondition: {
      type: String,
      required: [true, "Animal condition is required"],
      enum: ["Critical", "Injured", "Sick", "Healthy", "Unknown"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [200, "Location cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    photos: [
      {
        filename: {
          type: String,
          required: true,
        },
        originalName: {
          type: String,
          required: true,
        },
        path: {
          type: String,
          required: true,
        },
        size: {
          type: Number,
          required: true,
        },
        mimetype: {
          type: String,
          required: true,
        },
      },
    ],
    contactName: {
      type: String,
      trim: true,
      maxlength: [100, "Contact name cannot exceed 100 characters"],
    },
    contactPhone: {
      type: String,
      trim: true,
      //match: [/^[+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"],
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Closed"],
      default: "Pending",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    notes: [
      {
        content: {
          type: String,
          required: true,
          trim: true,
        },
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reportedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for search performance
reportSchema.index({ animalType: "text", location: "text", description: "text" })
reportSchema.index({ status: 1 })
reportSchema.index({ priority: 1 })
reportSchema.index({ animalCondition: 1 })
reportSchema.index({ reportedAt: -1 })
reportSchema.index({ isActive: 1 })

module.exports = mongoose.model("Report", reportSchema)
