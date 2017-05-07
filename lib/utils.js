'use strict'

module.exports.validateUniqueArray = (array, generic, prop, type) => {
  if (!Array.isArray(array)) {
    throw new Error(`${prop} must be an array`)
  }

  if (array.length === 0) {
    throw new Error(`${prop} must have at least one element`)
  }

  array.forEach((item) => {
    if (type === 'schema') {
      this.validateJsonSchema(item, generic, prop)
    } else {
      const typeItem = typeof item

      if (typeItem !== type) {
        throw new Error(`${prop} must be a list of ${type}`)
      }
    }
  })

  if ([...new Set(array)].length !== array.length) {
    throw new Error(`${prop} must be a list of unique ${type}`)
  }
}

module.exports.validateSchemaType = (entry, generic, prop) => {
  let type = entry.type

  if (!Array.isArray(type)) {
    type = [ type ]
  } else if (type.length === 0) {
    throw new Error(`${prop} must have at least one item`)
  }

  type.forEach((item) => {
    if (!generic.hasOwnProperty(item)) {
      throw new Error(`${prop} must be a valid JSON Schema`)
    }

    generic[item].validateSchema(entry, generic)
  })
}

module.exports.validateDefaultSchemaValue = function (schema) {
  if (schema.hasOwnProperty('default')) {
    if (this.validate(schema.default) !== true) {
      throw new Error(`Invalid default value ${JSON.stringify(schema.default)}`)
    }
  }
}

const objectConstructor = {}.constructor

module.exports.objectConstructor = objectConstructor
module.exports.validateObject = (entry, prop, expectedType) => {
  if (entry === null) {
    throw new Error(`${prop} cannot be null`)
  }

  if (entry === undefined) {
    throw new Error(`${prop} cannot be undefined`)
  }

  if (entry.constructor !== objectConstructor) {
    expectedType = expectedType || 'an object'

    throw new Error(`${prop} must be ${expectedType}`)
  }
}

module.exports.validateJsonSchema = (schema, generic, prop) => {
  if (!schema || schema.constructor !== objectConstructor) {
    throw new Error(`${prop} must be a valid JSON Schema`)
  }

  this.validateSchemaType(schema, generic, prop)

  if (typeof schema.type === 'string') {
    generic[schema.type].validateSchema(schema, generic)
  }
}

module.exports.validateBySchema = (self, schema, data) => {
  const validator = self.$generic[schema.type]
  const $schema = self.$schema

  validator.$schema = schema
  validator.$generic = self.$generic

  const error = validator.validate(data)

  validator.$schema = $schema

  return error !== true ? error : true
}
