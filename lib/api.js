'use strict'

const clone = require('clone')
const utils = require('./utils')
const generic = require('./generic')

module.exports.instance = () => {
  const genericInstance = clone(generic.types)
  const keywords = {}
  const api = {
    /**
     * Validate a schema. Throws an error for invalid schema
     * @param {object} schema - Schema to validate
     * @example
     * const schema = { type: 'string' }
     *
     * try {
     *   instance.validateSchema(schema)
     * } catch (err) {
     *   console.error(err)
     * }
     */
    validateSchema (schema) {
      if (typeof schema !== 'object' || schema === null) {
        throw new Error('schema must be an object')
      }

      if (schema.type instanceof Array) {
        throw new Error('schema.type must be a string')
      }

      if (!genericInstance.hasOwnProperty(schema.type)) {
        throw new Error(`Unknown type '${schema.type}'`)
      }

      if (genericInstance[schema.type].hasOwnProperty('validateSchema')) {
        genericInstance[schema.type]
          .validateSchema(schema, genericInstance)
      }

      return genericInstance[schema.type]
    },

    /**
     * Compile a schema
     * @param {object} schema - Schema to compile
     * @returns {object} Returns an interface with the `validate` member
     * @example
     * const schema = { type: 'string' }
     * const validator = instance.compile(schema)
     * const data = 'Hello, World!'
     * const report = validator.validate(data)
     *
     * console.log(report) // true
     */
    compile (schema) {
      const GenericType = this.validateSchema(schema)
      const validator = new GenericType(clone(schema), genericInstance)

      if (keywords.hasOwnProperty(schema.type)) {
        validator.keywords = keywords[schema.type]
      }

      validator.compile()

      return validator
    },

    /**
     * Add an alias for a type
     * @param {string} type - The name of a defined type
     * @param {string} name - The alias name
     * @example
     * instance.addAlias('integer', 'int')
     *
     * const schema = { type: 'int' }
     * const validator = instance.compile(schema)
     *
     * const result = validator.validate(123) // true
     */
    addAlias (type, name) {
      if (typeof name !== 'string') {
        throw new Error('alias must be a string')
      }

      if (!genericInstance.hasOwnProperty(type)) {
        throw new Error(`Unknown type '${type}'`)
      }

      genericInstance[name] = genericInstance[type]
    },

    /**
     * Add a new type to the instance
     * @param {string} name - The name of the new type
     * @param {object} [validator] - A validation function for the new type
     * @example
     * instance.addType('binary', (data) => {
     *   return Number.isInteger(data) && /^[01]+$/.test(data.toString())
     * })
     *
     * const schema = { type: 'binary' }
     * const validator = instance.compile(schema)
     *
     * const result = validator.validate(1111011) // true
     */
    addType (name, validator) {
      if (typeof validator !== 'function') {
        throw new Error('validator must be a function')
      }

      genericInstance[name] = class extends generic.Base {
        static validateSchema (schema) {
          if (schema.hasOwnProperty('enum')) {
            utils.validateUniqueArray(schema.enum, genericInstance, 'enum', 'string')
          }
        }

        validate (data) {
          return validator.apply(this, [ data ])
        }
      }
    },

    /**
     * Remove a type from the instance
     * @param {string} name - The nema of the type
     * @example
     * instance.removeType('string')
     *
     * const schema = { type: 'string' }
     * const validator = instance.compile(schema)
     * // throw Error: Unknown type 'string'
     */
    removeType (name) {
      if (genericInstance.hasOwnProperty(name)) {
        delete genericInstance[name]
      }
    },

    /**
     * Add a new keyword to a type
     * @param {string} type - The name of the type
     * @param {string} name - The name of the new keyword
     * @param {object} validator - A validation function for the new keyword
     */
    addKeyword (type, name, validator) {
      if (!genericInstance.hasOwnProperty(type)) {
        throw new Error(`Unknown type '${type}'`)
      }

      if (typeof validator !== 'function') {
        throw new Error('validator must be a function')
      }

      if (!keywords.hasOwnProperty(type)) {
        keywords[type] = {}
      }

      keywords[type][name] = validator
    },

    /**
     * Remove a keyword from a type
     * @param {string} type - The name of the type
     * @param {string} name - The name of the keyword
     * @example
     * instance.removeKeyword('string', 'minLength')
     *
     * const schema = { type: 'string', minLength: 5 }
     * const validator = instance.compile(schema)
     * const data = 'abc'
     * const result = validator.validate(data) // true
     */
    removeKeyword (type, name) {
      if (!genericInstance.hasOwnProperty(type)) {
        throw new Error(`Unknown type '${type}'`)
      }

      if (keywords.hasOwnProperty(type)) {
        if (keywords[type].hasOwnProperty(name)) {
          delete keywords[type][name]
        }
      }
    }
  }

  api.addAlias('numeric', 'number')

  return api
}
