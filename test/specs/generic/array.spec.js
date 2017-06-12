'use strict'

const assert = require('assert')
const should = require('../..').should
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

  it('should successfully compile schema with missing uniqueItems', () => {
    const schema = {
      type: 'array'
    }

    return jsv.compile(schema).then((instance) => {
      assert.ok(instance.schema.hasOwnProperty('uniqueItems'),
        'should have the uniqueItems keyword')
      assert.equal(instance.schema.uniqueItems, false,
        'should have the uniqueItems keyword with boolean value false')
    })
  })

  it('should successfully compile schema with default value', () => {
    const schema = {
      type: 'array',
      items: { type: 'string' },
      default: [ 'a' ]
    }

    return jsv.compile(schema).then((instance) => {
      assert.ok(instance.schema.hasOwnProperty('uniqueItems'),
        'should have the uniqueItems keyword')
      assert.equal(instance.schema.uniqueItems, false,
        'should have the uniqueItems keyword with boolean value false')
    })
  })
})

describe('generic.array.validate', () => {
  const jsv = new JsonSchemav()

  it('should successfully validate with no items entry', (done) => {
    const schema = {
      type: 'array'
    }

    schema.default = [1, 2, 3, 4, 5]
    should.validate.with.defaultValue(jsv, schema, done, false)

    schema.default = [3, 'different', { types: 'of values' }]
    should.validate.with.defaultValue(jsv, schema, done, false)

    schema.default = { Not: 'an array' }
    should.throw.with.defaultValue(jsv, schema, 'type', done, false)

    done()
  })

  it('should successfully validate list', (done) => {
    const schema = {
      type: 'array',
      items: { type: 'number' }
    }

    schema.default = [1, 2, 3, 4, 5]
    should.validate.with.defaultValue(jsv, schema, done, false)

    schema.default = [1, 2, '3', 4, 5]
    should.throw.with.defaultValue(jsv, schema, 'items', done, false)

    schema.default = []
    should.validate.with.defaultValue(jsv, schema, done, false)

    done()
  })

  it('should successfully validate tuple', (done) => {
    const schema = {
      type: 'array',
      items: [
        { type: 'number' },
        { type: 'string' },
        { type: 'string', enum: ['Street', 'Avenue', 'Boulevard'] },
        { type: 'string', enum: ['NW', 'NE', 'SW', 'SE'] }
      ]
    }

    schema.default = [1600, 'Pennsylvania', 'Avenue', 'NW']
    should.validate.with.defaultValue(jsv, schema, done, false)

    schema.default = [24, 'Sussex', 'Drive']
    should.throw.with.defaultValue(jsv, schema, 'items', done, false)

    schema.default = ['Palais de l\'Élysée']
    should.throw.with.defaultValue(jsv, schema, 'items', done, false)

    schema.default = [10, 'Downing', 'Street']
    should.validate.with.defaultValue(jsv, schema, done, false)

    schema.default = [1600, 'Pennsylvania', 'Avenue', 'NW', 'Washington']
    should.validate.with.defaultValue(jsv, schema, done, false)

    done()
  })

  it('should successfully validate tuple with additionalItems = true', (done) => {
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

    schema.default = [1600, 'Pennsylvania', 'Avenue', 'NW']
    should.validate.with.defaultValue(jsv, schema, done, false)

    schema.default = [24, 'Sussex', 'Drive']
    should.throw.with.defaultValue(jsv, schema, 'items', done, false)

    schema.default = ['Palais de l\'Élysée']
    should.throw.with.defaultValue(jsv, schema, 'items', done, false)

    schema.default = [10, 'Downing', 'Street']
    should.validate.with.defaultValue(jsv, schema, done, false)

    schema.default = [1600, 'Pennsylvania', 'Avenue', 'NW', 'Washington']
    should.validate.with.defaultValue(jsv, schema, done, false)

    done()
  })

  it('should successfully validate tuple with additionalItems = false', (done) => {
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

    schema.default = [1600, 'Pennsylvania', 'Avenue', 'NW']
    should.validate.with.defaultValue(jsv, schema, done, false)

    schema.default = [1600, 'Pennsylvania', 'Avenue']
    should.validate.with.defaultValue(jsv, schema, done, false)

    schema.default = [1600, 'Pennsylvania', 'Avenue', 'NW', 'Washington']
    should.throw.with.defaultValue(jsv, schema, 'items', done, false)

    done()
  })
})

describe('generic.array.keywords', () => {
  const jsv = new JsonSchemav()

  it('should successfully validate data with minItems & maxItems', (done) => {
    const schema = { type: 'array', minItems: 2, maxItems: 3 }

    schema.default = []
    should.throw.with.defaultValue(jsv, schema, 'minItems', done, false)

    schema.default = [1]
    should.throw.with.defaultValue(jsv, schema, 'minItems', done, false)

    schema.default = [1, 2]
    should.validate.with.defaultValue(jsv, schema, done, false)

    schema.default = [1, 2, 3]
    should.validate.with.defaultValue(jsv, schema, done, false)

    schema.default = [1, 2, 3, 4]
    should.throw.with.defaultValue(jsv, schema, 'maxItems', done, false)

    done()
  })

  it('should successfully validate data with uniqueItems = true', (done) => {
    const schema = { type: 'array', uniqueItems: true }

    schema.default = [1, 2, 3, 4, 5]
    should.validate.with.defaultValue(jsv, schema, done, false)

    schema.default = [1, 2, 3, 3, 4]
    should.throw.with.defaultValue(jsv, schema, 'uniqueItems', done, false)

    schema.default = []
    should.validate.with.defaultValue(jsv, schema, done, false)

    done()
  })
})
