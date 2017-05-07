'use strict'

const assert = require('assert')
const compiler = require('../../../lib/compiler')

/* global describe it */

describe('generic.numeric.validateSchema', () => {
  const instance = compiler.instance()

  it('should successfully validate schema', () => {
    const schema = {
      type: 'numeric'
    }

    assert.doesNotThrow(() => {
      instance.validateSchema(schema)
    })
  })

  it('should successfully validate schema with default value', () => {
    const schema = {
      type: 'numeric',
      default: 12
    }

    assert.doesNotThrow(() => {
      instance.validateSchema(schema)
    })
  })

  it('should successfully validate schema with default float value', () => {
    const schema = {
      type: 'numeric',
      default: 12.01
    }

    assert.doesNotThrow(() => {
      instance.validateSchema(schema)
    })
  })

  it('should successfully validate schema with non numeric default value', () => {
    const schema = {
      type: 'numeric',
      default: '7'
    }

    assert.throws(() =>
      instance.validateSchema(schema), /Invalid default value/)
  })
})

describe('generic.numeric.validate', () => {
  const instance = compiler.instance()
  const schema = { type: 'numeric', default: 12 }
  const validator = instance.compile(schema)

  it('should successfully validate a numeric', () => {
    const report1 = validator.validate(12)
    const report2 = validator.validate(12.01)
    const report3 = validator.validate(-12)

    assert.equal(report1, true, 'should have no error with `12`')
    assert.equal(report2, true, 'should have no error with `12.02`')
    assert.equal(report3, true, 'should have no error with `-12` using default value')
  })

  it('should successfully validate a non numeric', () => {
    const report1 = validator.validate(true)
    const report2 = validator.validate(false)
    const report3 = validator.validate([])
    const report4 = validator.validate(() => {})
    const report5 = validator.validate('abc')
    const report6 = validator.validate({})
    const report7 = validator.validate(null)

    assert.equal(report1[0].keyword, 'type', 'should have no error with `true`')
    assert.equal(report2[0].keyword, 'type', 'should have no error with `false`')
    assert.equal(report3[0].keyword, 'type', 'should have no error with `[]`')
    assert.equal(report4[0].keyword, 'type', 'should have no error with `() => {}`')
    assert.equal(report5[0].keyword, 'type', 'should have no error with `abc`')
    assert.equal(report6[0].keyword, 'type', 'should have no error with `{}`')
    assert.equal(report7[0].keyword, 'type', 'should have no error with `null`')
  })
})

describe('generic.numeric.keywords.enum', () => {
  const instance = compiler.instance()

  it('should successfully validate schema with enum', () => {
    const schema = {
      type: 'numeric',
      enum: [ 1, 2, 3 ]
    }

    assert.doesNotThrow(() => {
      instance.validateSchema(schema)
    })
  })

  it('should successfully validate schema with non numeric enum item', () => {
    const schema = {
      type: 'numeric',
      enum: [ 1, 2, 'a', 3 ]
    }

    assert.throws(() =>
      instance.validateSchema(schema), /enum must be a list of number/)
  })

  it('should successfully validate schema with non unique enum', () => {
    const schema = {
      type: 'numeric',
      enum: [ 1, 2, 1, 3 ]
    }

    assert.throws(() =>
      instance.validateSchema(schema), /enum must be a list of unique number/)
  })

  it('should successfully validate schema with default value in enum', () => {
    const schema = {
      type: 'numeric',
      enum: [ 1, 2, 3 ],
      default: 2
    }

    assert.doesNotThrow(() => {
      instance.validateSchema(schema)
    })
  })

  it('should successfully validate schema with unknow default value in enum', () => {
    const schema = {
      type: 'numeric',
      enum: [ 1, 2, 3 ],
      default: 4
    }

    assert.throws(() =>
      instance.validateSchema(schema), /Invalid default value 4/)
  })
})

describe('generic.numeric.keywords.maximum', () => {
  const instance = compiler.instance()
  const schema = {
    type: 'numeric',
    default: 3
  }

  it('should successfully validate maximum number', () => {
    schema.maximum = schema.default

    assert.doesNotThrow(() => instance.validateSchema(schema))
  })

  it('should successfully validate with exclusiveMaximum', () => {
    schema.exclusiveMaximum = true
    schema.maximum = schema.default

    assert.throws(() =>
      instance.validateSchema(schema), /Invalid default value/)
  })

  it('should successfully validate with a lower number', () => {
    schema.maximum = schema.default - 1

    assert.throws(() =>
      instance.validateSchema(schema), /Invalid default value/)
  })

  it('should successfully validate with a larger number', () => {
    schema.maximum = 0
    schema.default = 1

    assert.throws(() =>
      instance.validateSchema(schema), /Invalid default value/)
  })

  it('should successfully validate with exclusiveMaximum', () => {
    schema.exclusiveMaximum = true
    schema.maximum = schema.default

    assert.throws(() =>
      instance.validateSchema(schema), /Invalid default value/)
  })
})

describe('generic.numeric.keywords.minimum', () => {
  const instance = compiler.instance()
  const schema = {
    type: 'numeric',
    default: 3
  }

  it('should successfully validate with minimum number', () => {
    schema.minimum = schema.default

    assert.doesNotThrow(() => instance.validateSchema(schema))
  })

  it('should successfully validate with a larger number', () => {
    schema.minimum = schema.default
    schema.default = schema.default + 1

    assert.doesNotThrow(() => instance.validateSchema(schema))
  })

  it('should successfully validate with a lower number', () => {
    schema.minimum = 0
    schema.default = -1

    assert.throws(() =>
      instance.validateSchema(schema), /Invalid default value/)
  })

  it('should successfully validate with exclusiveMinimum', () => {
    schema.exclusiveMinimum = true
    schema.minimum = schema.default

    assert.throws(() =>
      instance.validateSchema(schema), /Invalid default value/)
  })
})

describe('generic.numeric.keywords.multipleOf', () => {
  const instance = compiler.instance()
  const schema = {
    type: 'numeric',
    multipleOf: 3,
    default: 9
  }

  it('should successfully validate with a default value', () => {
    assert.doesNotThrow(() => instance.validateSchema(schema))
  })

  it('should successfully validate with a non valid default value', () => {
    schema.multipleOf = 2

    assert.throws(() =>
      instance.validateSchema(schema), /Invalid default value/)
  })
})
