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

function compileBySchema (self, schema) {
  const GenericSchema = self.generic[schema.type]
  const validator = new GenericSchema(schema, self.options)

  validator.compile()

  return validator
}

module.exports.compileBySchema = compileBySchema
module.exports.validateBySchema = (self, schema, data) => {
  const validator = compileBySchema(self, schema)

  return validator.validate(data)
}
