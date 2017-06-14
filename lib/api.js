'use strict'

const clone = require('clone')
const utils = require('./utils')
const generic = require('./generic')

class JsonSchemav {
  constructor (options) {
    options = options || {}

    options.generic = clone(generic.types)
    options.keywords = {}
    options.compileSteps = {}

    Object.defineProperty(this, 'options', { value: options })
  }

  /**
   * Validate a schema. Throws an error for invalid schema
   * @param {object} schema - Schema to validate
   * @example
   * const jsv = new JsonSchemav()
   * const schema = { type: 'string' }
   *
   * try {
   *   jsv.validateSchema(schema)
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

    if (!this.options.generic.hasOwnProperty(schema.type)) {
      throw new Error(`Unknown type '${schema.type}'`)
    }

    if (this.options.generic[schema.type].hasOwnProperty('validateSchema')) {
      this.options.generic[schema.type]
        .validateSchema(schema, this.options.generic)
    }

    return this.options.generic[schema.type]
  }

  /**
   * Compile a schema
   * @param {object} schema - Schema to compile
   * @returns {Promise} Returns the validation interface on success and an error otherwise
   * @example
   * const jsv = new JsonSchemav()
   * const schema = {
   *   type: 'object',
   *   properties: {
   *     title: { type: 'string' },
   *     date: { type: 'string', format: 'date', default: 'now()' }
   *   }
   * }
   * const data = { title: 'Hello, World!' }
   *
   * jsv.compile(schema)
   *   .then((instance) => instance.validate(data))
   *   .then((parsedData) => {
   *      // use `parsedData` instead `data`
   *      console.log(parsedData)
   *      // { title: 'Hello, World!',
   *      //   date: '2017-06-12T18:49:14.739Z' }
   *   })
   *   .catch((err) => {
   *      console.error(err.errors) // a list of parsing error
   *   })
   */
  compile (schema) {
    const GenericType = this.validateSchema(schema)
    const instance = new GenericType(clone(schema), this.options)

    return instance.compile()
  }

  /**
   * Add a compile step function to a type
   * @param {string} type - The name of the type
   * @param {function} compileStepFn - A compile function
   */
  addCompileStep (type, compileStepFn) {
    if (!this.options.generic.hasOwnProperty(type)) {
      throw new Error(`Unknown type '${type}'`)
    }

    if (typeof compileStepFn !== 'function') {
      throw new Error('compileStepFn must be a function')
    }

    if (!this.options.compileSteps.hasOwnProperty(type)) {
      this.options.compileSteps[type] = []
    }

    this.options.compileSteps[type].push(compileStepFn)
  }

  /**
   * Add an alias for a type
   * @param {string} type - The name of a defined type
   * @param {string} name - The alias name
   * @example
   * const jsv = new JsonSchemav()
   * const schema = { type: 'int' }
   * const data = 123
   *
   * jsv.addAlias('integer', 'int')
   * jsv.compile(schema)
   *   .then((instance) => instance.validate(data))
   *   .then((parsedData) => {
   *      // use `parsedData` instead `data`
   *      console.log(parsedData) // 123
   *   })
   *   .catch((err) => {
   *      // err.errors is a list of parsing error
   *   })
   */
  addAlias (type, name) {
    if (typeof name !== 'string') {
      throw new Error('alias must be a string')
    }

    if (!this.options.generic.hasOwnProperty(type)) {
      throw new Error(`Unknown type '${type}'`)
    }

    this.options.generic[name] = this.options.generic[type]
  }

  /**
   * Add a new type to the instance
   * @param {string} name - The name of the new type
   * @param {function} [validateFn] - A validate function for the new type
   * @example
   * const jsv = new JsonSchemav()
   * const validateFn = (data) => {
   *   return Number.isInteger(data.value) && /^[01]+$/.test(data.value.toString())
   * }
   *
   * jsv.addType('binary', validateFn)
   *
   * const schema = { type: 'binary' }
   * const data = 1111011
   * const instance = jsv.compile(schema)
   *
   * jsv.compile(schema)
   *   .then((instance) => instance.validate(data))
   *   .then((parsedData) => {
   *     // use `parsedData` instead `data`
   *     console.log(parsedData) // 1111011
   *   })
   */
  addType (name, validateFn) {
    if (typeof validateFn !== 'function') {
      throw new Error('validateFn must be a function')
    }

    const _generic = this.options.generic

    this.options.generic[name] = class extends generic.Base {
      static validateSchema (schema) {
        if (schema.hasOwnProperty('enum')) {
          utils.validateUniqueArray(schema.enum, _generic, 'enum', 'string')
        }
      }

      validate (data) {
        return validateFn.apply(this, [ data ])
      }
    }
  }

  /**
   * Remove a type from the instance
   * @param {string} name - The nema of the type
   * @example
   * const schema = { type: 'string' }
   * const jsv = new JsonSchemav()
   *
   * jsv.removeType('string')
   *
   * try {
   *   jsv.validateSchema(schema)
   * } catch (err) {
   *   console.error(err) // Error: Unknown type 'string'
   * }
   */
  removeType (name) {
    if (this.options.generic.hasOwnProperty(name)) {
      delete this.options.generic[name]
    }
  }

  /**
   * Add a new keyword to a type
   * @param {string} type - The name of the type
   * @param {string} name - The name of the new keyword
   * @param {function} validateFn - A validate function for the new keyword
   * @example
   * const jsv = new JsonSchemav()
   * const validateFn = function (value, data) {
   *   // value is the keyword value
   *   // data.value is the user data
   *   // the function must returns:
   *   //   - true: for a success validation
   *   //   - false: for a faillure validate
   *   //   - an object { message, errors }
   *   //   - a Promise for async validation
   *
   *   return new Promise((resolve, reject) => {
   *     //...
   *   })
   * }
   *
   * jsv.addKeyword('string', 'provider', validateFn)
   *
   * // and then
   * const schema = {
   *   type: 'object',
   *   properties: {
   *     account: { type: 'string', provider: 'twitter' }
   *   }
   * }
   */
  addKeyword (type, name, validateFn) {
    if (!this.options.generic.hasOwnProperty(type)) {
      throw new Error(`Unknown type '${type}'`)
    }

    if (typeof validateFn !== 'function') {
      throw new Error('validateFn must be a function')
    }

    if (!this.options.keywords.hasOwnProperty(type)) {
      this.options.keywords[type] = {}
    }

    this.options.keywords[type][name] = validateFn
  }

  /**
   * Remove a keyword from a type
   * @param {string} type - The name of the type
   * @param {string} name - The name of the keyword
   * @example
   * const jsv = new JsonSchemav()
   *
   * jsv.removeKeyword('string', 'minLength')
   *
   * const schema = { type: 'string', minLength: 5 }
   * const instance = jsv.compile(schema)
   * const data = 'abc'
   *
   * jsv.compile(schema)
   *   .then((instance) => instance.validate(data))
   *   .then((parsedData) => {
   *      // success
   *   })
   */
  removeKeyword (type, name) {
    if (!this.options.generic.hasOwnProperty(type)) {
      throw new Error(`Unknown type '${type}'`)
    }

    if (this.options.keywords.hasOwnProperty(type)) {
      if (this.options.keywords[type].hasOwnProperty(name)) {
        delete this.options.keywords[type][name]
      }
    }
  }
}

module.exports = JsonSchemav
