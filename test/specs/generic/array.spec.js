'use strict'

const assert = require('assert')
const compiler = require('../../../lib/compiler')

/* global describe it */

describe('generic.array.validateSchema', () => {
  const instance = compiler.instance()

  it('should successfully validate schema with additionalItems', () => {
    const schema = {
      type: 'array'
    }

    assert.throws(() => {
      schema.additionalItems = null
      instance.validateSchema(schema)
    }, /additionalItems cannot be null/, 'should validate with a null additionalItems value')

    assert.throws(() => {
      schema.additionalItems = undefined
      instance.validateSchema(schema)
    }, /additionalItems cannot be undefined/, 'should validate with an undefined additionalItems value')

    assert.throws(() => {
      schema.additionalItems = []
      instance.validateSchema(schema)
    }, /additionalItems must be either a boolean or an object/, 'should validate with a invalid boolean and object')

    assert.throws(() => {
      schema.additionalItems = {}
      instance.validateSchema(schema)
    }, /An additional item must be a valid JSON Schema/, 'should validate with an empty additionalItems value')

    assert.throws(() => {
      schema.additionalItems = { name: { type: 'undefined' } }
      instance.validateSchema(schema)
    }, /An additional item must be a valid JSON Schema/, 'should validate with an invalid additional property value')

    assert.throws(() => {
      schema.additionalItems = { type: null }
      instance.validateSchema(schema)
    }, /An additional item must be a valid JSON Schema/, 'should validate with an invalid additional property value')

    assert.doesNotThrow(() => {
      schema.additionalItems = { type: 'string' }
      instance.validateSchema(schema)
    }, 'should validate with a valid additional JSON Schema entry')

    assert.doesNotThrow(() => {
      schema.additionalItems = { type: [ 'string' ] }
      instance.validateSchema(schema)
    }, 'should validate with a valid additional JSON Schema entry with  an array type')

    assert.doesNotThrow(() => {
      schema.additionalItems = true
      instance.validateSchema(schema)
    }, 'should validate with a boolean true value')
  })

  it('should successfully validate schema with maxItems', () => {
    const schema = {
      type: 'array',
      maxItems: 12
    }

    assert.doesNotThrow(() =>
      instance.validateSchema(schema), 'should validate an integer value')

    assert.doesNotThrow(() => {
      schema.maxItems = 0

      instance.validateSchema(schema)
    }, 'should validate an 0 integer value')

    assert.throws(() => {
      schema.maxItems = -1

      instance.validateSchema(schema)
    }, /maxItems must be greater than, or equal to, 0/, 'should validate with a negative integer value `-1`')

    assert.throws(() => {
      schema.maxItems = 'abc'

      instance.validateSchema(schema)
    }, /maxItems must be an integer/, 'should validate with a string value `abc`')

    assert.throws(() => {
      schema.maxItems = '123'

      instance.validateSchema(schema)
    }, /maxItems must be an integer/, 'should validate with a string value value `123`')
  })

  it('should successfully validate schema with minItems', () => {
    const schema = {
      type: 'array',
      minItems: 12
    }

    assert.doesNotThrow(() =>
      instance.validateSchema(schema), 'should validate an integer value')

    assert.doesNotThrow(() => {
      schema.minItems = 0

      instance.validateSchema(schema)
    }, 'should validate an 0 integer value')

    assert.throws(() => {
      schema.minItems = -1

      instance.validateSchema(schema)
    }, /minItems must be greater than, or equal to, 0/, 'should validate with a negative integer value `-1`')

    assert.throws(() => {
      schema.minItems = 'abc'

      instance.validateSchema(schema)
    }, /minItems must be an integer/, 'should validate with a string value `abc`')

    assert.throws(() => {
      schema.minItems = '123'

      instance.validateSchema(schema)
    }, /minItems must be an integer/, 'should validate with a string value value `123`')
  })

  it('should successfully validate schema with items', () => {
    const schema = {
      type: 'array'
    }

    assert.throws(() => {
      schema.items = null
      instance.validateSchema(schema)
    }, /items cannot be null/, 'should validate with a null items entry')

    assert.doesNotThrow(() => {
      schema.items = [ { type: 'string' } ]
      instance.validateSchema(schema)
    }, 'should validate an unique array values')

    assert.throws(() => {
      schema.items = undefined
      instance.validateSchema(schema)
    }, /A item entry must be a valid JSON Schema/, 'should validate with an undefined items entry')

    assert.throws(() => {
      schema.items = 'invalid entry'
      instance.validateSchema(schema)
    }, /A item entry must be a valid JSON Schema/, 'should validate with a non array items entry')

    assert.throws(() => {
      schema.items = []
      instance.validateSchema(schema)
    }, /items must have at least one element/, 'should validate with a array items entry')
  })

  it('should successfully validate schema with uniqueItems', () => {
    const schema = {
      type: 'array'
    }

    assert.throws(() => {
      schema.uniqueItems = null
      instance.validateSchema(schema)
    }, /uniqueItems must be a boolean/, 'should validate with a null uniqueItems value')

    assert.doesNotThrow(() => {
      schema.uniqueItems = false
      instance.validateSchema(schema)
    }, 'should validate with a valid value')
  })
})

describe('generic.array.compile', () => {
  const instance = compiler.instance()
  const schema = {
    type: 'array'
  }

  it('should successfully compile schema with missing uniqueItems', () => {
    const _schema = instance.validateSchema(schema)

    assert.ok(_schema.hasOwnProperty('uniqueItems'), 'should have the uniqueItems keyword')
    assert.equal(_schema.uniqueItems, false, 'should have the uniqueItems keyword with boolean value false')
  })

  it('should successfully compile schema with default value', () => {
    schema.items = { type: 'string' }
    schema.default = [ 'a' ]

    const _schema = instance.validateSchema(schema)

    assert.ok(_schema.hasOwnProperty('uniqueItems'), 'should have the uniqueItems keyword')
    assert.equal(_schema.uniqueItems, false, 'should have the uniqueItems keyword with boolean value false')
  })
})

describe('generic.array.validate', () => {
  const instance = compiler.instance()

  it('should successfully validate with no items entry', () => {
    const schema = {
      type: 'array'
    }
    const validator = instance.compile(schema)

    const data1 = [1, 2, 3, 4, 5]
    const data2 = [3, 'different', { types: 'of values' }]
    const data3 = { Not: 'an array' }

    const report1 = validator.validate(data1)
    const report2 = validator.validate(data2)
    const report3 = validator.validate(data3)

    assert.equal(report1, true, `should have no error with ${JSON.stringify(data1)}`)
    assert.equal(report2, true, `should have no error with ${JSON.stringify(data2)}`)
    assert.equal(Array.isArray(report3), true, `should have an error with ${JSON.stringify(data3)}`)
    assert.equal(report3[0].keyword, 'type', `should have a type error with ${JSON.stringify(data3)}`)
  })

  it('should successfully validate list', () => {
    const schema = {
      type: 'array',
      items: { type: 'number' }
    }
    const validator = instance.compile(schema)

    const data1 = [1, 2, 3, 4, 5]
    const data2 = [1, 2, '3', 4, 5]
    const data3 = []

    const report1 = validator.validate(data1)
    const report2 = validator.validate(data2)
    const report3 = validator.validate(data3)

    assert.equal(report1, true, `should have no error with ${JSON.stringify(data1)}`)
    assert.equal(Array.isArray(report2), true, `should have an error with ${JSON.stringify(data2)}`)
    assert.equal(report2[0].errors[0].errors[0].keyword, 'type', `should have a type error with ${JSON.stringify(data3)}`)
    assert.equal(report3, true, `should have no error with ${JSON.stringify(data2)}`)
  })

  it('should successfully validate tuple', () => {
    const schema = {
      type: 'array',
      items: [
        { type: 'number' },
        { type: 'string' },
        { type: 'string', enum: ['Street', 'Avenue', 'Boulevard'] },
        { type: 'string', enum: ['NW', 'NE', 'SW', 'SE'] }
      ]
    }
    const validator = instance.compile(schema)

    const data1 = [1600, 'Pennsylvania', 'Avenue', 'NW']
    const data2 = [24, 'Sussex', 'Drive']
    const data3 = ['Palais de l\'Élysée']
    const data4 = [10, 'Downing', 'Street']
    const data5 = [1600, 'Pennsylvania', 'Avenue', 'NW', 'Washington']

    const report1 = validator.validate(data1)
    const report2 = validator.validate(data2)
    const report3 = validator.validate(data3)
    const report4 = validator.validate(data4)
    const report5 = validator.validate(data5)

    assert.equal(report1, true, `should have no error with ${JSON.stringify(data1)}`)
    assert.equal(Array.isArray(report2), true, `should have an error with ${JSON.stringify(data2)}`)
    assert.equal(report2[0].errors[0].errors[0].keyword, 'enum', `should have an enum error with ${JSON.stringify(data2)}`)
    assert.equal(Array.isArray(report3), true, `should have an error with ${JSON.stringify(data3)}`)
    assert.equal(report3[0].errors[0].errors[0].keyword, 'type', `should have a type error with ${JSON.stringify(data3)}`)
    assert.equal(report4, true, `should have no error with ${JSON.stringify(data4)}`)
    assert.equal(report5, true, `should have no error with ${JSON.stringify(data5)}`)
  })

  it('should successfully validate tuple with additionalItems = true', () => {
    const schema = {
      type: 'array',
      items: [
        { type: 'number' },
        { type: 'string' },
        { type: 'string', enum: ['Street', 'Avenue', 'Boulevard'] },
        { type: 'string', enum: ['NW', 'NE', 'SW', 'SE'] }
      ],
      additionalItems: true
    }
    const validator = instance.compile(schema)

    const data1 = [1600, 'Pennsylvania', 'Avenue', 'NW']
    const data2 = [24, 'Sussex', 'Drive']
    const data3 = ['Palais de l\'Élysée']
    const data4 = [10, 'Downing', 'Street']
    const data5 = [1600, 'Pennsylvania', 'Avenue', 'NW', 'Washington']

    const report1 = validator.validate(data1)
    const report2 = validator.validate(data2)
    const report3 = validator.validate(data3)
    const report4 = validator.validate(data4)
    const report5 = validator.validate(data5)

    assert.equal(report1, true, `should have no error with ${JSON.stringify(data1)}`)
    assert.equal(Array.isArray(report2), true, `should have an error with ${JSON.stringify(data2)}`)
    assert.equal(report2[0].errors[0].errors[0].keyword, 'enum', `should have an enum error with ${JSON.stringify(data2)}`)
    assert.equal(Array.isArray(report3), true, `should have an error with ${JSON.stringify(data3)}`)
    assert.equal(report3[0].errors[0].errors[0].keyword, 'type', `should have a type error with ${JSON.stringify(data3)}`)
    assert.equal(report4, true, `should have no error with ${JSON.stringify(data4)}`)
    assert.equal(report5, true, `should have no error with ${JSON.stringify(data5)}`)
  })

  it('should successfully validate tuple with additionalItems = false', () => {
    const schema = {
      type: 'array',
      items: [
        { type: 'number' },
        { type: 'string' },
        { type: 'string', enum: ['Street', 'Avenue', 'Boulevard'] },
        { type: 'string', enum: ['NW', 'NE', 'SW', 'SE'] }
      ],
      additionalItems: false
    }
    const validator = instance.compile(schema)

    const data1 = [1600, 'Pennsylvania', 'Avenue', 'NW']
    const data2 = [1600, 'Pennsylvania', 'Avenue']
    const data3 = [1600, 'Pennsylvania', 'Avenue', 'NW', 'Washington']

    const report1 = validator.validate(data1)
    const report2 = validator.validate(data2)
    const report3 = validator.validate(data3)

    assert.equal(report1, true, `should have no error with ${JSON.stringify(data1)}`)
    assert.equal(report2, true, `should have no error with ${JSON.stringify(data2)}`)
    assert.equal(Array.isArray(report3), true, `should have an error with ${JSON.stringify(data3)}`)
    assert.equal(report3[0].error, 'size', `should have a size error with ${JSON.stringify(data3)}`)
  })
})

describe('generic.array.keywords', () => {
  const instance = compiler.instance()

  it('should successfully validate data with minItems & maxItems', () => {
    const schema = { type: 'array', minItems: 2, maxItems: 3 }
    const validator = instance.compile(schema)

    const data1 = []
    const data2 = [1]
    const data3 = [1, 2]
    const data4 = [1, 2, 3]
    const data5 = [1, 2, 3, 4]

    const report1 = validator.validate(data1)
    const report2 = validator.validate(data2)
    const report3 = validator.validate(data3)
    const report4 = validator.validate(data4)
    const report5 = validator.validate(data5)

    assert.ok(report1 instanceof Array, 'should successfully validate with not enough items')
    assert.equal(report1[0].keyword, 'minItems', 'report1 should have the minItems keyword')
    assert.ok(report2 instanceof Array, 'should successfully validate with not enough items')
    assert.equal(report2[0].keyword, 'minItems', 'report2 should have the minItems keyword')
    assert.ok(report3, `should successfully validate ${data3}`)
    assert.ok(report4, `should successfully validate ${data4}`)
    assert.ok(report2 instanceof Array, 'should successfully validate with too many items')
    assert.equal(report2[0].keyword, 'minItems', 'report5 should have the maxItems keyword')
    assert.ok(report5 instanceof Array, `should successfully validate ${data5}`)
  })

  it('should successfully validate data with uniqueItems = true', () => {
    const schema = { type: 'array', uniqueItems: true }
    const validator = instance.compile(schema)

    const data1 = [1, 2, 3, 4, 5]
    const data2 = [1, 2, 3, 3, 4]
    const data3 = []

    const report1 = validator.validate(data1)
    const report2 = validator.validate(data2)
    const report3 = validator.validate(data3)

    assert.ok(report1, `should successfully validate ${data1}`)
    assert.ok(report2 instanceof Array, 'should successfully validate with non unique items')
    assert.equal(report2[0].keyword, 'uniqueItems', 'report2 should have the uniqueItems keyword')
    assert.ok(report3, `should successfully validate ${data3}`)
  })
})
