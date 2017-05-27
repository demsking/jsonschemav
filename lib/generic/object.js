'use strict'

const utils = require('../utils')
const clone = require('clone')
const Base = require('./base')

class GenericObject extends Base {
  constructor (schema, options) {
    super(schema, options)

    this.keywords = {
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
        let missing = []

        Object.keys(value).forEach((prop) => {
          if (data.value.hasOwnProperty(prop)) {
            const dependency = value[prop]

            if (dependency instanceof Array) {
              return dependency.forEach((required) => {
                if (!data.value.hasOwnProperty(required)) {
                  missing.push({ prop, required })
                }
              })
            }

            dependency.type = dependency.type || 'object'

            const result = utils.validateBySchema(this, dependency, data.value)

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

        Object.keys(data.value).forEach((prop) => {
          if (value.hasOwnProperty(prop)) {
            const property = value[prop]
            const GenericPropType = this.generic[property.type]
            const genericPropInstance = new GenericPropType(property, this.options)

            const error = genericPropInstance.validate(data.value[prop])

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
        let additionalProperties = Object.keys(data.value)

        if (this.schema.hasOwnProperty('properties')) {
          additionalProperties = additionalProperties.filter((prop) => {
            return !this.schema.properties.hasOwnProperty(prop)
          })
        }

        if (additionalProperties.length) {
          const patterns = Object.keys(value)

          for (let pattern of patterns) {
            const re = new RegExp(pattern)
            const entry = value[pattern]
            const GenericPattern = this.generic[entry.type]
            const validator = new GenericPattern(entry, this.options)
            let errors = []

            validator.compile()

            for (let i in additionalProperties) {
              const prop = additionalProperties[i]

              if (re.test(prop)) {
                let error = validator.validate(data.value[prop])

                if (error !== true) {
                  errors = errors.concat(error)
                }

                delete additionalProperties[i]
                break
              }
            }

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
      for (let prop in this.schema.properties) {
        const type = this.schema.properties[prop].type

        if (typeof type === 'string') {
          const propSchema = this.schema.properties[prop]

          if (propSchema.hasOwnProperty('default')) {
            utils.compileBySchema(this, propSchema)
          }
        }
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
