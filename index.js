const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const compression = require("compression")
const morgan = require("morgan")
const rateLimit = require("express-rate-limit")
require("dotenv").config()

const connectDB = require("./src/configs/database")
const authRoutes = require("./src/routes/authRoutes")
const vetRoutes = require("./src/routes/vetRoutes")
const rescueTeamRoutes = require("./src/routes/rescueTeamRoutes")
const animalFoodRoutes = require("./src/routes/animalFoodRoutes")
const educationRoutes = require("./src/routes/educationRoutes")
const errorHandler = require("./src/middlewares/errorHandler")

const app = express()
const PORT =  5000



// Connect to MongoDB
connectDB()

// Security middleware
app.use(helmet())
app.use(compression())

// Rate limiting
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutes
  max: 10000, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
})
app.use("/api/", limiter)

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://192.168.0.108:3000",
  "https://pawbuddyfront.onrender.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, origin); // Reflect the request origin in the CORS response
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow cookies and credentials
  })
);


// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Logging middleware
app.use(morgan("combined"))

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Admin Panel API is running",
    timestamp: new Date().toISOString(),
  })
})

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/vet", vetRoutes)
app.use("/api/rescue-team", rescueTeamRoutes)
app.use("/api/animal-food", animalFoodRoutes)
app.use("/api/education", educationRoutes)

// 404 handler
app.use("/", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  })
})

// Global error handler
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`)
})

module.exports = app
