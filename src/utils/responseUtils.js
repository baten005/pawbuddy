const createResponse = (success, message, data = null, meta = null) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString(),
  }

  if (data !== null) {
    response.data = data
  }

  if (meta !== null) {
    response.meta = meta
  }

  return response
}

const createPaginatedResponse = (success, message, data, pagination) => {
  return createResponse(success, message, data, { pagination })
}

module.exports = {
  createResponse,
  createPaginatedResponse,
}
