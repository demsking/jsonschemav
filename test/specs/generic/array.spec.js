'use strict'

const assert = require('assert')
const JsonSchemav = require('../../../lib/api')

/* global describe it */

describe('generic.array.validateSchema', () => {
  const jsv = new JsonSchemav()

  it('should successfully validate schema with additionalItems', () => {
    const schema = {
      type: 'array'
    }

    assert.throws(() => {
      schema.additionalItems = null
      jsv.validateSchema(schema)
    }, /additionalItems cannot be null/, 'should validate with a null additionalItems value')

    assert.throws(() => {
      schema.additionalItems = undefined
      jsv.validateSchema(schema)
    }, /additionalItems cannot be undefined/, 'should validate with an undefined additionalItems value')

    assert.throws(() => {
      schema.additionalItems = []
      jsv.validateSchema(schema)
    }, /additionalItems must be either a boolean or an object/, 'should validate with a invalid boolean and object')

    assert.throws(() => {
      schema.additionalItems = {}
      jsv.validateSchema(schema)
    }, /An additional item must be a valid JSON Schema/, 'should validate with an empty additionalItems value')

    assert.throws(() => {
      schema.additionalItems = { name: { type: 'undefined' } }
      jsv.validateSchema(schema)
    }, /An additional item must be a valid JSON Schema/, 'should validate with an invalid additional property value')

    assert.throws(() => {
      schema.additionalItems = { type: null }
      jsv.validateSchema(schema)
    }, /An additional item must be a valid JSON Schema/, 'should validate with an invalid additional property value')

    assert.doesNotThrow(() => {
      schema.additionalItems = { type: 'string' }
      jsv.validateSchema(schema)
    }, 'should validate with a valid additional JSON Schema entry')

    assert.doesNotThrow(() => {
      schema.additionalItems = { type: [ 'string' ] }
      jsv.validateSchema(schema)
    }, 'should validate with a valid additional JSON Schema entry with  an array type')

    assert.doesNotThrow(() => {
      schema.additionalItems = true
      jsv.validateSchema(schema)
    }, 'should validate with a boolean true value')
  })

  it('should successfully validate schema with maxItems', () => {
    const schema = {
      type: 'array',
      maxItems: 12
    }

    assert.doesNotThrow(() =>
      jsv.validateSchema(schema), 'should validate an integer value')

    assert.doesNotThrow(() => {
      schema.maxItems = 0

      jsv.validateSchema(schema)
    }, 'should validate an 0 integer value')

    assert.throws(() => {
      schema.maxItems = -1

      jsv.validateSchema(schema)
    }, /maxItems must be greater than, or equal to, 0/, 'should validate with a negative integer value `-1`')

    assert.throws(() => {
      schema.maxItems = 'abc'

      jsv.validateSchema(schema)
    }, /maxItems must be an integer/, 'should validate with a string value `abc`')

    assert.throws(() => {
      schema.maxItems = '123'

      jsv.validateSchema(schema)
    }, /maxItems must be an integer/, 'should validate with a string value value `123`')
  })

  it('should successfully validate schema with minItems', () => {
    const schema = {
      type: 'array',
      minItems: 12
    }

    assert.doesNotThrow(() =>
      jsv.validateSchema(schema), 'should validate an integer value')

    assert.doesNotThrow(() => {
      schema.minItems = 0

      jsv.validateSchema(schema)
    }, 'should validate an 0 integer value')

    assert.throws(() => {
      schema.minItems = -1

      jsv.validateSchema(schema)
    }, /minItems must be greater than, or equal to, 0/, 'should validate with a negative integer value `-1`')

    assert.throws(() => {
      schema.minItems = 'abc'

      jsv.validateSchema(schema)
    }, /minItems must be an integer/, 'should validate with a string value `abc`')

    assert.throws(() => {
      schema.minItems = '123'

      jsv.validateSchema(schema)
    }, /minItems must be an integer/, 'should validate with a string value value `123`')
  })

  it('should successfully validate schema with items', () => {
    const schema = {
      type: 'array'
    }

    assert.throws(() => {
      schema.items = null
      jsv.validateSchema(schema)
    }, /items cannot be null/, 'should validate with a null items entry')

    assert.doesNotThrow(() => {
      schema.items = [ { type: 'string' } ]
      jsv.validateSchema(schema)
    }, 'should validate an unique array values')

    assert.throws(() => {
      schema.items = undefined
      jsv.validateSchema(schema)
    }, /A item entry must be a valid JSON Schema/, 'should validate with an undefined items entry')

    assert.throws(() => {
      schema.items = 'invalid entry'
      jsv.validateSchema(schema)
    }, /A item entry must be a valid JSON Schema/, 'should validate with a non array items entry')

    assert.throws(() => {
      schema.items = []
      jsv.validateSchema(schema)
    }, /items must have at least one element/, 'should validate with a array items entry')
  })

  it('should successfully validate schema with uniqueItems', () => {
    const schema = {
      type: 'array'
    }

    assert.throws(() => {
      schema.uniqueItems = null
      jsv.validateSchema(schema)
    }, /uniqueItems must be a boolean/, 'should validate with a null uniqueItems value')

    assert.doesNotThrow(() => {
      schema.uniqueItems = false
      jsv.validateSchema(schema)
    }, 'should validate with a valid value')
  })
})

describe('generic.array.compile', () => {
  const jsv = new JsonSchemav()
  const schema = {
    type: 'array'
  }

  it('should successfully compile schema with missing uniqueItems', () => {
    const instance = jsv.compile(schema)

    assert.ok(instance.schema.hasOwnProperty('uniqueItems'),
      'should have the uniqueItems keyword')
    assert.equal(instance.schema.uniqueItems, false,
      'should have the uniqueItems keyword with boolean value false')
  })

  it('should successfully compile schema with default value', () => {
    schema.items = { type: 'string' }
    schema.default = [ 'a' ]

    const instance = jsv.compile(schema)

    assert.ok(instance.schema.hasOwnProperty('uniqueItems'),
      'should have the uniqueItems keyword')
    assert.equal(instance.schema.uniqueItems, false,
      'should have the uniqueItems keyword with boolean value false')
  })
})

describe('generic.array.validate', () => {
  const jsv = new JsonSchemav()

  it('should successfully validate with no items entry', () => {
    const schema = {
      type: 'array'
    }
    const instance = jsv.compile(schema)

    const data1 = [1, 2, 3, 4, 5]
    const data2 = [3, 'different', { types: 'of values' }]
    const data3 = { Not: 'an array' }

    const report1 = instance.validate(data1)
    const report2 = instance.validate(data2)
    const report3 = instance.validate(data3)

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
    const instance = jsv.compile(schema)

    const data1 = [1, 2, 3, 4, 5]
    const data2 = [1, 2, '3', 4, 5]
    const data3 = []

    const report1 = instance.validate(data1)
    const report2 = instance.validate(data2)
    const report3 = instance.validate(data3)

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
    const instance = jsv.compile(schema)

    const data1 = [1600, 'Pennsylvania', 'Avenue', 'NW']
    const data2 = [24, 'Sussex', 'Drive']
    const data3 = ['Palais de l\'Élysée']
    const data4 = [10, 'Downing', 'Street']
    const data5 = [1600, 'Pennsylvania', 'Avenue', 'NW', 'Washington']

    const report1 = instance.validate(data1)
    const report2 = instance.validate(data2)
    const report3 = instance.validate(data3)
    const report4 = instance.validate(data4)
    const report5 = instance.validate(data5)

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
    const instance = jsv.compile(schema)

    const data1 = [1600, 'Pennsylvania', 'Avenue', 'NW']
    const data2 = [24, 'Sussex', 'Drive']
    const data3 = ['Palais de l\'Élysée']
    const data4 = [10, 'Downing', 'Street']
    const data5 = [1600, 'Pennsylvania', 'Avenue', 'NW', 'Washington']

    const report1 = instance.validate(data1)
    const report2 = instance.validate(data2)
    const report3 = instance.validate(data3)
    const report4 = instance.validate(data4)
    const report5 = instance.validate(data5)

    assert.equal(report1, true,
      `should have no error with ${JSON.stringify(data1)}`)
    assert.equal(Array.isArray(report2), true,
      `should have an error with ${JSON.stringify(data2)}`)
    assert.equal(report2[0].errors[0].errors[0].keyword, 'enum',
      `should have an enum error with ${JSON.stringify(data2)}`)
    assert.equal(Array.isArray(report3), true,
      `should have an error with ${JSON.stringify(data3)}`)
    assert.equal(report3[0].errors[0].errors[0].keyword, 'type',
      `should have a type error with ${JSON.stringify(data3)}`)
    assert.equal(report4, true,
      `should have no error with ${JSON.stringify(data4)}`)
    assert.equal(report5, true,
      `should have no error with ${JSON.stringify(data5)}`)
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
    const instance = jsv.compile(schema)

    const data1 = [1600, 'Pennsylvania', 'Avenue', 'NW']
    const data2 = [1600, 'Pennsylvania', 'Avenue']
    const data3 = [1600, 'Pennsylvania', 'Avenue', 'NW', 'Washington']

    const report1 = instance.validate(data1)
    const report2 = instance.validate(data2)
    const report3 = instance.validate(data3)

    assert.equal(report1, true,
      `should have no error with ${JSON.stringify(data1)}`)
    assert.equal(report2, true,
      `should have no error with ${JSON.stringify(data2)}`)
    assert.equal(Array.isArray(report3), true,
      `should have an error with ${JSON.stringify(data3)}`)
    assert.equal(report3[0].error, 'size',
      `should have a size error with ${JSON.stringify(data3)}`)
  })
})

describe('generic.array.keywords', () => {
  const jsv = new JsonSchemav()

  it('should successfully validate data with minItems & maxItems', () => {
    const schema = { type: 'array', minItems: 2, maxItems: 3 }
    const instance = jsv.compile(schema)

    const data1 = []
    const data2 = [1]
    const data3 = [1, 2]
    const data4 = [1, 2, 3]
    const data5 = [1, 2, 3, 4]

    const report1 = instance.validate(data1)
    const report2 = instance.validate(data2)
    const report3 = instance.validate(data3)
    const report4 = instance.validate(data4)
    const report5 = instance.validate(data5)

    assert.equal(report1 instanceof Array, true,
      'should successfully validate with not enough items')
    assert.equal(report1[0].keyword, 'minItems',
      'report1 should have the minItems keyword')
    assert.equal(report2 instanceof Array, true,
      'should successfully validate with not enough items')
    assert.equal(report2[0].keyword, 'minItems',
      'report2 should have the minItems keyword')
    assert.equal(report3, true, `should successfully validate ${data3}`)
    assert.equal(report4, true, `should successfully validate ${data4}`)
    assert.ok(report2 instanceof Array,
      'should successfully validate with too many items')
    assert.equal(report2[0].keyword, 'minItems',
      'report5 should have the maxItems keyword')
    assert.ok(report5 instanceof Array, `should successfully validate ${data5}`)
  })

  it('should successfully validate data with uniqueItems = true', () => {
    const schema = { type: 'array', uniqueItems: true }
    const instance = jsv.compile(schema)

    const data1 = [1, 2, 3, 4, 5]
    const data2 = [1, 2, 3, 3, 4]
    const data3 = []

    const report1 = instance.validate(data1)
    const report2 = instance.validate(data2)
    const report3 = instance.validate(data3)

    assert.equal(report1, true, `should successfully validate ${data1}`)
    assert.ok(report2 instanceof Array,
      'should successfully validate with non unique items')
    assert.equal(report2[0].keyword,
      'uniqueItems', 'report2 should have the uniqueItems keyword')
    assert.equal(report3, true, `should successfully validate ${data3}`)
  })
})
