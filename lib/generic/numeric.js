'use strict'

const utils = require('../utils')

module.exports = {
  validateSchema (schema, generic) {
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
  },
  compile (schema) {
    if (schema.hasOwnProperty('exclusiveMaximum')) {
      if (typeof schema.exclusiveMaximum === 'undefined') {
        schema.exclusiveMaximum = false
      }
    }

    if (schema.hasOwnProperty('exclusiveMinimum')) {
      if (typeof schema.exclusiveMinimum === 'undefined') {
        schema.exclusiveMinimum = false
      }
    }

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
      return data % value === 0
    }
  }
}
