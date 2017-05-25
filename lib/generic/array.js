'use strict'

const utils = require('../utils')
const Base = require('./base').Base

class GenericArray extends Base {
  constructor (schema, _generic) {
    super(schema, _generic)

    this.keywords = {
      items (value, data) {
        const errors = []

        if (value instanceof Array) {
          if (this.schema.hasOwnProperty('additionalItems')) {
            if (this.schema.additionalItems === false) {
              if (data.value.length > value.length) {
                return {
                  error: 'size',
                  message: `the size of data must be less than, or equal to, ${value.length}`
                }
              }
            }
          }

          data.value.filter((item, i) => i < value.length).forEach((item, index) => {
            const schema = value[index]
            const result = utils.validateBySchema(this, schema, item)

            if (result !== true) {
              const type = schema.type

              errors.push({ index, item, type, errors: result })
            }
          })
        } else {
          data.value.forEach((item, index) => {
            const result = utils.validateBySchema(this, value, item)

            if (result !== true) {
              errors.push({ index, item, errors: result })
            }
          })
        }

        if (errors.length) {
          return {
            errors,
            message: 'there are some invalid item'
          }
        }

        return true
      },
      maxItems (value, data) {
        if (data.value.length > value) {
          return {
            size: data.value.length,
            maxItems: value,
            message: `too many items. must be less than, or equal to, ${value}`
          }
        }
        return true
      },
      minItems (value, data) {
        if (data.value.length < value) {
          return {
            size: data.value.length,
            minItems: value,
            message: `not enough items. must be greater than, or equal to, ${value}`
          }
        }
        return true
      },
      uniqueItems (value, data) {
        if (value === false) {
          return true
        }

        return [...new Set(data.value)].length === data.value.length
      }
    }
  }

  static validateSchema (schema, generic) {
    if (schema.hasOwnProperty('additionalItems')) {
      if (schema.additionalItems === null) {
        throw new Error('additionalItems cannot be null')
      }

      if (typeof schema.additionalItems === 'undefined') {
        throw new Error('additionalItems cannot be undefined')
      }

      const type = typeof schema.additionalItems
      const construct = schema.additionalItems.constructor

      if (type !== 'boolean' && construct !== utils.objectConstructor) {
        throw new Error('additionalItems must be either a boolean or an object')
      }

      if (type === 'object') {
        utils.validateJsonSchema(schema.additionalItems, generic, 'An additional item')
      }
    }

    if (schema.hasOwnProperty('items')) {
      if (schema.items === null) {
        throw new Error('items cannot be null')
      }

      let items = schema.items

      if (!(items instanceof Array)) {
        items = [ items ]
      } else {
        utils.validateUniqueArray(items, generic, 'items', 'schema')
      }

      items.forEach((item) =>
        utils.validateJsonSchema(item, generic, 'A item entry'))
    }

    if (schema.hasOwnProperty('maxItems')) {
      if (typeof schema.maxItems !== 'number' || schema.maxItems !== parseInt(schema.maxItems, 10)) {
        throw new Error('maxItems must be an integer')
      }

      if (schema.maxItems < 0) {
        throw new Error('maxItems must be greater than, or equal to, 0')
      }
    }

    if (schema.hasOwnProperty('minItems')) {
      if (typeof schema.minItems !== 'number' || schema.minItems !== parseInt(schema.minItems, 10)) {
        throw new Error('minItems must be an integer')
      }

      if (schema.minItems < 0) {
        throw new Error('minItems must be greater than, or equal to, 0')
      }
    }

    if (schema.hasOwnProperty('uniqueItems')) {
      if (typeof schema.uniqueItems !== 'boolean') {
        throw new Error('uniqueItems must be a boolean')
      }
    }
  }

  compile () {
    if (!this.schema.hasOwnProperty('uniqueItems')) {
      this.schema.uniqueItems = false
    }

    super.compile()
  }

  validate (data) {
    if (!Array.isArray(data.value)) {
      return false
    }

    return true
  }
}

module.exports = GenericArray
