'use strict'

const assert = require('assert')
const api = require('../../../lib/api')

/* global describe it */

describe('generic.object.validateSchema', () => {
  const instance = api.instance()

  it('should successfully validate schema with maxProperties', () => {
    const schema = {
      type: 'object',
      maxProperties: 12
    }

    assert.doesNotThrow(() =>
      instance.validateSchema(schema), 'should validate an interger value')

    assert.doesNotThrow(() => {
      schema.maxProperties = 0

      instance.validateSchema(schema)
    }, 'should validate an 0 interger value')

    assert.throws(() => {
      schema.maxProperties = -1

      instance.validateSchema(schema)
    }, /maxProperties must be greater than, or equal to, 0/, 'should validate with a negative integer value `-1`')

    assert.throws(() => {
      schema.maxProperties = 'abc'

      instance.validateSchema(schema)
    }, /maxProperties must be an integer/, 'should validate with a string value `abc`')

    assert.throws(() => {
      schema.maxProperties = '123'

      instance.validateSchema(schema)
    }, /maxProperties must be an integer/, 'should validate with a string value value `123`')
  })

  it('should successfully validate schema with minProperties', () => {
    const schema = {
      type: 'object',
      minProperties: 12
    }

    assert.doesNotThrow(() =>
      instance.validateSchema(schema), 'should validate an interger value')

    assert.doesNotThrow(() => {
      schema.minProperties = 0

      instance.validateSchema(schema)
    }, 'should validate an 0 interger value')

    assert.throws(() => {
      schema.minProperties = -1

      instance.validateSchema(schema)
    }, /minProperties must be greater than, or equal to, 0/, 'should validate with a negative integer value `-1`')

    assert.throws(() => {
      schema.minProperties = 'abc'

      instance.validateSchema(schema)
    }, /minProperties must be an integer/, 'should validate with a string value `abc`')

    assert.throws(() => {
      schema.minProperties = '123'

      instance.validateSchema(schema)
    }, /minProperties must be an integer/, 'should validate with a string value value `123`')
  })

  it('should successfully validate schema with properties', () => {
    const schema = {
      type: 'object'
    }

    assert.doesNotThrow(() => {
      schema.properties = { name: { type: 'string' } }
      instance.validateSchema(schema)
    }, 'should validate an unique array values')

    assert.throws(() => {
      schema.properties = null
      instance.validateSchema(schema)
    }, /properties cannot be null/, 'should validate with a null properties entry')

    assert.throws(() => {
      schema.properties = undefined
      instance.validateSchema(schema)
    }, /properties cannot be undefined/, 'should validate with an undefined properties entry')

    assert.throws(() => {
      schema.properties = 'invalid entry'
      instance.validateSchema(schema)
    }, /properties must be an object/, 'should validate with a non object properties entry')

    assert.throws(() => {
      schema.properties = []
      instance.validateSchema(schema)
    }, /properties must be an object/, 'should validate with a array properties entry')

    assert.throws(() => {
      schema.properties = { name: null }
      instance.validateSchema(schema)
    }, /A property entry cannot be null/, 'should validate with a null property entry')

    assert.throws(() => {
      schema.properties = { name: undefined }
      instance.validateSchema(schema)
    }, /A property entry cannot be undefined/, 'should validate with an undefined property entry')

    assert.throws(() => {
      schema.properties = { name: 'Sébastien' }
      instance.validateSchema(schema)
    }, /A property entry must be a JSON Schema/, 'should validate with a string property entry')

    assert.throws(() => {
      schema.properties = { name: null }
      instance.validateSchema(schema)
    }, /A property entry cannot be null/, 'should validate with a null property entry')

    assert.throws(() => {
      schema.properties = { name: { type: 'string', default: 123 } }
      instance.compile(schema)
    }, /Invalid default value 123/, 'should validate with a non valid JSON Schema property entry')

    assert.doesNotThrow(() => {
      schema.properties = { name: { type: 'string', default: 'abc' } }
      instance.validateSchema(schema)
    }, 'should validate with a valid JSON Schema property entry')
  })

  it('should successfully validate schema with patternProperties', () => {
    const schema = {
      type: 'object'
    }

    assert.throws(() => {
      schema.patternProperties = null
      instance.validateSchema(schema)
    }, /patternProperties cannot be null/, 'should validate with a null patternProperties value')

    assert.throws(() => {
      schema.patternProperties = undefined
      instance.validateSchema(schema)
    }, /patternProperties cannot be undefined/, 'should validate with an undefined patternProperties value')

    assert.throws(() => {
      schema.patternProperties = []
      instance.validateSchema(schema)
    }, /patternProperties must be an object/, 'should validate with a non object value')

    assert.doesNotThrow(() => {
      schema.patternProperties = {}
      instance.validateSchema(schema)
    }, 'should validate with an empty patternProperties value')

    assert.throws(() => {
      schema.patternProperties = { 'invalid reg exp (': {} }
      instance.validateSchema(schema)
    }, /Invalid regular expression/, 'should validate with an invalid regular expression key')

    assert.throws(() => {
      schema.patternProperties = { '[a-z]+': null }
      instance.validateSchema(schema)
    }, /A property entry cannot be null/, 'should validate with a null property entry')

    assert.throws(() => {
      schema.patternProperties = { '[a-z]+': { type: 'undefined' } }
      instance.validateSchema(schema)
    }, /A property entry must be a valid JSON Schema/, 'should validate with a non valid property JSON Schema entry')

    assert.doesNotThrow(() => {
      schema.patternProperties = { '[a-z]+': { type: 'string' } }
      instance.validateSchema(schema)
    }, 'should validate with a valid property JSON Schema entry')
  })

  it('should successfully validate schema with additionalProperties', () => {
    const schema = {
      type: 'object'
    }

    assert.throws(() => {
      schema.additionalProperties = null
      instance.validateSchema(schema)
    }, /additionalProperties cannot be null/, 'should validate with a null additionalProperties value')

    assert.throws(() => {
      schema.additionalProperties = undefined
      instance.validateSchema(schema)
    }, /additionalProperties cannot be undefined/, 'should validate with an undefined additionalProperties value')

    assert.throws(() => {
      schema.additionalProperties = []
      instance.validateSchema(schema)
    }, /additionalProperties must be a boolean or a schema/, 'should validate with a non object value')

    assert.throws(() => {
      schema.additionalProperties = {}
      instance.validateSchema(schema)
    }, /additionalProperties must be a valid JSON Schema/, 'should validate with an empty additionalProperties value')

    assert.throws(() => {
      schema.additionalProperties = { type: 'undefined' }
      instance.validateSchema(schema)
    }, /additionalProperties must be a valid JSON Schema/, 'should validate with an invalid additional property value')

    assert.throws(() => {
      schema.additionalProperties = { name: { type: null } }
      instance.validateSchema(schema)
    }, /additionalProperties must be a valid JSON Schema/, 'should validate with an invalid additional property value')

    assert.doesNotThrow(() => {
      schema.additionalProperties = {
        type: 'object',
        properties: {
          name: { type: 'string' } } }
      instance.validateSchema(schema)
    }, 'should validate with a valid JSON Schema additionalProperty entry')

    assert.throws(() => {
      schema.additionalProperties = { name: { type: null } }
      instance.validateSchema(schema)
    }, /additionalProperties must be a valid JSON Schema/, 'should validate with an invalid additional property value')

    assert.throws(() => {
      schema.additionalProperties = { name: { type: null } }
      instance.validateSchema(schema)
    }, /additionalProperties must be a valid JSON Schema/, 'should validate with an invalid additional property value')

    assert.doesNotThrow(() => {
      schema.additionalProperties = true
      instance.validateSchema(schema)
    }, 'should validate with a boolean dependencies value')
  })

  it('should successfully validate schema with required', () => {
    const schema = {
      type: 'object',
      required: [ 'name' ]
    }

    assert.throws(() => instance.validateSchema(schema),
      /Missing properties entry/, 'should validate with missing properties entry')

    assert.throws(() => {
      schema.properties = {}
      instance.validateSchema(schema)
    }, /Missing 'name' property/, 'should validate with missing required property')
  })

  it('should successfully validate schema with dependencies', () => {
    const schema = {
      type: 'object'
    }

    assert.throws(() => {
      schema.dependencies = null
      instance.validateSchema(schema)
    }, /dependencies cannot be null/, 'should validate with a null dependencies value')

    assert.throws(() => {
      schema.dependencies = undefined
      instance.validateSchema(schema)
    }, /dependencies cannot be undefined/, 'should validate with an undefined dependencies value')

    assert.throws(() => {
      schema.dependencies = []
      instance.validateSchema(schema)
    }, /dependencies must be an object/, 'should validate with a non object value')

    assert.doesNotThrow(() => {
      schema.dependencies = {}
      instance.validateSchema(schema)
    }, 'should validate with an empty dependencies value')

    assert.throws(() => {
      schema.dependencies = { address: [ 'city' ] }
      instance.validateSchema(schema)
    }, /Missing properties entry/, 'should validate with a missing properties entry')

    assert.throws(() => {
      schema.dependencies = { address: [ 'city' ] }
      schema.properties = { city: { type: 'string' } }
      instance.validateSchema(schema)
    }, /Missing 'address' property/, 'should validate with a missing property entry')

    assert.throws(() => {
      schema.dependencies = { address: [ 'city', 'country', 'city' ] }
      schema.properties = { city: { type: 'string' }, address: { type: 'string' } }
      instance.validateSchema(schema)
    }, /A dependency entry must be a list of unique string/, 'should validate with a non unique dependency entry')

    assert.throws(() => {
      schema.dependencies = { address: [ 'city', 'country' ] }
      schema.properties = { city: { type: 'string' }, address: { type: 'string' } }
      instance.validateSchema(schema)
    }, /Missing 'country' property/, 'should validate with a missing dependency property')

    assert.throws(() => {
      schema.dependencies = { country: null }
      schema.properties = { country: { type: 'string' } }
      instance.validateSchema(schema)
    }, /A dependency entry cannot be null/, 'should validate with a null dependency entry')

    assert.throws(() => {
      schema.dependencies = { country: { type: 'undefined' } }
      schema.properties = { country: { type: 'string' } }
      instance.validateSchema(schema)
    }, /A dependency entry must be a valid JSON Schema/, 'should validate with a non valid dependency JSON Schema entry')

    assert.doesNotThrow(() => {
      schema.dependencies = { country: { type: 'string' } }
      schema.properties = { country: { type: 'string' } }
      instance.validateSchema(schema)
    }, 'should validate with a valid dependency JSON Schema entry')

    assert.doesNotThrow(() => {
      schema.dependencies = { address: [ 'city' ] }
      schema.properties = { city: { type: 'string' }, address: { type: 'string' } }
      instance.validateSchema(schema)
    }, 'should validate with a dependency array entry')

    assert.doesNotThrow(() => {
      schema.dependencies = { address: [ 'city' ], country: { type: 'string' } }
      schema.properties = { address: { type: 'string' }, city: { type: 'string' }, country: { type: 'string' } }
      instance.validateSchema(schema)
    }, 'should validate with both dependency JSON Schema and dependency array entries')
  })

  it('should successfully validate schema with default value', () => {
    const schema = {
      type: 'object',
      properties: { name: { type: 'string' } },
      default: { name: 'Sébastien' }
    }

    assert.doesNotThrow(() => instance.validateSchema(schema))
  })

  it('should successfully validate schema with non object default value', () => {
    const schema = {
      type: 'object',
      properties: { name: { type: 'string' } },
      default: { name: 123 }
    }

    assert.throws(() =>
      instance.compile(schema), /Invalid default value/)
  })
})

describe('generic.object.validate', () => {
  const instance = api.instance()
  const schema = {
    type: 'object',
    properties: { name: { type: 'string' } },
    default: { name: 'Sébastien' } }
  const validator = instance.compile(schema)

  it('should successfully validate a object', () => {
    [ { name: null }, { name: 'KDE Plasma' }, undefined ].forEach((data) => {
      const report = validator.validate(data)

      data = JSON.stringify(data)

      assert.equal(report, true, `should have no error with ${data}`)
    })
  })

  it('should successfully validate an invalid object', () => {
    [ true, false, [], () => {}, 'abc', 123, null ].forEach((data) => {
      const reports = validator.validate(data)

      data = JSON.stringify(data)

      assert.equal(reports[0].keyword, 'type', `should have no error with ${data}`)
    })
  })
})

describe('generic.object.keywords.required', () => {
  const instance = api.instance()
  const schema = {
    type: 'object',
    properties: { name: { type: 'string' } },
    required: [ 'name' ]
  }
  const validator = instance.compile(schema)

  it('should successfully validate data', () => {
    assert.equal(validator.validate({ name: 'Sébastien' }), true)
  })

  it('should successfully validate a missing property', () => {
    const report = validator.validate({ email: 'u@example.com' })

    assert.equal(Array.isArray(report), true)
  })
})

describe('generic.object.keywords.maxProperties', () => {
  const instance = api.instance()
  const schema = { type: 'object', maxProperties: 3 }
  const validator = instance.compile(schema)

  it('should successfully validate with maximum properties', () => {
    const report = validator.validate({ a: 1, b: 2, c: 3 })

    assert.equal(report, true)
  })

  it('should successfully validate with exceeding size', () => {
    const report = validator.validate({ a: 1, b: 2, c: 3, d: 4 })

    assert.equal(Array.isArray(report), true, 'report should have errors')
    assert.equal(report.length, 1, 'report should only have one error')
    assert.ok(report[0].message.startsWith('too many properties'))
  })
})

describe('generic.object.keywords.minProperties', () => {
  const instance = api.instance()
  const schema = { type: 'object', minProperties: 2 }
  const validator = instance.compile(schema)

  it('should successfully validate with minimal size', () => {
    const report = validator.validate({ a: 1, b: 2 })

    assert.equal(report, true)
  })

  it('should successfully validate with not enough properties', () => {
    const report = validator.validate({ a: 1 })

    assert.equal(Array.isArray(report), true, 'report should have errors')
    assert.equal(report.length, 1, 'report should only have one error')
    assert.ok(report[0].message.startsWith('not enough properties'))
  })
})

describe('generic.object.keywords.dependencies', () => {
  const instance = api.instance()
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
  const validator = instance.compile(schema)

  it('should successfully validate with a valid data', () => {
    const data = {
      name: 'John Doe',
      credit_card: 5555555555555555,
      billing_address: '555 Debtor\'s Lane'
    }

    assert.equal(validator.validate(data), true)
  })

  it('should successfully validate with a missing dependency', () => {
    const data = {
      name: 'John Doe',
      credit_card: 5555555555555555
    }
    const report = validator.validate(data)

    assert.equal(report.length, 1, 'should have only one error item')
    assert.equal(report[0].keyword, 'dependencies', 'should have `dependencies` keyword error')
    assert.equal(report[0].missing[0].prop, 'credit_card', 'report should have prop `credit_card`')
    assert.equal(report[0].missing[0].required, 'billing_address', 'report should have prop `billing_address`')
  })

  it('should successfully validate with a no prop and his dependency', () => {
    const data = {
      name: 'John Doe'
    }

    assert.equal(validator.validate(data), true)
  })

  it('should successfully validate with dependency wihout it parent', () => {
    const data = {
      name: 'John Doe',
      billing_address: '555 Debtor\'s Lane'
    }

    assert.equal(validator.validate(data), true)
  })

  it('should successfully validate with bidirectional dependencies', () => {
    schema.dependencies.billing_address = [ 'credit_card' ]

    const validator = instance.compile(schema)
    const data1 = { name: 'John Doe', credit_card: 5555555555555555 }
    const data2 = { name: 'John Doe', billing_address: '555 Debtor\'s Lane' }
    const expected1 = [ { prop: 'credit_card', required: 'billing_address' } ]
    const expected2 = [ { prop: 'billing_address', required: 'credit_card' } ]

    assert.deepEqual(validator.validate(data1)[0].missing, expected1, true)
    assert.deepEqual(validator.validate(data2)[0].missing, expected2, true)
  })

  it('should successfully validate with schema dependencies', () => {
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

    const validator = instance.compile(schema)
    const data1 = {
      name: 'John Doe',
      credit_card: 5555555555555555,
      billing_address: '555 Debtor\'s Lane'
    }
    const data2 = {
      name: 'John Doe',
      credit_card: 5555555555555555
    }
    const data3 = {
      name: 'John Doe',
      billing_address: '555 Debtor\'s Lane'
    }

    const expected = {
      keyword: 'required',
      required: [ 'billing_address' ],
      message: 'missing required fields' }

    assert.equal(validator.validate(data1), true)
    assert.deepEqual(validator.validate(data2)[0].missing[0], expected)
    assert.equal(validator.validate(data3), true)
  })
})

describe('generic.object.keywords.patternProperties', () => {
  const instance = api.instance()
  const schema = {
    type: 'object',
    patternProperties: {
      '^S_': { type: 'string' },
      '^I_': { type: 'integer' }
    },
    additionalProperties: false
  }
  const validator = instance.compile(schema)

  it('should successfully validate with a valid data', () => {
    assert.equal(validator.validate({ S_25: 'This is a string' }), true)
    assert.equal(validator.validate({ I_0: 42 }), true)
  })

  it('should successfully validate with an invalid data', () => {
    const data1 = { S_0: 42 }
    const data2 = { I_42: 'This is a string' }
    const data3 = { keyword: 'value' }

    const result1 = validator.validate(data1)
    const result2 = validator.validate(data2)
    const result3 = validator.validate(data3)

    assert.equal(Array.isArray(result1), true, 'data prop starting with a matching property pattern should be have a valid value')
    assert.equal(result1[0].keyword, 'patternProperties')
    assert.equal(result1[0].errors[0].keyword, 'type')

    assert.equal(Array.isArray(result2), true)
    assert.equal(result2[0].keyword, 'patternProperties')
    assert.equal(result2[0].errors[0].keyword, 'type')

    assert.equal(Array.isArray(result3), true)
    assert.equal(result3[0].keyword, 'additionalProperties')
    assert.equal(result3[0].properties[0], 'keyword')
  })

  it('should successfully validate with properties entries', () => {
    schema.properties = {}

    const validator = instance.compile(schema)

    assert.equal(validator.validate({ S_25: 'This is a string' }), true)
    assert.equal(validator.validate({ I_0: 42 }), true)
  })

  it('should successfully validate with no properties', () => {
    schema.properties = {}
    schema.patternProperties = {}

    const validator = instance.compile(schema)

    assert.equal(validator.validate({}), true)
    assert.equal(Array.isArray(validator.validate({ I_0: 42 })), true)
  })
})

describe('generic.object.keywords.additionalProperties', () => {
  const instance = api.instance()
  const schema = {
    type: 'object',
    additionalProperties: true
  }
  const validator = instance.compile(schema)

  it('should successfully validate data', () => {
    assert.equal(validator.validate({}), true)
    assert.equal(validator.validate({ S_25: 'This is a string' }), true)
    assert.equal(validator.validate({ I_0: 42 }), true)
  })

  it('should successfully validate data with additionalProperties = false', () => {
    schema.additionalProperties = false

    const validator = instance.compile(schema)

    assert.equal(validator.validate({}), true)
  })

  it('should successfully validate data with additionalProperties = object', () => {
    schema.additionalProperties = {
      type: 'object',
      properties: {
        name: { type: 'string' }
      }
    }

    let validator = instance.compile(schema)

    assert.equal(validator.validate({ name: 'Sébastien' }), true)

    schema.properties = {
      address: { type: 'string' }
    }

    validator = instance.compile(schema)

    assert.equal(validator.validate({ name: 'Sébastien' }), true)

    schema.additionalProperties.required = [ 'name' ]

    const report = instance.compile(schema).validate({ address: 'Douala' })

    assert.equal(report[0].keyword, 'additionalProperties',
      'should validate with missing additionalProperties required field')
  })
})
