'use strict'

const assert = require('assert')
const should = require('../..').should
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

  it('should successfully validate schema with default value', (done) => {
    const schema = {
      type: 'string',
      default: 'a default value'
    }

    should.validate.with.defaultValue(jsv, schema, done)
  })

  it('should successfully validate schema with default null value', (done) => {
    const schema = {
      type: 'string',
      default: null
    }

    should.validate.with.defaultValue(jsv, schema, done)
  })

  it('should successfully validate schema with a non valid default value', (done) => {
    const schema = {
      type: 'string',
      default: 7
    }

    should.throw.with.defaultValue(jsv, schema, 'type', done)
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

  it('should successfully validate a string', (done) => {
    const values = [ null, 'xyz', 'Déjà vue', '', '42', undefined ]

    should.validate.with.each(values, jsv, schema, done)
  })

  it('should successfully validate a non string', (done) => {
    const values = [ true, false, [], () => {}, 123, {} ]

    should.throw.with.each(values, jsv, schema, done)
  })
})

describe('generic.string.keywords.default', () => {
  const jsv = new JsonSchemav()
  const throws = (format, err) => new Error(`should successfully validate with 'format: ${format}'. Recieved ${JSON.stringify(err.errors)}`)
  const formats = ['date', 'time', 'timestamp', 'date-time']

  it('should successfully validate schema with default value now()', (done) => {
    formats.forEach((format) => {
      const schema = { type: 'string', format: format, default: 'now()' }

      jsv.compile(schema).then((instance) => {
        return instance.validate(undefined)
      }).catch((err) => {
        done(throws(format, err))
      })
    })

    done()
  })

  it('should successfully validate schema with missing embedded field', (done) => {
    formats.forEach((format) => {
      const schema = {
        type: 'object',
        properties: {
          datetime: {
            type: 'string',
            format: format,
            default: 'now()'
          }
        }
      }

      jsv.compile(schema).then((instance) => {
        return instance.validate({})
      }).catch((err) => {
        done(throws(format, err))
      })
    })

    done()
  })
})

describe('generic.string.keywords.enum', () => {
  const jsv = new JsonSchemav()
//   const throws = (value, err) => new Error(`should successfully validate with 'default: ${value}'. Recieved ${JSON.stringify(err.errors)}`)

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

    return jsv.compile(schema)
  })

  it('should successfully validate schema with unknow default value in enum', (done) => {
    const schema = {
      type: 'string',
      enum: [ 'a', 'b', 'c' ],
      default: 'd'
    }

    should.throw.with.defaultValue(jsv, schema, 'enum', done)
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

    assert.throws(() => {
      jsv.compile(schema)
    }, /Unknow format 'non-existing'/)
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

    return jsv.compile(schema)
  })

  it('should successfully validate with a bad date-time value', (done) => {
    const schema = {
      type: 'string',
      format: 'date-time',
      default: '2017-05-08T17:20:42.576Y'
    }

    should.throw.with.defaultValue(jsv, schema, 'format', done)
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

    return jsv.compile(schema)
  })

  it('should successfully validate with a non valid email', (done) => {
    schema.default = 'invalid email example.com'

    should.throw.with.defaultValue(jsv, schema, 'format', done)
  })
})

describe('generic.string.keywords.format.hostname', () => {
  const jsv = new JsonSchemav()
  const schema = {
    type: 'string',
    format: 'hostname'
  }

  it('should successfully validate with a hostname', (done) => {
    schema.default = 'example.com'

    should.validate.with.defaultValue(jsv, schema, done)
  })

  it('should successfully validate with a non valid hostname', (done) => {
    schema.default = 'example/com'

    should.throw.with.defaultValue(jsv, schema, 'format', done)
  })
})

describe('generic.string.keywords.format.ipv4', () => {
  const jsv = new JsonSchemav()
  const schema = {
    type: 'string',
    format: 'ipv4'
  }

  it('should successfully validate with a ipv4', (done) => {
    schema.default = '127.0.0.1'

    should.validate.with.defaultValue(jsv, schema, done)
  })

  it('should successfully validate with a non valid ipv4', (done) => {
    schema.default = '256.0.0.0'

    should.throw.with.defaultValue(jsv, schema, 'format', done)
  })
})

describe('generic.string.keywords.format.ipv6', () => {
  const jsv = new JsonSchemav()
  const schema = {
    type: 'string',
    format: 'ipv6'
  }

  it('should successfully validate with a ipv6', (done) => {
    schema.default = '0:0:0:0:0:ffff:7f00:1'

    should.validate.with.defaultValue(jsv, schema, done)
  })

  it('should successfully validate with a non valid ipv6', (done) => {
    schema.default = 'g:0:0:0:0:ffff:ff00:0'

    should.throw.with.defaultValue(jsv, schema, 'format', done)
  })
})

describe('generic.string.keywords.format.uri', () => {
  const jsv = new JsonSchemav()
  const schema = {
    type: 'string',
    format: 'uri'
  }

  it('should successfully validate with a uri', (done) => {
    schema.default = 'xyz://google.com:8888'

    should.validate.with.defaultValue(jsv, schema, done)
  })

  it('should successfully validate with a non valid uri', (done) => {
    schema.default = 'pamela.98'

    should.throw.with.defaultValue(jsv, schema, 'format', done)
  })
})

describe('generic.string.keywords.maxLength', () => {
  const jsv = new JsonSchemav()
  const schema = {
    type: 'string',
    default: 'xyz'
  }

  it('should successfully validate exacting size', (done) => {
    schema.maxLength = schema.default.length

    should.validate.with.defaultValue(jsv, schema, done)
  })

  it('should successfully validate with exceeding size', (done) => {
    schema.maxLength = schema.default.length - 1

    should.throw.with.defaultValue(jsv, schema, 'maxLength', done)
  })

  it('should successfully validate with a null default value', (done) => {
    schema.default = null

    should.validate.with.defaultValue(jsv, schema, done)
  })
})

describe('generic.string.keywords.minLength', () => {
  const jsv = new JsonSchemav()
  const schema = {
    type: 'string',
    default: 'xyz'
  }

  it('should successfully validate with exacting size', (done) => {
    schema.minLength = schema.default.length

    should.validate.with.defaultValue(jsv, schema, done)
  })

  it('should successfully validate with fewer character', (done) => {
    schema.default = schema.default.substring(1)

    should.throw.with.defaultValue(jsv, schema, 'minLength', done)
  })

  it('should successfully validate with a null default value', (done) => {
    schema.default = null

    should.validate.with.defaultValue(jsv, schema, done)
  })
})

describe('generic.string.keywords.pattern', () => {
  const jsv = new JsonSchemav()
  const schema = {
    type: 'string',
    pattern: '^(\\([0-9]{3}\\))?[0-9]{3}-[0-9]{4}$'
  }

  it('should successfully validate', (done) => {
    schema.default = '555-1212'
    should.validate.with.defaultValue(jsv, schema, done, false)

    schema.default = '(888)555-1212'
    should.validate.with.defaultValue(jsv, schema, done, false)

    schema.default = '(888)555-1212 ext. 532'
    should.throw.with.defaultValue(jsv, schema, 'pattern', done, false)

    schema.default = '(800)FLOWERS'
    should.throw.with.defaultValue(jsv, schema, 'pattern', done, false)

    schema.default = null
    should.throw.with.defaultValue(jsv, schema, 'pattern', done, false)

    done()
  })
})

describe('generic.string.keywords.required', () => {
  const jsv = new JsonSchemav()
  const schema = {
    type: 'string',
    required: true
  }

  it('should successfully validate a null value', (done) => {
    schema.default = null
    should.throw.with.defaultValue(jsv, schema, 'required', done)
  })

  it('should successfully validate an empty string', (done) => {
    schema.default = ''
    should.validate.with.defaultValue(jsv, schema, done)
  })

  it('should successfully validate a non empty string', (done) => {
    schema.default = '-'
    should.validate.with.defaultValue(jsv, schema, done)
  })

  it('should successfully validate an empty value with required == false', (done) => {
    const schema = {
      type: 'string',
      required: false
    }

    schema.default = ''
    should.validate.with.defaultValue(jsv, schema, done)
  })
})
