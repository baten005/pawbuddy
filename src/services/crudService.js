const { createError } = require("../utils/errorUtils")

class CrudService {
  constructor(Model) {
    this.Model = Model
  }

  async findAll(query = {}, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 }, populate = [] } = options
    const skip = (page - 1) * limit

    let queryBuilder = this.Model.find(query).sort(sort).skip(skip).limit(limit)

    // Add population if specified
    populate.forEach((pop) => {
      queryBuilder = queryBuilder.populate(pop)
    })

    const [documents, total] = await Promise.all([queryBuilder.exec(), this.Model.countDocuments(query)])

    return {
      documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  async findById(id, populate = []) {
    let query = this.Model.findById(id)

    populate.forEach((pop) => {
      query = query.populate(pop)
    })

    const document = await query.exec()

    if (!document) {
      throw createError(404, `${this.Model.modelName} not found`)
    }

    return document
  }

  async create(data, userId) {
    const documentData = {
      ...data,
      createdBy: userId,
    }

    const document = await this.Model.create(documentData)
    return document
  }

  async update(id, data, userId) {
    const document = await this.Model.findById(id)

    if (!document) {
      throw createError(404, `${this.Model.modelName} not found`)
    }

    const updatedDocument = await this.Model.findByIdAndUpdate(
      id,
      { ...data, updatedBy: userId },
      { new: true, runValidators: true },
    )

    return updatedDocument
  }

  async delete(id) {
    const document = await this.Model.findById(id)

    if (!document) {
      throw createError(404, `${this.Model.modelName} not found`)
    }

    await this.Model.findByIdAndDelete(id)
    return { message: `${this.Model.modelName} deleted successfully` }
  }

  async search(searchTerm, options = {}) {
    const query = {
      $text: { $search: searchTerm },
    }

    return this.findAll(query, options)
  }
}

module.exports = CrudService
