'use strict'

const utils = require('../utils')

module.exports = {
  validateSchema (schema, generic) {
    if (schema.hasOwnProperty('enum')) {
      utils.validateUniqueArray(schema.enum, generic, 'enum', 'boolean')
    }
  },
  compile (schema) {
    utils.validateDefaultSchemaValue.apply(this, [ schema ])
  },
  validate (data) {
    return typeof data === 'boolean'
  },
  keywords: {
    enum (value, data) {
      return value.indexOf(data) !== -1
    }
  }
}
