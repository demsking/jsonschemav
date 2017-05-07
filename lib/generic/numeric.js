'use strict'

const utils = require('../utils')

module.exports = {
  validateSchema (schema, generic) {
    if (schema.hasOwnProperty('enum')) {
      utils.validateUniqueArray(schema.enum, generic, 'enum', 'number')
    }
  },
  compile (schema) {
    utils.validateDefaultSchemaValue.apply(this, [ schema ])
  },
  validate (data) {
    return typeof data === 'number'
  },
  keywords: {
    enum (value, data) {
      return value.indexOf(data) !== -1
    },
    maximum (value, data) {
      if (this.$schema.exclusiveMaximum) {
        return data < value
      }
      return data <= value
    },
    minimum (value, data) {
      if (this.$schema.exclusiveMinimum) {
        return data > value
      }
      return data >= value
    },
    multipleOf (value, data) {
      return data && data % value === 0
    }
  }
}
