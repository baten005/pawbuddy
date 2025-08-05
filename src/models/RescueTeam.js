const mongoose = require("mongoose")

const rescueTeamSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: [true, "Team name is required"],
      trim: true,
      maxlength: [100, "Team name cannot exceed 100 characters"],
    },
    teamAddress: {
      type: String,
      required: [true, "Team address is required"],
      trim: true,
      maxlength: [200, "Team address cannot exceed 200 characters"],
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
    specialization: [
      {
        type: String,
        enum: ["Wildlife", "Domestic Animals", "Marine Life", "Birds", "Emergency Response"],
        trim: true,
      },
    ],
    teamSize: {
      type: Number,
      min: 1,
      max: 50,
    },
    availability: {
      type: String,
      enum: ["24/7", "Business Hours", "Emergency Only"],
      default: "Business Hours",
    },
    image: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String,
    },
    equipment: [
      {
        type: String,
        trim: true,
      },
    ],
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
rescueTeamSchema.index({ teamName: "text", teamAddress: "text" })
rescueTeamSchema.index({ specialization: 1 })
rescueTeamSchema.index({ isActive: 1 })

module.exports = mongoose.model("RescueTeam", rescueTeamSchema)
