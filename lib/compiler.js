'use strict'

const clone = require('clone')
const utils = require('./utils')
const generic = require('./generic')

function compileSchema (schema, genericInstance) {
  Object.keys(genericInstance).forEach((type) => {
    const entry = genericInstance[type]

    schema.$generic = genericInstance
    entry.$generic = genericInstance
    entry.$schema = schema
    entry.validate = ((fn) => function (data) {
      const argv = Array.from(arguments)
      let result = fn.apply(entry, argv)

      if (result === false) {
        return [{
          keyword: 'type',
          message: 'invalid type input'
        }]
      }

      if (result !== true) {
        if (result instanceof Promise) {
          return result
        }

        if (!Array.isArray(result)) {
          return [ result ]
        }

        return result
      }

      let errors = []
      const exclude = [ 'type', 'default' ]
      const keywords = Object.keys(entry.$schema).filter((item) => {
        return exclude.indexOf(item) === -1
      })

      keywords.forEach((keyword) => {
        if (!this.keywords.hasOwnProperty(keyword)) {
          return
        }

        const value = entry.$schema[keyword]
        const args = [ value ].concat(argv)

        result = entry.keywords[keyword].apply(entry, args)

        if (result === true) {
          return
        }

        if (result === false) {
          return errors.push({ keyword, message: 'invalid' })
        }

        errors.push(Object.assign({ keyword }, result))
      })

      if (errors.length === 0) {
        return true
      }

      return errors
    })(entry.validate)
  })

  const validator = genericInstance[schema.type]

  if (typeof validator.compile === 'function') {
    validator.compile(schema)
  }

  return validator
}

module.exports.instance = () => {
  const genericInstance = clone(generic)
  const api = {
    /**
     * Add an alias for a type
     * @param {string} type - The name of a defined type
     * @param {string} name - The alias name
     */
    addAlias (type, name) {
      if (typeof name !== 'string') {
        throw new Error('alias must be a string')
      }

      if (!genericInstance.hasOwnProperty(type)) {
        throw new Error(`Unknow type '${type}'`)
      }

      genericInstance[name] = genericInstance[type]
    },

    /**
     * Clone a type
     * @param {string} type - The name of a defined type
     * @param {string} name - The new type name
     * @param {object} prototype - The overwrite prototype object
     * @example
     * const axios = require('axios')
     * const endpoint = 'https://twitter.com/users/username_available'
     *
     * instance.clone('string', 'twitter', {
     *   validateSchema (schema, generic) {
     *     // schema is the user schema to validate
     *     // generic is the set of current instance defined types
     *     // use this function to validate the user schema
     *     // the method must trown any invalid errors
     *     // no return is require
     *   },
     *   validate (data) {
     *     // use this function to validate the user data
     *     // the function must return
     *     // - a true boolean value on success
     *     // - a false boolean value on invalid type
     *     // - a Promise for async validation
     *     return axios.get(`${endpoint}?username=${data}`)
     *       .then((response) => {
     *         if (response.data.valid) {
     *           return {
     *             keyword: 'notfound',
     *             message: 'The username does not exists'
     *           }
     *         }
     *         return true
     *       })
     *   }
     * })
     *
     * const schema = { type: 'twitter' }
     * const validator = instance.compile(schema)
     *
     * validator.validate('demsking').then((result) => {
     *   console.log(result)
     *   // { keyword: 'taken',
     *   //   message: 'This username is already taken' }
     * })
     *
     * validator.validate('nonexistingac').then((result) => {
     *   console.log(result) // true
     * })
     */
    clone (type, name, prototype) {
      if (typeof name !== 'string') {
        throw new Error('name must be a string')
      }

      if (!genericInstance.hasOwnProperty(type)) {
        throw new Error(`Unknow type '${type}'`)
      }

      if (typeof prototype !== 'object' && prototype !== null) {
        throw new Error('prototype must be an object')
      }

      genericInstance[name] = clone(genericInstance[type])

      if (prototype.hasOwnProperty('validateSchema')) {
        genericInstance[name].validateSchema = ((fn) => (schema, generic) => {
          prototype.validateSchema(schema, generic)
          fn(schema, generic)
        })(genericInstance[name].validateSchema)
      }

      if (prototype.hasOwnProperty('validate')) {
        genericInstance[name].validate = prototype.validate
      }
    },

    /**
     * Add a new type to the instance
     * @param {string} name - The name of the new type
     * @param {object} [validator] - A validation function for the new type
     */
    addType (name, validator) {
      if (typeof validator === 'undefined') {
        validator = () => true
      }

      if (typeof validator !== 'function') {
        throw new Error('validator must be a function')
      }

      genericInstance[name] = {
        validateSchema (schema) {
          if (schema.hasOwnProperty('enum')) {
            utils.validateUniqueArray(schema.enum, genericInstance, 'enum', 'string')
          }

          utils.validateDefaultSchemaValue.apply(this, [ schema ])
        },
        validate: validator,
        keywords: {}
      }
    },

    /**
     * Remove a type from the instance
     * @param {string} name - The nema of the type
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
        throw new Error(`Unknow type '${type}'`)
      }

      if (typeof validator !== 'function') {
        throw new Error('validator must be a function')
      }

      genericInstance[type].keywords[name] = validator
    },

    /**
     * Remove a keyword from a type
     * @param {string} type - The name of the type
     * @param {string} name - The name of the keyword
     */
    removeKeyword (type, name) {
      if (!genericInstance.hasOwnProperty(type)) {
        throw new Error(`Unknow type '${type}'`)
      }

      if (genericInstance[type].keywords.hasOwnProperty(name)) {
        delete genericInstance[type].keywords[name]
      }
    },

    /**
     * Validate a schema
     * @param {object} schema - Schema to validate
     */
    validateSchema (schema) {
      if (typeof schema !== 'object' || schema === null) {
        throw new Error('schema must be an object')
      }

      if (schema.type instanceof Array) {
        throw new Error('schema.type must be a string')
      }

      if (!genericInstance.hasOwnProperty(schema.type)) {
        throw new Error(`Unknow type '${schema.type}'`)
      }

      const _schema = clone(schema)

      genericInstance[_schema.type]
        .validateSchema(_schema, genericInstance)

      compileSchema(_schema, genericInstance)

      return _schema
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
      const _schema = this.validateSchema(schema)
      const validator = genericInstance[schema.type]

      if (typeof validator.compile === 'function') {
        validator.compile(_schema)
      }

      return {
        /*
         * Validate a data
         * @returns {boolean|string|array}
         * Returns a `true` boolean value when the validation success, a string `type` when there is an error with the type of data and an array of errors when there are other errors
         */
        validate (data) {
          if (typeof data === 'undefined' && _schema.hasOwnProperty('default')) {
            data = _schema.default
          }

          return validator.validate(data)
        }
      }
    }
  }

  api.addAlias('numeric', 'number')
  api.clone('numeric', 'integer', {
    validate (data) {
      if (typeof data !== 'number' || data !== parseInt(data, 10)) {
        return {
          keyword: 'type',
          message: 'data must be an integer'
        }
      }

      return true
    }
  })

  return api
}
