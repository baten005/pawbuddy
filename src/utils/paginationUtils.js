const getPaginationOptions = (query) => {
  const page = Number.parseInt(query.page) || 1
  const limit = Math.min(Number.parseInt(query.limit) || 10, 100) // Max 100 items per page
  const skip = (page - 1) * limit

  return {
    page,
    limit,
    skip,
  }
}

const buildSortOptions = (sortBy, sortOrder = "desc") => {
  const validSortFields = ["createdAt", "updatedAt", "name", "title"]
  const field = validSortFields.includes(sortBy) ? sortBy : "createdAt"
  const order = sortOrder === "asc" ? 1 : -1

  return { [field]: order }
}

module.exports = {
  getPaginationOptions,
  buildSortOptions,
}
