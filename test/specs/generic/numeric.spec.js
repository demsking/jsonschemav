'use strict'

const assert = require('assert')
const should = require('../..').should
const JsonSchemav = require('../../../lib/api')

/* global describe it */

describe('generic.numeric.validateSchema', () => {
  const jsv = new JsonSchemav()

  it('should successfully validate schema', () => {
    const schema = {
      type: 'numeric'
    }

    assert.doesNotThrow(() => {
      jsv.validateSchema(schema)
    })
  })

  it('should successfully validate schema with default value', () => {
    const schema = {
      type: 'numeric',
      default: 12
    }

    return jsv.compile(schema)
  })

  it('should successfully validate schema with default float value', () => {
    const schema = {
      type: 'numeric',
      default: 12.01
    }

    return jsv.compile(schema)
  })

  it('should successfully validate schema with non numeric default value', (done) => {
    const schema = {
      type: 'numeric',
      default: '7'
    }

    should.throw.with.defaultValue(jsv, schema, 'type', done)
  })

  it('should successfully validate schema with multipleOf', () => {
    assert.throws(() =>
      jsv.validateSchema({ type: 'numeric', multipleOf: '2' }),
      /multipleOf must be an integer/,
      'should successfully validate with \'2\'')

    assert.throws(() =>
      jsv.validateSchema({ type: 'numeric', multipleOf: 0 }),
      /multipleOf must be strictly greater than 0/,
      'should successfully validate with 0')

    assert.doesNotThrow(() =>
      jsv.validateSchema({ type: 'numeric', multipleOf: 3 }),
      'should successfully validate with 3')
  })

  it('should successfully validate schema with maximum', () => {
    assert.throws(() =>
      jsv.validateSchema({ type: 'numeric', maximum: '2' }),
      /maximum must be a number/,
      'should successfully validate with \'2\'')

    assert.doesNotThrow(() =>
      jsv.validateSchema({ type: 'numeric', maximum: 3 }),
      'should successfully validate with 3')
  })

  it('should successfully validate schema with exclusiveMaximum', () => {
    assert.throws(() =>
      jsv.validateSchema({ type: 'numeric', exclusiveMaximum: '2' }),
      /exclusiveMaximum must be a boolean/,
      'should successfully validate with \'2\'')

    assert.throws(() =>
      jsv.doesNotThrow({ type: 'numeric', exclusiveMaximum: undefined }),
      'should successfully validate with an undefined value')

    assert.doesNotThrow(() =>
      jsv.validateSchema({ type: 'numeric', exclusiveMaximum: true }),
      'should successfully validate with true')
  })

  it('should successfully validate schema with minimum', () => {
    assert.throws(() =>
      jsv.validateSchema({ type: 'numeric', minimum: '2' }),
      /minimum must be a number/,
      'should successfully validate with \'2\'')

    assert.doesNotThrow(() =>
      jsv.validateSchema({ type: 'numeric', minimum: 3 }),
      'should successfully validate with 3')
  })

  it('should successfully validate schema with exclusiveMinimum', () => {
    assert.throws(() =>
      jsv.validateSchema({ type: 'numeric', exclusiveMinimum: '2' }),
      /exclusiveMinimum must be a boolean/,
      'should successfully validate with \'2\'')

    assert.throws(() =>
      jsv.doesNotThrow({ type: 'numeric', exclusiveMinimum: undefined }),
      'should successfully validate with an undefined value')

    assert.doesNotThrow(() =>
      jsv.validateSchema({ type: 'numeric', exclusiveMinimum: true }),
      'should successfully validate with true')
  })
})

describe('generic.numeric.compile', () => {
  const jsv = new JsonSchemav()

  it('should successfully compile schema with an undefined exclusiveMaximum value', (done) => {
    jsv.compile({ type: 'numeric', exclusiveMaximum: undefined })
      .then((instance) => {
        assert.ok(instance.schema.hasOwnProperty('exclusiveMaximum'), 'should have the exclusiveMaximum keyword')
        assert.equal(instance.schema.exclusiveMaximum, false, 'should have the exclusiveMaximum keyword with boolean value false')
      }).catch(done)

    done()
  })

  it('should successfully compile schema with an undefined exclusiveMinimum value', () => {
    jsv.compile({ type: 'numeric', exclusiveMinimum: undefined }).then((instance) => {
      assert.ok(instance.schema.hasOwnProperty('exclusiveMinimum'), 'should have the exclusiveMinimum keyword')
      assert.equal(instance.schema.exclusiveMinimum, false, 'should have the exclusiveMinimum keyword with boolean value false')
    })
  })
})

describe('generic.numeric.validate', () => {
  const jsv = new JsonSchemav()
  const schema = { type: 'numeric', default: 12 }

  it('should successfully validate a numeric', (done) => {
    const values = [ 12, 12.01, -12, undefined ]

    should.validate.with.each(values, jsv, schema, done)
  })

  it('should successfully validate a non numeric', (done) => {
    const values = [ true, false, [], () => {}, 'abc', {}, null ]

    should.throw.with.each(values, jsv, schema, done)
  })
})

describe('generic.integer.validate', () => {
  const jsv = new JsonSchemav()
  const schema = { type: 'integer' }

  it('should successfully validate data', (done) => {
    schema.default = 12
    should.validate.with.defaultValue(jsv, schema, done, false)

    schema.default = 12.01
    should.throw.with.defaultValue(jsv, schema, 'type', done, false)

    schema.default = -12
    should.validate.with.defaultValue(jsv, schema, done, false)

    schema.default = undefined
    should.throw.with.defaultValue(jsv, schema, 'type', done, false)

    schema.default = '42'
    should.throw.with.defaultValue(jsv, schema, 'type', done, false)

    done()
  })
})

describe('generic.numeric.keywords.required', () => {
  const jsv = new JsonSchemav()
  const schema = {
    type: 'object',
    properties: {
      day: { type: 'numeric' },
      month: { type: 'numeric' },
      year: { type: 'numeric', default: 2010 }
    },
    required: [ 'day', 'month' ]
  }

  it('should successfully validate with generic.object.required', (done) => {
    schema.default = { day: 12, month: 1 }
    should.validate.with.defaultValue(jsv, schema, done, false)

    schema.default = { day: 12, year: 1955 }
    should.throw.with.defaultValue(jsv, schema, 'required', done, false)

    schema.default = { month: 12 }
    should.throw.with.defaultValue(jsv, schema, 'required', done, false)

    done()
  })
})

describe('generic.numeric.keywords.enum', () => {
  const jsv = new JsonSchemav()

  it('should successfully validate schema with enum', () => {
    const schema = {
      type: 'numeric',
      enum: [ 1, 2, 3 ]
    }

    assert.doesNotThrow(() => {
      jsv.validateSchema(schema)
    })
  })

  it('should successfully validate schema with non numeric enum item', () => {
    const schema = {
      type: 'numeric',
      enum: [ 1, 2, 'a', 3 ]
    }

    assert.throws(() =>
      jsv.validateSchema(schema), /enum must be a list of number/)
  })

  it('should successfully validate schema with non unique enum', () => {
    const schema = {
      type: 'numeric',
      enum: [ 1, 2, 1, 3 ]
    }

    assert.throws(() =>
      jsv.validateSchema(schema), /enum must be a list of unique number/)
  })

  it('should successfully validate schema with default value in enum', () => {
    const schema = {
      type: 'numeric',
      enum: [ 1, 2, 3 ],
      default: 2
    }

    return jsv.compile(schema)
  })

  it('should successfully validate schema with unknow default value in enum', (done) => {
    const schema = {
      type: 'numeric',
      enum: [ 1, 2, 3 ],
      default: 4
    }

    should.throw.with.defaultValue(jsv, schema, 'enum', done)
  })
})

describe('generic.numeric.keywords.maximum', () => {
  const jsv = new JsonSchemav()
  const schema = {
    type: 'numeric',
    default: 3
  }

  it('should successfully validate maximum number', (done) => {
    schema.maximum = schema.default

    should.validate.with.defaultValue(jsv, schema, done)
  })

  it('should successfully validate with exclusiveMaximum', (done) => {
    schema.exclusiveMaximum = true
    schema.maximum = schema.default

    should.throw.with.defaultValue(jsv, schema, 'maximum', done)
  })

  it('should successfully validate with a lower number', (done) => {
    schema.maximum = schema.default - 1

    should.throw.with.defaultValue(jsv, schema, 'maximum', done)
  })

  it('should successfully validate with a larger number', (done) => {
    schema.maximum = 0
    schema.default = 1

    should.throw.with.defaultValue(jsv, schema, 'maximum', done)
  })

  it('should successfully validate with exclusiveMaximum', (done) => {
    schema.exclusiveMaximum = true
    schema.maximum = schema.default

    should.throw.with.defaultValue(jsv, schema, 'maximum', done)
  })
})

describe('generic.numeric.keywords.minimum', () => {
  const jsv = new JsonSchemav()
  const schema = {
    type: 'numeric',
    default: 3
  }

  it('should successfully validate with minimum number', (done) => {
    schema.minimum = schema.default

    should.validate.with.defaultValue(jsv, schema, done)
  })

  it('should successfully validate with a larger number', (done) => {
    schema.minimum = schema.default
    schema.default = schema.default + 1

    should.validate.with.defaultValue(jsv, schema, done)
  })

  it('should successfully validate with a lower number', (done) => {
    schema.minimum = 0
    schema.default = -1

    should.throw.with.defaultValue(jsv, schema, 'minimum', done)
  })

  it('should successfully validate with exclusiveMinimum', (done) => {
    schema.exclusiveMinimum = true
    schema.minimum = schema.default

    should.throw.with.defaultValue(jsv, schema, 'minimum', done)
  })
})

describe('generic.numeric.keywords.multipleOf', () => {
  const jsv = new JsonSchemav()
  const schema = {
    type: 'numeric',
    multipleOf: 3,
    default: 9
  }

  it('should successfully validate with a default value', (done) => {
    should.validate.with.defaultValue(jsv, schema, done)
  })

  it('should successfully validate with a non valid default value', (done) => {
    schema.multipleOf = 2

    should.throw.with.defaultValue(jsv, schema, 'multipleOf', done)
  })

  it('should successfully validate with a non valid default value', (done) => {
    schema.multipleOf = 1.0

    schema.default = 42
    should.validate.with.defaultValue(jsv, schema, done, false)

    schema.default = 42.0
    should.validate.with.defaultValue(jsv, schema, done, false)

    schema.default = 3.14156926
    should.throw.with.defaultValue(jsv, schema, 'multipleOf', done, false)

    done()
  })
})
