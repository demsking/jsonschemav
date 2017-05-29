'use strict'

const assert = require('assert')
const JsonSchemav = require('../../../lib/api')

/* global describe it */

describe('generic.string.validateSchema', () => {
  const jsv = new JsonSchemav()

  it('should successfully validate schema', () => {
    const schema = {
      type: 'string'
    }

    assert.doesNotThrow(() => jsv.validateSchema(schema))
  })

  it('should successfully validate schema with default value', () => {
    const schema = {
      type: 'string',
      default: 'a default value'
    }

    assert.doesNotThrow(() => jsv.validateSchema(schema))
  })

  it('should successfully validate schema with default null value', () => {
    const schema = {
      type: 'string',
      default: null
    }

    assert.doesNotThrow(() => jsv.validateSchema(schema))
  })

  it('should successfully validate schema with non object default value', () => {
    const schema = {
      type: 'string',
      default: 7
    }

    assert.throws(() =>
      jsv.compile(schema), /Invalid default value/)
  })

  it('should successfully validate schema with maxLength', () => {
    const schema = {
      type: 'string',
      maxLength: 12
    }

    assert.doesNotThrow(() =>
      jsv.validateSchema(schema), 'should validate an integer value')

    assert.doesNotThrow(() => {
      schema.maxLength = 0

      jsv.validateSchema(schema)
    }, 'should validate an 0 interger value')

    assert.throws(() => {
      schema.maxLength = -1

      jsv.validateSchema(schema)
    }, /maxLength must be greater than, or equal to, 0/, 'should validate with a negative integer value `-1`')

    assert.throws(() => {
      schema.maxLength = 'abc'

      jsv.validateSchema(schema)
    }, /maxLength must be an integer/, 'should validate with a string value `abc`')

    assert.throws(() => {
      schema.maxLength = '123'

      jsv.validateSchema(schema)
    }, /maxLength must be an integer/, 'should validate with a string value value `123`')
  })

  it('should successfully validate schema with minLength', () => {
    const schema = {
      type: 'string',
      minLength: 12
    }

    assert.doesNotThrow(() =>
      jsv.validateSchema(schema), 'should validate an interger value')

    assert.doesNotThrow(() => {
      schema.minLength = 0

      jsv.validateSchema(schema)
    }, 'should validate an 0 interger value')

    assert.throws(() => {
      schema.minLength = -1

      jsv.validateSchema(schema)
    }, /minLength must be greater than, or equal to, 0/, 'should validate with a negative integer value `-1`')

    assert.throws(() => {
      schema.minLength = 'abc'

      jsv.validateSchema(schema)
    }, /minLength must be an integer/, 'should validate with a string value `abc`')

    assert.throws(() => {
      schema.minLength = '123'

      jsv.validateSchema(schema)
    }, /minLength must be an integer/, 'should validate with a string value value `123`')
  })

  it('should successfully validate schema with pattern', () => {
    const schema = {
      type: 'string'
    }

    assert.throws(() => {
      schema.pattern = null
      jsv.validateSchema(schema)
    }, /pattern must be a string/, 'should validate with a null pattern value')

    assert.throws(() => {
      schema.pattern = undefined
      jsv.validateSchema(schema)
    }, /pattern must be a string/, 'should validate with an undefined pattern value')

    assert.throws(() => {
      schema.pattern = []
      jsv.validateSchema(schema)
    }, /pattern must be a string/, 'should validate with a non object value')

    assert.doesNotThrow(() => {
      schema.pattern = '^abc$'
      jsv.validateSchema(schema)
    }, 'should validate with a valide pattern value')

    assert.throws(() => {
      schema.pattern = 'invalid reg exp ('
      jsv.validateSchema(schema)
    }, /Invalid regular expression/, 'should validate with an invalid regular expression key')
  })
})

describe('generic.string.validate', () => {
  const jsv = new JsonSchemav()
  const schema = { type: 'string', default: 'abc' }
  const instance = jsv.compile(schema)

  it('should successfully validate a string', () => {
    [ null, 'xyz', 'Déjà vue', '', '42', undefined ].forEach((data) => {
      const report = instance.validate(data)

      data = JSON.stringify(data)

      assert.ok(report, `should have no error with ${data}`)
    })
  })

  it('should successfully validate a non string', () => {
    [ true, false, [], () => {}, 123, {} ].forEach((data) => {
      const reports = instance.validate(data)

      data = JSON.stringify(data)

      assert.equal(reports[0].keyword, 'type', `should have no error with ${data}`)
    })
  })
})

describe('generic.string.keywords.default', () => {
  const jsv = new JsonSchemav()

  it('should successfully validate schema with default value now()', () => {
    ['date', 'time', 'timestamp', 'date-time'].forEach((format) => {
      const schema = { type: 'string', format: format, default: 'now()' }
      const instance = jsv.compile(schema)
      const report = instance.validate(undefined)

      assert.equal(report, true, `should successfully validate with ${format}`)
    })
  })

  it('should successfully validate schema with missing embedded field', () => {
    ['date', 'time', 'timestamp', 'date-time'].forEach((format) => {
      const schema = {
        type: 'object',
        properties: {
          [format]: {
            type: 'string',
            format: format,
            default: 'now()'
          }
        }
      }

      const instance = jsv.compile(schema)
      const report = instance.validate({})

      assert.equal(report, true, `should successfully validate with ${format}`)
    })
  })
})

describe('generic.string.keywords.enum', () => {
  const jsv = new JsonSchemav()

  it('should successfully validate schema with enum', () => {
    const schema = {
      type: 'string',
      enum: [ 'a', 'b', 'c' ]
    }

    assert.doesNotThrow(() => {
      jsv.validateSchema(schema)
    })
  })

  it('should successfully validate schema with non string enum item', () => {
    const schema = {
      type: 'string',
      enum: [ 'a', 'b', 1, 'c' ]
    }

    assert.throws(() =>
      jsv.validateSchema(schema), /enum must be a list of string/)
  })

  it('should successfully validate schema with non unique enum', () => {
    const schema = {
      type: 'string',
      enum: [ 'a', 'b', 'a', 'c' ]
    }

    assert.throws(() =>
      jsv.validateSchema(schema), /enum must be a list of unique string/)
  })

  it('should successfully validate schema with default value in enum', () => {
    const schema = {
      type: 'string',
      enum: [ 'a', 'b', 'c' ],
      default: 'b'
    }

    assert.doesNotThrow(() => {
      jsv.validateSchema(schema)
    })
  })

  it('should successfully validate schema with unknow default value in enum', () => {
    const schema = {
      type: 'string',
      enum: [ 'a', 'b', 'c' ],
      default: 'd'
    }

    assert.throws(() =>
      jsv.compile(schema), /Invalid default value "d"/)
  })
})

describe('generic.string.keywords.format', () => {
  const jsv = new JsonSchemav()

  it('should successfully validate with a non existing format', () => {
    const schema = {
      type: 'string',
      format: 'non-existing',
      default: 'xyz'
    }

    assert.throws(() =>
      jsv.compile(schema), /Unknow format/)
  })
})

describe('generic.string.keywords.format.date-time', () => {
  const jsv = new JsonSchemav()

  it('should successfully validate with current date value', () => {
    const schema = {
      type: 'string',
      format: 'date',
      default: JSON.parse(JSON.stringify(new Date()))
    }

    assert.doesNotThrow(() => jsv.compile(schema))
  })

  it('should successfully validate with a bad date-time value', () => {
    const schema = {
      type: 'string',
      format: 'date-time',
      default: '2017-05-08T17:20:42.576Y'
    }

    assert.throws(() =>
      jsv.compile(schema), /Invalid default value/)
  })
})

describe('generic.string.keywords.format.email', () => {
  const jsv = new JsonSchemav()
  const schema = {
    type: 'string',
    format: 'email'
  }

  it('should successfully validate with an email', () => {
    schema.default = 'demo@example.com'

    assert.doesNotThrow(() => jsv.validateSchema(schema))
  })

  it('should successfully validate with a non valid email', () => {
    schema.default = 'demo @example.com'

    assert.throws(() =>
      jsv.compile(schema), /Invalid default value/)
  })
})

describe('generic.string.keywords.format.hostname', () => {
  const jsv = new JsonSchemav()
  const schema = {
    type: 'string',
    format: 'hostname'
  }

  it('should successfully validate with a hostname', () => {
    schema.default = 'example.com'

    assert.doesNotThrow(() => jsv.validateSchema(schema))
  })

  it('should successfully validate with a non valid hostname', () => {
    schema.default = 'example/com'

    assert.throws(() =>
      jsv.compile(schema), /Invalid default value/)
  })
})

describe('generic.string.keywords.format.ipv4', () => {
  const jsv = new JsonSchemav()
  const schema = {
    type: 'string',
    format: 'ipv4'
  }

  it('should successfully validate with a ipv4', () => {
    schema.default = '127.0.0.1'

    assert.doesNotThrow(() => jsv.validateSchema(schema))
  })

  it('should successfully validate with a non valid ipv4', () => {
    schema.default = '256.0.0.0'

    assert.throws(() =>
      jsv.compile(schema), /Invalid default value/)
  })
})

describe('generic.string.keywords.format.ipv6', () => {
  const jsv = new JsonSchemav()
  const schema = {
    type: 'string',
    format: 'ipv6'
  }

  it('should successfully validate with a ipv6', () => {
    schema.default = '0:0:0:0:0:ffff:7f00:1'

    assert.doesNotThrow(() => jsv.validateSchema(schema))
  })

  it('should successfully validate with a non valid ipv6', () => {
    schema.default = 'g:0:0:0:0:ffff:ff00:0'

    assert.throws(() =>
      jsv.compile(schema), /Invalid default value/)
  })
})

describe('generic.string.keywords.format.uri', () => {
  const jsv = new JsonSchemav()
  const schema = {
    type: 'string',
    format: 'uri'
  }

  it('should successfully validate with a uri', () => {
    schema.default = 'xyz://google.com:8888'

    assert.doesNotThrow(() => jsv.validateSchema(schema))
  })

  it('should successfully validate with a non valid uri', () => {
    schema.default = 'pamela.98'

    assert.throws(() =>
      jsv.compile(schema), /Invalid default value/)
  })
})

describe('generic.string.keywords.maxLength', () => {
  const jsv = new JsonSchemav()
  const schema = {
    type: 'string',
    default: 'xyz'
  }

  it('should successfully validate exacting size', () => {
    schema.maxLength = schema.default.length

    assert.doesNotThrow(() => jsv.compile(schema))
  })

  it('should successfully validate with exceeding size', () => {
    schema.maxLength = schema.default.length - 1

    assert.throws(() =>
      jsv.compile(schema), /Invalid default value/)
  })

  it('should successfully validate with a null default value', () => {
    schema.default = null

    assert.doesNotThrow(() => jsv.compile(schema))
  })
})

describe('generic.string.keywords.minLength', () => {
  const jsv = new JsonSchemav()
  const schema = {
    type: 'string',
    default: 'xyz'
  }

  it('should successfully validate with exacting size', () => {
    schema.minLength = schema.default.length

    assert.doesNotThrow(() => jsv.compile(schema))
  })

  it('should successfully validate with fewer character', () => {
    schema.default = schema.default.substring(1)

    assert.throws(() =>
      jsv.compile(schema), /Invalid default value/)
  })

  it('should successfully validate with a null default value', () => {
    schema.default = null

    assert.doesNotThrow(() => jsv.compile(schema))
  })
})

describe('generic.string.keywords.pattern', () => {
  const jsv = new JsonSchemav()
  const schema = {
    type: 'string',
    pattern: '^(\\([0-9]{3}\\))?[0-9]{3}-[0-9]{4}$'
  }

  it('should successfully validate', () => {
    schema.default = '555-1212'
    assert.doesNotThrow(() =>
      jsv.validateSchema(schema), `should successfully validate ${schema.default}`)

    schema.default = '(888)555-1212'
    assert.doesNotThrow(() =>
      jsv.validateSchema(schema), `should successfully validate ${schema.default}`)

    schema.default = '(888)555-1212 ext. 532'
    assert.throws(() => jsv.compile(schema),
      /Invalid default value/, `should successfully validate ${schema.default}`)

    schema.default = '(800)FLOWERS'
    assert.throws(() => jsv.compile(schema),
      /Invalid default value/, `should successfully validate ${schema.default}`)

    schema.default = null
    assert.throws(() => jsv.compile(schema),
      /Invalid default value/, `should successfully validate ${schema.default}`)
  })
})

describe('generic.string.keywords.required', () => {
  const jsv = new JsonSchemav()
  const schema = {
    type: 'string',
    required: true
  }
  const instance = jsv.compile(schema)

  it('should successfully validate a null value', () => {
    const report = instance.validate(null)

    assert.equal(report.length, 1, 'should have only one error item')
    assert.equal(report[0].keyword, 'required', 'should have `required` keyword error')
  })

  it('should successfully validate an empty string', () => {
    const report = instance.validate('')

    assert.equal(report, true, 'should have no error item')
  })

  it('should successfully validate a non empty string', () => {
    const report = instance.validate('-')

    assert.equal(report, true, 'should have no error item')
  })

  it('should successfully validate an empty value with required == false', () => {
    const schema = {
      type: 'string',
      required: false
    }
    const instance = jsv.compile(schema)
    const report = instance.validate('')

    assert.equal(report, true, 'should have no error item')
  })
})
