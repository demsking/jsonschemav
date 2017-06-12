'use strict'

const assert = require('assert')
const should = require('../..').should
const JsonSchemav = require('../../../lib/api')

/* global describe it */

describe('generic.object.validateSchema', () => {
  const jsv = new JsonSchemav()

  it('should successfully validate schema with maxProperties', () => {
    const schema = {
      type: 'object',
      maxProperties: 12
    }

    assert.doesNotThrow(() =>
      jsv.validateSchema(schema), 'should validate an interger value')

    assert.doesNotThrow(() => {
      schema.maxProperties = 0

      jsv.validateSchema(schema)
    }, 'should validate an 0 interger value')

    assert.throws(() => {
      schema.maxProperties = -1

      jsv.validateSchema(schema)
    }, /maxProperties must be greater than, or equal to, 0/, 'should validate with a negative integer value `-1`')

    assert.throws(() => {
      schema.maxProperties = 'abc'

      jsv.validateSchema(schema)
    }, /maxProperties must be an integer/, 'should validate with a string value `abc`')

    assert.throws(() => {
      schema.maxProperties = '123'

      jsv.validateSchema(schema)
    }, /maxProperties must be an integer/, 'should validate with a string value value `123`')
  })

  it('should successfully validate schema with minProperties', () => {
    const schema = {
      type: 'object',
      minProperties: 12
    }

    assert.doesNotThrow(() =>
      jsv.validateSchema(schema), 'should validate an interger value')

    assert.doesNotThrow(() => {
      schema.minProperties = 0

      jsv.validateSchema(schema)
    }, 'should validate an 0 interger value')

    assert.throws(() => {
      schema.minProperties = -1

      jsv.validateSchema(schema)
    }, /minProperties must be greater than, or equal to, 0/, 'should validate with a negative integer value `-1`')

    assert.throws(() => {
      schema.minProperties = 'abc'

      jsv.validateSchema(schema)
    }, /minProperties must be an integer/, 'should validate with a string value `abc`')

    assert.throws(() => {
      schema.minProperties = '123'

      jsv.validateSchema(schema)
    }, /minProperties must be an integer/, 'should validate with a string value value `123`')
  })

  it('should successfully validate schema with properties', () => {
    const schema = {
      type: 'object'
    }

    assert.doesNotThrow(() => {
      schema.properties = { name: { type: 'string' } }
      jsv.validateSchema(schema)
    }, 'should validate an unique array values')

    assert.throws(() => {
      schema.properties = null
      jsv.validateSchema(schema)
    }, /properties cannot be null/, 'should validate with a null properties entry')

    assert.throws(() => {
      schema.properties = undefined
      jsv.validateSchema(schema)
    }, /properties cannot be undefined/, 'should validate with an undefined properties entry')

    assert.throws(() => {
      schema.properties = 'invalid entry'
      jsv.validateSchema(schema)
    }, /properties must be an object/, 'should validate with a non object properties entry')

    assert.throws(() => {
      schema.properties = []
      jsv.validateSchema(schema)
    }, /properties must be an object/, 'should validate with a array properties entry')

    assert.throws(() => {
      schema.properties = { name: null }
      jsv.validateSchema(schema)
    }, /A property entry cannot be null/, 'should validate with a null property entry')

    assert.throws(() => {
      schema.properties = { name: undefined }
      jsv.validateSchema(schema)
    }, /A property entry cannot be undefined/, 'should validate with an undefined property entry')

    assert.throws(() => {
      schema.properties = { name: 'Sébastien' }
      jsv.validateSchema(schema)
    }, /A property entry must be a JSON Schema/, 'should validate with a string property entry')

    assert.throws(() => {
      schema.properties = { name: null }
      jsv.validateSchema(schema)
    }, /A property entry cannot be null/, 'should validate with a null property entry')

    assert.doesNotThrow(() => {
      schema.properties = { name: { type: 'string', default: 'abc' } }
      jsv.validateSchema(schema)
    }, 'should validate with a valid JSON Schema property entry')
  })

  it('should successfully validate schema with patternProperties', () => {
    const schema = {
      type: 'object'
    }

    assert.throws(() => {
      schema.patternProperties = null
      jsv.validateSchema(schema)
    }, /patternProperties cannot be null/, 'should validate with a null patternProperties value')

    assert.throws(() => {
      schema.patternProperties = undefined
      jsv.validateSchema(schema)
    }, /patternProperties cannot be undefined/, 'should validate with an undefined patternProperties value')

    assert.throws(() => {
      schema.patternProperties = []
      jsv.validateSchema(schema)
    }, /patternProperties must be an object/, 'should validate with a non object value')

    assert.doesNotThrow(() => {
      schema.patternProperties = {}
      jsv.validateSchema(schema)
    }, 'should validate with an empty patternProperties value')

    assert.throws(() => {
      schema.patternProperties = { 'invalid reg exp (': {} }
      jsv.validateSchema(schema)
    }, /Invalid regular expression/, 'should validate with an invalid regular expression key')

    assert.throws(() => {
      schema.patternProperties = { '[a-z]+': null }
      jsv.validateSchema(schema)
    }, /A property entry cannot be null/, 'should validate with a null property entry')

    assert.throws(() => {
      schema.patternProperties = { '[a-z]+': { type: 'undefined' } }
      jsv.validateSchema(schema)
    }, /A property entry must be a valid JSON Schema/, 'should validate with a non valid property JSON Schema entry')

    assert.doesNotThrow(() => {
      schema.patternProperties = { '[a-z]+': { type: 'string' } }
      jsv.validateSchema(schema)
    }, 'should validate with a valid property JSON Schema entry')
  })

  it('should successfully validate schema with additionalProperties', () => {
    const schema = {
      type: 'object'
    }

    assert.throws(() => {
      schema.additionalProperties = null
      jsv.validateSchema(schema)
    }, /additionalProperties cannot be null/, 'should validate with a null additionalProperties value')

    assert.throws(() => {
      schema.additionalProperties = undefined
      jsv.validateSchema(schema)
    }, /additionalProperties cannot be undefined/, 'should validate with an undefined additionalProperties value')

    assert.throws(() => {
      schema.additionalProperties = []
      jsv.validateSchema(schema)
    }, /additionalProperties must be a boolean or a schema/, 'should validate with a non object value')

    assert.throws(() => {
      schema.additionalProperties = {}
      jsv.validateSchema(schema)
    }, /additionalProperties must be a valid JSON Schema/, 'should validate with an empty additionalProperties value')

    assert.throws(() => {
      schema.additionalProperties = { type: 'undefined' }
      jsv.validateSchema(schema)
    }, /additionalProperties must be a valid JSON Schema/, 'should validate with an invalid additional property value')

    assert.throws(() => {
      schema.additionalProperties = { name: { type: null } }
      jsv.validateSchema(schema)
    }, /additionalProperties must be a valid JSON Schema/, 'should validate with an invalid additional property value')

    assert.doesNotThrow(() => {
      schema.additionalProperties = {
        type: 'object',
        properties: {
          name: { type: 'string' } } }
      jsv.validateSchema(schema)
    }, 'should validate with a valid JSON Schema additionalProperty entry')

    assert.throws(() => {
      schema.additionalProperties = { name: { type: null } }
      jsv.validateSchema(schema)
    }, /additionalProperties must be a valid JSON Schema/, 'should validate with an invalid additional property value')

    assert.throws(() => {
      schema.additionalProperties = { name: { type: null } }
      jsv.validateSchema(schema)
    }, /additionalProperties must be a valid JSON Schema/, 'should validate with an invalid additional property value')

    assert.doesNotThrow(() => {
      schema.additionalProperties = true
      jsv.validateSchema(schema)
    }, 'should validate with a boolean dependencies value')
  })

  it('should successfully validate schema with required', () => {
    const schema = {
      type: 'object',
      required: [ 'name' ]
    }

    assert.throws(() => jsv.validateSchema(schema),
      /Missing properties entry/, 'should validate with missing properties entry')

    assert.throws(() => {
      schema.properties = {}
      jsv.validateSchema(schema)
    }, /Missing 'name' property/, 'should validate with missing required property')
  })

  it('should successfully validate schema with dependencies', () => {
    const schema = {
      type: 'object'
    }

    assert.throws(() => {
      schema.dependencies = null
      jsv.validateSchema(schema)
    }, /dependencies cannot be null/, 'should validate with a null dependencies value')

    assert.throws(() => {
      schema.dependencies = undefined
      jsv.validateSchema(schema)
    }, /dependencies cannot be undefined/, 'should validate with an undefined dependencies value')

    assert.throws(() => {
      schema.dependencies = []
      jsv.validateSchema(schema)
    }, /dependencies must be an object/, 'should validate with a non object value')

    assert.doesNotThrow(() => {
      schema.dependencies = {}
      jsv.validateSchema(schema)
    }, 'should validate with an empty dependencies value')

    assert.throws(() => {
      schema.dependencies = { address: [ 'city' ] }
      jsv.validateSchema(schema)
    }, /Missing properties entry/, 'should validate with a missing properties entry')

    assert.throws(() => {
      schema.dependencies = { address: [ 'city' ] }
      schema.properties = { city: { type: 'string' } }
      jsv.validateSchema(schema)
    }, /Missing 'address' property/, 'should validate with a missing property entry')

    assert.throws(() => {
      schema.dependencies = { address: [ 'city', 'country', 'city' ] }
      schema.properties = { city: { type: 'string' }, address: { type: 'string' } }
      jsv.validateSchema(schema)
    }, /A dependency entry must be a list of unique string/, 'should validate with a non unique dependency entry')

    assert.throws(() => {
      schema.dependencies = { address: [ 'city', 'country' ] }
      schema.properties = { city: { type: 'string' }, address: { type: 'string' } }
      jsv.validateSchema(schema)
    }, /Missing 'country' property/, 'should validate with a missing dependency property')

    assert.throws(() => {
      schema.dependencies = { country: null }
      schema.properties = { country: { type: 'string' } }
      jsv.validateSchema(schema)
    }, /A dependency entry cannot be null/, 'should validate with a null dependency entry')

    assert.throws(() => {
      schema.dependencies = { country: { type: 'undefined' } }
      schema.properties = { country: { type: 'string' } }
      jsv.validateSchema(schema)
    }, /A dependency entry must be a valid JSON Schema/, 'should validate with a non valid dependency JSON Schema entry')

    assert.doesNotThrow(() => {
      schema.dependencies = { country: { type: 'string' } }
      schema.properties = { country: { type: 'string' } }
      jsv.validateSchema(schema)
    }, 'should validate with a valid dependency JSON Schema entry')

    assert.doesNotThrow(() => {
      schema.dependencies = { address: [ 'city' ] }
      schema.properties = { city: { type: 'string' }, address: { type: 'string' } }
      jsv.validateSchema(schema)
    }, 'should validate with a dependency array entry')

    assert.doesNotThrow(() => {
      schema.dependencies = { address: [ 'city' ], country: { type: 'string' } }
      schema.properties = { address: { type: 'string' }, city: { type: 'string' }, country: { type: 'string' } }
      jsv.validateSchema(schema)
    }, 'should validate with both dependency JSON Schema and dependency array entries')
  })

  it('should successfully validate schema with default value', () => {
    const schema = {
      type: 'object',
      properties: { name: { type: 'string' } },
      default: { name: 'Sébastien' }
    }

    return jsv.compile(schema)
  })

  it('should successfully validate schema with non object default value', (done) => {
    const schema = {
      type: 'object',
      properties: { name: { type: 'string' } },
      default: { name: 123 }
    }

    should.throw.with.defaultValue(jsv, schema, 'properties', done)
  })
})

describe('generic.object.validate', () => {
  const jsv = new JsonSchemav()
  const schema = {
    type: 'object',
    properties: { name: { type: 'string' } },
    default: { name: 'Sébastien' } }

  it('should successfully validate a object', (done) => {
    const values = [ { name: null }, { name: 'KDE Plasma' }, undefined ]

    should.validate.with.each(values, jsv, schema, done)
  })

  it('should successfully validate an invalid object', (done) => {
    const values = [ true, false, [], () => {}, 'abc', 123, null ]

    should.throw.with.each(values, jsv, schema, done)
  })
})

describe('generic.object.keywords.required', () => {
  const jsv = new JsonSchemav()
  const schema = {
    type: 'object',
    properties: { name: { type: 'string' } },
    required: [ 'name' ]
  }

  it('should successfully validate data', (done) => {
    const data = { name: 'Sébastien' }

    should.validate.with.data(data, jsv, schema, done)
  })

  it('should successfully validate a missing property', (done) => {
    const data = { email: 'u@example.com' }

    should.throw.with.data(data, jsv, schema, 'required', done)
  })
})

describe('generic.object.keywords.maxProperties', () => {
  const jsv = new JsonSchemav()
  const schema = { type: 'object', maxProperties: 3 }

  it('should successfully validate with maximum properties', (done) => {
    const data = { a: 1, b: 2, c: 3 }

    return should.validate.with.data(data, jsv, schema, done)
  })

  it('should successfully validate with exceeding size', (done) => {
    const data = { a: 1, b: 2, c: 3, d: 4 }

    should.throw.with.data(data, jsv, schema, 'maxProperties', done)
  })
})

describe('generic.object.keywords.minProperties', () => {
  const jsv = new JsonSchemav()
  const schema = { type: 'object', minProperties: 2 }

  it('should successfully validate with minimal size', (done) => {
    const data = { a: 1, b: 2 }

    should.validate.with.data(data, jsv, schema, done)
  })

  it('should successfully validate with not enough properties', (done) => {
    const data = { a: 1 }

    should.throw.with.data(data, jsv, schema, 'minProperties', done)
  })
})

describe('generic.object.keywords.dependencies', () => {
  const jsv = new JsonSchemav()
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      credit_card: { type: 'number' },
      billing_address: { type: 'string' }
    },
    required: [ 'name' ],
    dependencies: {
      credit_card: [ 'billing_address' ]
    }
  }
  const expected = (value, next) => (err, done) => {
    try {
      if (next) {
        return assert.deepStrictEqual(err.errors[0].errors[0], value)
      }

      assert.deepStrictEqual(err.errors[0].missing, value)
    } catch (e) {
      done(e)
    }
  }

  it('should successfully validate with a valid data', (done) => {
    const data = {
      name: 'John Doe',
      credit_card: 5555555555555555,
      billing_address: '555 Debtor\'s Lane'
    }

    should.validate.with.data(data, jsv, schema, done)
  })

  it('should successfully validate with a missing dependency', (done) => {
    const data = {
      name: 'John Doe',
      credit_card: 5555555555555555
    }

    should.throw.with.data(data, jsv, schema, 'dependencies', done)
  })

  it('should successfully validate with a no prop and his dependency', (done) => {
    const data = {
      name: 'John Doe'
    }

    should.validate.with.data(data, jsv, schema, done)
  })

  it('should successfully validate with dependency wihout it parent', (done) => {
    const data = {
      name: 'John Doe',
      billing_address: '555 Debtor\'s Lane'
    }

    should.validate.with.data(data, jsv, schema, done)
  })

  it('should successfully validate with bidirectional dependencies', (done) => {
    schema.dependencies.billing_address = [ 'credit_card' ]

    const data1 = { name: 'John Doe', credit_card: 5555555555555555 }
    const data2 = { name: 'John Doe', billing_address: '555 Debtor\'s Lane' }
    const expected1 = [ { prop: 'credit_card', required: 'billing_address' } ]
    const expected2 = [ { prop: 'billing_address', required: 'credit_card' } ]

    should.throw.with.data(data1, jsv, schema, 'dependencies', expected(expected1), done, false)

    should.throw.with.data(data2, jsv, schema, 'dependencies', expected(expected2), done, false)

    done()
  })

  it('should successfully validate with schema dependencies', (done) => {
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        credit_card: { type: 'number' }
      },
      required: [ 'name' ],
      dependencies: {
        credit_card: {
          properties: {
            billing_address: { type: 'string' }
          },
          required: [ 'billing_address' ]
        }
      }
    }

    const data1 = {
      name: 'John Doe',
      credit_card: 5555555555555555,
      billing_address: '555 Debtor\'s Lane'
    }

    should.validate.with.data(data1, jsv, schema, done, false)

    const data2 = {
      name: 'John Doe',
      credit_card: 5555555555555555
    }
    const expectedReport = {
      keyword: 'required',
      required: [ 'billing_address' ],
      message: 'missing required fields' }

    should.throw.with.data(data2, jsv, schema, 'dependencies', expected(expectedReport, true), done, false)

    const data3 = {
      name: 'John Doe',
      billing_address: '555 Debtor\'s Lane'
    }

    should.validate.with.data(data3, jsv, schema, done, false)

    done()
  })
})

describe('generic.object.keywords.patternProperties', () => {
  const jsv = new JsonSchemav()
  const schema = {
    type: 'object',
    patternProperties: {
      '^S_': { type: 'string' },
      '^I_': { type: 'integer' }
    },
    additionalProperties: false
  }

  it('should successfully validate with a valid data', (done) => {
    schema.default = { S_25: 'This is a string' }
    should.validate.with.defaultValue(jsv, schema, done, false)

    schema.default = { I_0: 42 }
    should.validate.with.defaultValue(jsv, schema, done, false)

    done()
  })

  it('should successfully validate with an invalid data', (done) => {
    schema.default = { S_0: 42 }
    should.throw.with.defaultValue(jsv, schema, 'patternProperties', done, false)

    schema.default = { I_42: 'This is a string' }
    should.throw.with.defaultValue(jsv, schema, 'patternProperties', done, false)

    schema.default = { keyword: 'value' }
    should.throw.with.defaultValue(jsv, schema, 'additionalProperties', done, false)

    done()
  })

  it('should successfully validate with properties entries', (done) => {
    schema.properties = {}

    schema.default = { S_25: 'This is a string' }
    should.validate.with.defaultValue(jsv, schema, done, false)

    schema.default = { I_0: 42 }
    should.validate.with.defaultValue(jsv, schema, done, false)

    done()
  })

  it('should successfully validate with no properties', (done) => {
    schema.properties = {}
    schema.patternProperties = {}

    schema.default = {}
    should.validate.with.defaultValue(jsv, schema, done, false)

    schema.default = { I_0: 42 }
    should.throw.with.defaultValue(jsv, schema, 'additionalProperties', done, false)

    done()
  })
})

describe('generic.object.keywords.additionalProperties', () => {
  const jsv = new JsonSchemav()
  const schema = { type: 'object' }

  it('should successfully validate data', (done) => {
    const data1 = {}
    const data2 = { S_25: 'This is a string' }
    const data3 = { I_0: 42 }

    schema.additionalProperties = true

    should.validate.with.data(data1, jsv, schema, done, false)
    should.validate.with.data(data2, jsv, schema, done, false)
    should.validate.with.data(data3, jsv, schema, done, false)

    done()
  })

  it('should successfully validate data with additionalProperties = false', (done) => {
    schema.additionalProperties = false

    const data = {}

    should.validate.with.data(data, jsv, schema, done)
  })

  it('should successfully validate data with additionalProperties = object', (done) => {
    schema.additionalProperties = {
      type: 'object',
      properties: {
        name: { type: 'string' }
      }
    }

    schema.default = { name: 'Sébastien' }
    should.validate.with.defaultValue(jsv, schema, done, false)

    schema.properties = {
      address: { type: 'string' }
    }
    should.validate.with.defaultValue(jsv, schema, done, false)

    schema.default = { address: 'Paris, France', name: undefined }
    schema.additionalProperties.required = [ 'name' ]
    should.throw.with.defaultValue(jsv, schema, 'additionalProperties', done, false)

    done()
  })
})
