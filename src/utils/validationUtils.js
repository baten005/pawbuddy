const mongoose = require("mongoose")

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id)
}

const sanitizeInput = (input) => {
  if (typeof input !== "string") return input

  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .substring(0, 1000) // Limit length
}

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePhone = (phone) => {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone)
}

const validateUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

module.exports = {
  isValidObjectId,
  sanitizeInput,
  validateEmail,
  validatePhone,
  validateUrl,
}
