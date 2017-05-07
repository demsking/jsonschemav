'use strict'

const assert = require('assert')
const compiler = require('../../../lib/compiler')

/* global describe it */

describe('generic.string.validateSchema', () => {
  const instance = compiler.instance()

  it('should successfully validate schema', () => {
    const schema = {
      type: 'string'
    }

    assert.doesNotThrow(() => instance.validateSchema(schema))
  })

  it('should successfully validate schema with default value', () => {
    const schema = {
      type: 'string',
      default: 'a default value'
    }

    assert.doesNotThrow(() => instance.validateSchema(schema))
  })

  it('should successfully validate schema with default null value', () => {
    const schema = {
      type: 'string',
      default: null
    }

    assert.doesNotThrow(() => instance.validateSchema(schema))
  })

  it('should successfully validate schema with non object default value', () => {
    const schema = {
      type: 'string',
      default: 7
    }

    assert.throws(() =>
      instance.validateSchema(schema), /Invalid default value/)
  })
})

describe('generic.string.validate', () => {
  const instance = compiler.instance()
  const schema = { type: 'string', default: 'abc' }
  const validator = instance.compile(schema)

  it('should successfully validate a string', () => {
    const report1 = validator.validate(null)
    const report2 = validator.validate('xyz')
    const report3 = validator.validate(undefined)

    assert.equal(report1, true, 'should have no error with `null`')
    assert.equal(report2, true, 'should have no error with `xyz`')
    assert.equal(report3, true, 'should have no error with `undefined` using default value')
  })

  it('should successfully validate a non string', () => {
    const report1 = validator.validate(true)
    const report2 = validator.validate(false)
    const report3 = validator.validate([])
    const report4 = validator.validate(() => {})
    const report5 = validator.validate(123)
    const report6 = validator.validate({})

    assert.equal(report1[0].keyword, 'type', 'should have no error with `true`')
    assert.equal(report2[0].keyword, 'type', 'should have no error with `false`')
    assert.equal(report3[0].keyword, 'type', 'should have no error with `[]`')
    assert.equal(report4[0].keyword, 'type', 'should have no error with `() => {}`')
    assert.equal(report5[0].keyword, 'type', 'should have no error with `123`')
    assert.equal(report6[0].keyword, 'type', 'should have no error with `{}`')
  })
})

describe('generic.string.keywords.enum', () => {
  const instance = compiler.instance()

  it('should successfully validate schema with enum', () => {
    const schema = {
      type: 'string',
      enum: [ 'a', 'b', 'c' ]
    }

    assert.doesNotThrow(() => {
      instance.validateSchema(schema)
    })
  })

  it('should successfully validate schema with non string enum item', () => {
    const schema = {
      type: 'string',
      enum: [ 'a', 'b', 1, 'c' ]
    }

    assert.throws(() =>
      instance.validateSchema(schema), /enum must be a list of string/)
  })

  it('should successfully validate schema with non unique enum', () => {
    const schema = {
      type: 'string',
      enum: [ 'a', 'b', 'a', 'c' ]
    }

    assert.throws(() =>
      instance.validateSchema(schema), /enum must be a list of unique string/)
  })

  it('should successfully validate schema with default value in enum', () => {
    const schema = {
      type: 'string',
      enum: [ 'a', 'b', 'c' ],
      default: 'b'
    }

    assert.doesNotThrow(() => {
      instance.validateSchema(schema)
    })
  })

  it('should successfully validate schema with unknow default value in enum', () => {
    const schema = {
      type: 'string',
      enum: [ 'a', 'b', 'c' ],
      default: 'd'
    }

    assert.throws(() =>
      instance.validateSchema(schema), /Invalid default value "d"/)
  })
})

describe('generic.string.keywords.format', () => {
  const instance = compiler.instance()

  it('should successfully validate with a non existing format', () => {
    const schema = {
      type: 'string',
      format: 'non-existing',
      default: 'xyz'
    }

    assert.throws(() =>
      instance.validateSchema(schema), /Unknow format/)
  })
})

describe('generic.string.keywords.format.date-time', () => {
  const instance = compiler.instance()

  it('should successfully validate with current date value', () => {
    const schema = {
      type: 'string',
      format: 'date',
      default: JSON.parse(JSON.stringify(new Date()))
    }

    assert.doesNotThrow(() => instance.validateSchema(schema))
  })

  it('should successfully validate with a bad date-time value', () => {
    const schema = {
      type: 'string',
      format: 'date-time',
      default: '2017-05-08T17:20:42.576Y'
    }

    assert.throws(() =>
      instance.validateSchema(schema), /Invalid default value/)
  })
})

describe('generic.string.keywords.format.email', () => {
  const instance = compiler.instance()
  const schema = {
    type: 'string',
    format: 'email'
  }

  it('should successfully validate with an email', () => {
    schema.default = 'demo@example.com'

    assert.doesNotThrow(() => instance.validateSchema(schema))
  })

  it('should successfully validate with a non valid email', () => {
    schema.default = 'demo @example.com'

    assert.throws(() =>
      instance.validateSchema(schema), /Invalid default value/)
  })
})

describe('generic.string.keywords.format.hostname', () => {
  const instance = compiler.instance()
  const schema = {
    type: 'string',
    format: 'hostname'
  }

  it('should successfully validate with a hostname', () => {
    schema.default = 'example.com'

    assert.doesNotThrow(() => instance.validateSchema(schema))
  })

  it('should successfully validate with a non valid hostname', () => {
    schema.default = 'example/com'

    assert.throws(() =>
      instance.validateSchema(schema), /Invalid default value/)
  })
})

describe('generic.string.keywords.format.ipv4', () => {
  const instance = compiler.instance()
  const schema = {
    type: 'string',
    format: 'ipv4'
  }

  it('should successfully validate with a ipv4', () => {
    schema.default = '127.0.0.1'

    assert.doesNotThrow(() => instance.validateSchema(schema))
  })

  it('should successfully validate with a non valid ipv4', () => {
    schema.default = '256.0.0.0'

    assert.throws(() =>
      instance.validateSchema(schema), /Invalid default value/)
  })
})

describe('generic.string.keywords.format.ipv6', () => {
  const instance = compiler.instance()
  const schema = {
    type: 'string',
    format: 'ipv6'
  }

  it('should successfully validate with a ipv6', () => {
    schema.default = '0:0:0:0:0:ffff:7f00:1'

    assert.doesNotThrow(() => instance.validateSchema(schema))
  })

  it('should successfully validate with a non valid ipv6', () => {
    schema.default = 'g:0:0:0:0:ffff:ff00:0'

    assert.throws(() =>
      instance.validateSchema(schema), /Invalid default value/)
  })
})

describe('generic.string.keywords.format.uri', () => {
  const instance = compiler.instance()
  const schema = {
    type: 'string',
    format: 'uri'
  }

  it('should successfully validate with a uri', () => {
    schema.default = 'xyz://google.com:8888'

    assert.doesNotThrow(() => instance.validateSchema(schema))
  })

  it('should successfully validate with a non valid uri', () => {
    schema.default = 'pamela.98'

    assert.throws(() =>
      instance.validateSchema(schema), /Invalid default value/)
  })
})

describe('generic.string.keywords.maxLength', () => {
  const instance = compiler.instance()
  const schema = {
    type: 'string',
    default: 'xyz'
  }

  it('should successfully validate exacting size', () => {
    schema.maxLength = schema.default.length

    assert.doesNotThrow(() => instance.validateSchema(schema))
  })

  it('should successfully validate with exceeding size', () => {
    schema.maxLength = schema.default.length - 1

    assert.throws(() =>
      instance.validateSchema(schema), /Invalid default value/)
  })

  it('should successfully validate with a null default value', () => {
    schema.default = null

    assert.doesNotThrow(() => instance.validateSchema(schema))
  })
})

describe('generic.string.keywords.minLength', () => {
  const instance = compiler.instance()
  const schema = {
    type: 'string',
    default: 'xyz'
  }

  it('should successfully validate with exacting size', () => {
    schema.minLength = schema.default.length

    assert.doesNotThrow(() => instance.validateSchema(schema))
  })

  it('should successfully validate with fewer character', () => {
    schema.default = schema.default.substring(1)

    assert.throws(() =>
      instance.validateSchema(schema), /Invalid default value/)
  })

  it('should successfully validate with a null default value', () => {
    schema.default = null

    assert.doesNotThrow(() => instance.validateSchema(schema))
  })
})

describe('generic.string.keywords.pattern', () => {
  const instance = compiler.instance()
  const schema = {
    type: 'string',
    pattern: /y/,
    default: 'xyz'
  }

  it('should successfully validate', () => {
    assert.doesNotThrow(() => instance.validateSchema(schema))
  })

  it('should successfully validate with unmatching default value', () => {
    schema.default = 'abc'

    assert.throws(() =>
      instance.validateSchema(schema), /Invalid default value/)
  })

  it('should successfully validate with a null default value', () => {
    schema.default = null

    assert.throws(() =>
      compiler.instance().validateSchema(schema), /Invalid default value null/)
  })
})

describe('generic.string.keywords.required', () => {
  const instance = compiler.instance()
  const schema = {
    type: 'string',
    required: true
  }
  const validator = instance.compile(schema)

  it('should successfully validate a null value', () => {
    const report = validator.validate(null)

    assert.equal(report.length, 1, 'should have only one error item')
    assert.equal(report[0].keyword, 'required', 'should have `required` keyword error')
  })

  it('should successfully validate an empty string', () => {
    const report = validator.validate('')

    assert.equal(report.length, 1, 'should have only one error item')
    assert.equal(report[0].keyword, 'required', 'should have `required` keyword error')
  })

  it('should successfully validate a non empty string', () => {
    const report = validator.validate('-')

    assert.equal(report, true, 'should have no error item')
  })

  it('should successfully validate an empty value with required == false', () => {
    const schema = {
      type: 'string',
      required: false
    }
    const validator = instance.compile(schema)
    const report = validator.validate('')

    assert.equal(report, true, 'should have no error item')
  })
})
