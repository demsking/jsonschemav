'use strict'

const utils = require('../utils')
const clone = require('clone')
const Base = require('./base')

const validateDependencySchema = (self, schema, data, prop) => {
  const GenericSchema = self.generic[schema.type]
  const jsv = new GenericSchema(schema, self.options)

  return jsv.compile()
    .then((instance) => instance.validate(data))
    .then((result) => {
      if (result instanceof Error) {
        throw result
      }
      return result
    })
    .catch((err) => {
      err.props = { prop, data, schema }
      throw err
    })
}

const keywords = {
  required (value, data) {
    const missingFields = value.filter((prop) => !data.value.hasOwnProperty(prop))

    if (missingFields.length) {
      return {
        required: missingFields,
        message: 'missing required fields'
      }
    }

    return true
  },

  maxProperties (value, data) {
    const dataKeys = Object.keys(data.value)

    if (dataKeys.length > value) {
      return {
        size: dataKeys.length,
        maxProperties: value,
        message: `too many properties. must be less than, or equal to, ${value}`
      }
    }
    return true
  },

  minProperties (value, data) {
    const dataKeys = Object.keys(data.value)

    if (dataKeys.length < value) {
      return {
        size: dataKeys.length,
        minProperties: value,
        message: `not enough properties. must be greater than, or equal to, ${value}`
      }
    }
    return true
  },

  dependencies (value, data) {
    const deps = Object.keys(value).filter((v) => data.value.hasOwnProperty(v))
    const missing = []

    deps.forEach((prop) => {
      const dependency = value[prop]

      if (dependency instanceof Array) {
        dependency.forEach((required) => {
          if (!data.value.hasOwnProperty(required)) {
            missing.push({ prop, required })
          }
        })
      }
    })

    if (missing.length) {
      return {
        missing: missing,
        message: 'there are some missing dependencies'
      }
    }

    const validators = deps.filter((d) => !Array.isArray(d)).map((prop) => {
      const schema = Object.assign({ type: 'object' }, value[prop])

      return validateDependencySchema(this, schema, data.value, prop)
    })

    if (validators.length) {
      return Promise.all(validators)
    }

    return true
  },

  properties (value, data) {
    const props = Object.keys(value).filter((prop) =>
      data.value.hasOwnProperty(prop) ||
        value[prop].hasOwnProperty('default'))
    const validators = props.map((prop) => {
      const schema = value[prop]
      const GenericSchema = this.generic[schema.type]
      const jsv = new GenericSchema(schema, this.options)

      return jsv.compile()
        .then((instance) => instance.validate(data.value[prop]))
        .then((parsedData) => data.value[prop] = parsedData)
        .catch((err) => {
          err.props = { prop, data: data.value[prop], schema }
          throw err
        })
    })

    return Promise.all(validators)
  },

  patternProperties (value, data) {
    let additionalProperties = Object.keys(data.value)

    if (this.schema.hasOwnProperty('properties')) {
      additionalProperties = additionalProperties.filter((prop) => {
        return !this.schema.properties.hasOwnProperty(prop)
      })
    }

    if (additionalProperties.length) {
      const patterns = Object.keys(value).map((pattern) => ({
        pattern: pattern,
        re: new RegExp(pattern),
        schema: value[pattern]
      }))

      const validators = additionalProperties.map((prop) => {
        const item = patterns.find((p) => p.re.test(prop))

        if (!item) {
          return null
        }

        const GenericPattern = this.generic[item.schema.type]
        const jsv = new GenericPattern(item.schema, this.options)

        return jsv.compile().then((instance) => instance.validate(data.value[prop]))
      }).filter((item) => item !== null)

      if (validators.length) {
        return Promise.all(validators)
      }
    }

    return true
  },

  additionalProperties (value, data) {
    if (value === false) {
      const errors = []
      let globalMatches = []
      let additionalProperties = Object.keys(data.value)

      if (this.schema.hasOwnProperty('properties')) {
        additionalProperties = additionalProperties.filter((prop) => {
          return !this.schema.properties.hasOwnProperty(prop)
        })
      }

      if (this.schema.hasOwnProperty('patternProperties')) {
        Object.keys(this.schema.patternProperties).forEach((pattern) => {
          const re = new RegExp(pattern)
          const matches = additionalProperties.filter((prop) => re.test(prop))

          globalMatches = globalMatches.concat(matches)
        })
      }

      additionalProperties.forEach((prop) => {
        if (globalMatches.indexOf(prop) === -1) {
          errors.push(prop)
        }
      })

      if (errors.length) {
        return {
          properties: errors,
          message: 'no additional properties'
        }
      }
    } else if (typeof value === 'object') {
      const GenericAddType = this.generic[value.type]
      const validator = new GenericAddType(value, this.options)
      const dataWithAddProps = clone(data.value)

      if (this.schema.hasOwnProperty('properties')) {
        Object.keys(dataWithAddProps).forEach((prop) => {
          if (this.schema.properties.hasOwnProperty(prop)) {
            delete dataWithAddProps[prop]
          }
        })
      }

      validator.compile()

      return validator.validate(dataWithAddProps)
    }

    return true
  }
}

class GenericObject extends Base {
  constructor (schema, options) {
    super(schema, options, keywords)
  }

  static validateSchema (schema, generic) {
    if (schema.hasOwnProperty('maxProperties')) {
      if (typeof schema.maxProperties !== 'number' || schema.maxProperties !== parseInt(schema.maxProperties, 10)) {
        throw new Error('maxProperties must be an integer')
      }

      if (schema.maxProperties < 0) {
        throw new Error('maxProperties must be greater than, or equal to, 0')
      }
    }

    if (schema.hasOwnProperty('minProperties')) {
      if (typeof schema.minProperties !== 'number' || schema.minProperties !== parseInt(schema.minProperties, 10)) {
        throw new Error('minProperties must be an integer')
      }

      if (schema.minProperties < 0) {
        throw new Error('minProperties must be greater than, or equal to, 0')
      }
    }

    if (schema.hasOwnProperty('properties')) {
      utils.validateObject(schema.properties, 'properties')

      Object.keys(schema.properties).forEach((key) => {
        const entry = schema.properties[key]

        utils.validateObject(entry, 'A property entry', 'a JSON Schema')

        utils.validateSchemaType(entry, generic, 'A property entry')
      })
    }

    if (schema.hasOwnProperty('required')) {
      utils.validateUniqueArray(schema.required, generic, 'required', 'string')

      if (!schema.hasOwnProperty('properties')) {
        throw new Error('Missing properties entry')
      } else {
        schema.required.forEach((property) => {
          if (!schema.properties.hasOwnProperty(property)) {
            throw new Error(`Missing '${property}' property`)
          }
        })
      }
    }

    if (schema.hasOwnProperty('patternProperties')) {
      utils.validateObject(schema.patternProperties, 'patternProperties')

      Object.keys(schema.patternProperties).forEach((pattern) => {
        this.__re = new RegExp(pattern) // just to avoid lint
        const entry = schema.patternProperties[pattern]

        utils.validateObject(entry, 'A property entry', 'a JSON Schema')
        utils.validateSchemaType(entry, generic, 'A property entry')
      })
    }

    if (schema.hasOwnProperty('additionalProperties')) {
      if (typeof schema.additionalProperties !== 'boolean') {
        utils.validateObject(schema.additionalProperties,
          'additionalProperties', 'a boolean or a schema')
        utils.validateSchemaType(schema.additionalProperties, generic,
          'additionalProperties')
      }
    }

    if (schema.hasOwnProperty('dependencies')) {
      utils.validateObject(schema.dependencies, 'dependencies')

      const keys = Object.keys(schema.dependencies)

      if (keys.length) {
        if (!schema.hasOwnProperty('properties')) {
          throw new Error('Missing properties entry')
        }

        keys.forEach((property) => {
          if (!schema.properties.hasOwnProperty(property)) {
            throw new Error(`Missing '${property}' property`)
          }

          let dependency = schema.dependencies[property]

          if (dependency instanceof Array) {
            utils.validateUniqueArray(dependency, generic, 'A dependency entry', 'string')

            return dependency.forEach((item) => {
              if (!schema.properties.hasOwnProperty(item)) {
                throw new Error(`Missing '${item}' property`)
              }
            })
          }

          utils.validateObject(dependency, 'A dependency entry')

          if (dependency.hasOwnProperty('type')) {
            utils.validateSchemaType(dependency, generic, 'A dependency entry')
          }
        })
      }
    }
  }

  compile () {
    if (this.schema.hasOwnProperty('properties')) {
      const validators = Object.keys(this.schema.properties)
        .filter((prop) => {
          const schema = this.schema.properties[prop]

          if (typeof schema.type === 'string') {
            if (schema.hasOwnProperty('default')) {
              return true
            }
          }

          return false
        })
        .map((prop) => {
          const schema = this.schema.properties[prop]
          const GenericSchema = this.generic[schema.type]
          const jsv = new GenericSchema(schema, this.options)

          return jsv.compile()
        })

      if (validators.length) {
        return Promise.all(validators).then(() => super.compile())
      }
    }

    return super.compile()
  }

  validate (data) {
    try {
      utils.validateObject(data.value, 'data')
    } catch (e) {
      return false
    }
    return true
  }
}

module.exports = GenericObject
