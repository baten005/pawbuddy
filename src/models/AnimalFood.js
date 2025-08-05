const mongoose = require("mongoose")

const animalFoodSchema = new mongoose.Schema(
  {
    foodName: {
      type: String,
      required: [true, "Food name is required"],
      trim: true,
      maxlength: [100, "Food name cannot exceed 100 characters"],
    },
    price: {
      type: String,
      required: [true, "Price is required"],
      trim: true,
    },
    priceNumeric: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
      maxlength: 3,
    },
    category: {
      type: String,
      enum: ["Dog Food", "Cat Food", "Bird Food", "Fish Food", "Small Animal Food", "Treats", "Supplements"],
      default: "Dog Food",
    },
    brand: {
      type: String,
      trim: true,
      maxlength: [50, "Brand name cannot exceed 50 characters"],
    },
    weight: {
      type: String,
      trim: true,
    },
    ingredients: [
      {
        type: String,
        trim: true,
      },
    ],
    nutritionalInfo: {
      protein: Number,
      fat: Number,
      fiber: Number,
      moisture: Number,
    },
    ageGroup: {
      type: String,
      enum: ["Puppy/Kitten", "Adult", "Senior", "All Ages"],
      default: "All Ages",
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    stockQuantity: {
      type: Number,
      min: 0,
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

// Pre-save middleware to extract numeric price
animalFoodSchema.pre("save", function (next) {
  if (this.isModified("price")) {
    const numericPrice = Number.parseFloat(this.price.replace(/[^0-9.]/g, ""))
    if (!isNaN(numericPrice)) {
      this.priceNumeric = numericPrice
    }
  }
  next()
})

// Indexes for search and filtering
animalFoodSchema.index({ foodName: "text", brand: "text" })
animalFoodSchema.index({ category: 1 })
animalFoodSchema.index({ priceNumeric: 1 })
animalFoodSchema.index({ isActive: 1 })

module.exports = mongoose.model("AnimalFood", animalFoodSchema)
