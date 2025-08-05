const jwt = require("jsonwebtoken")

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey"
const JWT_EXPIRE = process.env.JWT_EXPIRE || "1d"

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
    issuer: "admin-panel-api",
    audience: "admin-panel-client",
  })
}

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET)
}

module.exports = {
  generateToken,
  verifyToken,
  JWT_SECRET,
  JWT_EXPIRE,
}
