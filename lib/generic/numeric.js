'use strict'

const utils = require('../utils')
const Base = require('./base')

class GenericNumeric extends Base {
  constructor (schema, options) {
    super(schema, options)

    this.keywords = {
      enum (value, data) {
        return value.indexOf(data.value) !== -1
      },
      maximum (value, data) {
        if (this.schema.exclusiveMaximum) {
          return data.value < value
        }
        return data.value <= value
      },
      minimum (value, data) {
        if (this.schema.exclusiveMinimum) {
          return data.value > value
        }
        return data.value >= value
      },
      multipleOf (value, data) {
        return data.value % value === 0
      }
    }
  }

  static validateSchema (schema, generic) {
    if (schema.hasOwnProperty('enum')) {
      utils.validateUniqueArray(schema.enum, generic, 'enum', 'number')
    }

    if (schema.hasOwnProperty('maximum')) {
      if (typeof schema.maximum !== 'number') {
        throw new Error('maximum must be a number')
      }
    }

    if (schema.hasOwnProperty('exclusiveMaximum')) {
      if (typeof schema.exclusiveMaximum !== 'boolean' && typeof schema.exclusiveMaximum !== 'undefined') {
        throw new Error('exclusiveMaximum must be a boolean')
      }
    }

    if (schema.hasOwnProperty('minimum')) {
      if (typeof schema.minimum !== 'number') {
        throw new Error('minimum must be a number')
      }
    }

    if (schema.hasOwnProperty('exclusiveMinimum')) {
      if (typeof schema.exclusiveMinimum !== 'boolean' && typeof schema.exclusiveMinimum !== 'undefined') {
        throw new Error('exclusiveMinimum must be a boolean')
      }
    }

    if (schema.hasOwnProperty('multipleOf')) {
      if (typeof schema.multipleOf !== 'number' || schema.multipleOf !== parseInt(schema.multipleOf, 10)) {
        throw new Error('multipleOf must be an integer')
      }

      if (schema.multipleOf <= 0) {
        throw new Error('multipleOf must be strictly greater than 0')
      }
    }
  }

  compile () {
    if (this.schema.hasOwnProperty('exclusiveMaximum')) {
      if (typeof this.schema.exclusiveMaximum === 'undefined') {
        this.schema.exclusiveMaximum = false
      }
    }

    if (this.schema.hasOwnProperty('exclusiveMinimum')) {
      if (typeof this.schema.exclusiveMinimum === 'undefined') {
        this.schema.exclusiveMinimum = false
      }
    }

    super.compile()
  }

  validate (data) {
    return typeof data.value === 'number'
  }
}

module.exports = GenericNumeric
