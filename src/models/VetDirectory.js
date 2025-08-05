const mongoose = require("mongoose")

const vetDirectorySchema = new mongoose.Schema(
  {
    hospital: {
      type: String,
      required: [true, "Hospital name is required"],
      trim: true,
      maxlength: [100, "Hospital name cannot exceed 100 characters"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      maxlength: [200, "Address cannot exceed 200 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      //match: [/^[+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    website: {
      type: String,
      trim: true,
    },
    services: [
      {
        type: String,
        trim: true,
      },
    ],
    emergencyService: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    image: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String,
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

// Indexes for search performance
vetDirectorySchema.index({ hospital: "text", address: "text" })
vetDirectorySchema.index({ createdBy: 1 })
vetDirectorySchema.index({ isActive: 1 })

module.exports = mongoose.model("VetDirectory", vetDirectorySchema)
