'use strict'

const utils = require('../utils')
const Base = require('./base')

const keywords = {
  enum (value, data) {
    return value.indexOf(data.value) !== -1
  }
}

class GenericBoolean extends Base {
  constructor (schema, options) {
    super(schema, options, keywords)
  }

  static validateSchema (schema, generic) {
    if (schema.hasOwnProperty('enum')) {
      utils.validateUniqueArray(schema.enum, generic, 'enum', 'boolean')
    }
  }

  validate (data) {
    return typeof data.value === 'boolean'
  }
}

module.exports = GenericBoolean
