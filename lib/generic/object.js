'use strict'

const utils = require('../utils')

module.exports = {
  validateSchema (schema, generic) {
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
        utils.validateObject(schema.additionalProperties, 'additionalProperties', 'a boolean or a schema')

        Object.keys(schema.additionalProperties).forEach((prop) => {
          const entry = schema.additionalProperties[prop]

          utils.validateObject(entry, 'An additional property entry', 'a JSON Schema')
          utils.validateSchemaType(entry, generic, 'An additional property entry')
        })
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
  },
  compile (schema) {
    if (schema.hasOwnProperty('additionalProperties')) {
      if (typeof schema.additionalProperties !== 'boolean') {
        if (!schema.hasOwnProperty('properties')) {
          schema.properties = {}
        }

        for (let prop in schema.additionalProperties) {
          if (!schema.properties.hasOwnProperty(prop)) {
            schema.properties[prop] = schema.additionalProperties[prop]
          }
        }

        delete schema.additionalProperties
      }
    }

    if (schema.hasOwnProperty('properties')) {
      for (let prop in schema.properties) {
        const type = schema.properties[prop].type

        if (typeof type === 'string') {
          if (typeof schema.$generic[type].compile === 'function') {
            schema.$generic[type].compile(schema.properties[prop])
          }
        }
      }
    }

    utils.validateDefaultSchemaValue.apply(this, [ schema ])
  },
  validate (data) {
    try {
      utils.validateObject(data, 'data')
    } catch (e) {
      return false
    }
    return true
  },
  keywords: {
    required (value, data) {
      const missingFields = value.filter((prop) => !data.hasOwnProperty(prop))

      if (missingFields.length) {
        return {
          required: missingFields,
          message: 'missing required fields'
        }
      }

      return true
    },

    maxProperties (value, data) {
      const dataKeys = Object.keys(data)

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
      const dataKeys = Object.keys(data)

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
      let missing = []

      Object.keys(value).forEach((prop) => {
        if (data.hasOwnProperty(prop)) {
          const dependency = value[prop]

          if (dependency instanceof Array) {
            return dependency.forEach((required) => {
              if (!data.hasOwnProperty(required)) {
                missing.push({ prop, required })
              }
            })
          }

          const type = dependency.type = dependency.type || 'object'
          const validator = this.$generic[type]
          const $schema = validator.$schema

          dependency.$generic = this.$generic

          validator.compile(dependency)

          validator.$schema = dependency

          const result = validator.validate(data, 'oui')

          validator.$schema = $schema

          if (result instanceof Array) {
            missing = missing.concat(result)
          }
        }
      })

      if (missing.length) {
        return {
          missing,
          message: 'there are some missing dependencies'
        }
      }

      return true
    },

    properties (value, data) {
      const errors = []

      Object.keys(data).forEach((prop) => {
        if (value.hasOwnProperty(prop)) {
          const property = value[prop]
          const genericPropertySchema = this.$generic[property.type]
          const error = genericPropertySchema.validate(data[prop])

          if (error !== true) {
            errors.push({ prop, error })
          }
        }
      })

      if (errors.length) {
        return errors
      }

      return true
    },

    patternProperties (value, data) {
      let additionalProperties = Object.keys(data)

      if (this.$schema.hasOwnProperty('properties')) {
        additionalProperties = additionalProperties.filter((prop) => {
          return !this.$schema.properties.hasOwnProperty(prop)
        })
      }

      if (additionalProperties.length) {
        const patterns = Object.keys(value)

        for (let pattern of patterns) {
          const re = new RegExp(pattern)
          const entry = value[pattern]
          const validator = this.$generic[entry.type]
          let errors = []
          const $schema = validator.$schema

          entry.$generic = this.$generic
          validator.$schema = entry

          for (let i in additionalProperties) {
            const prop = additionalProperties[i]

            if (re.test(prop)) {
              let error = validator.validate(data[prop])

              if (error !== true) {
                errors = errors.concat(error)
              }

              delete additionalProperties[i]
              break
            }
          }

          validator.$schema = $schema

          if (errors.length) {
            return { errors }
          }
        }
      }

      return true
    },

    additionalProperties (value, data) {
      if (value === false) {
        const errors = []
        let globalMatches = []
        let additionalProperties = Object.keys(data)

        if (this.$schema.hasOwnProperty('properties')) {
          additionalProperties = additionalProperties.filter((prop) => {
            return !this.$schema.properties.hasOwnProperty(prop)
          })
        }

        if (this.$schema.hasOwnProperty('patternProperties')) {
          Object.keys(this.$schema.patternProperties).forEach((pattern) => {
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
      }

      return true
    }
  }
}
