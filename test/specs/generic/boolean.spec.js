'use strict'

const assert = require('assert')
const compiler = require('../../../lib/compiler')

/* global describe it */

describe('generic.boolean.validateSchema', () => {
  const instance = compiler.instance()

  it('should successfully validate schema', () => {
    const schema = {
      type: 'boolean'
    }

    assert.doesNotThrow(() => {
      instance.validateSchema(schema)
    })
  })

  it('should successfully validate schema with default value', () => {
    const schema = {
      type: 'boolean',
      default: true
    }

    assert.doesNotThrow(() => {
      instance.validateSchema(schema)
    })
  })

  it('should successfully validate schema with non boolean default value', () => {
    const schema = {
      type: 'boolean',
      default: 1
    }

    assert.throws(() =>
      instance.validateSchema(schema), /Invalid default value/)
  })
})

describe('generic.boolean.validate', () => {
  const instance = compiler.instance()
  const schema = { type: 'boolean', default: true }
  const validator = instance.compile(schema)

  it('should successfully validate a boolean', () => {
    const report1 = validator.validate(true)
    const report2 = validator.validate(false)

    assert.equal(report1, true, 'should have no error with `true`')
    assert.equal(report2, true, 'should have no error with `false`')
  })

  it('should successfully validate a non boolean', () => {
    const report1 = validator.validate(123)
    const report2 = validator.validate(null)
    const report3 = validator.validate([])
    const report4 = validator.validate(() => {})
    const report5 = validator.validate('abc')
    const report6 = validator.validate({})

    assert.equal(report1[0].keyword, 'type', 'should have no error with `123`')
    assert.equal(report2[0].keyword, 'type', 'should have no error with `null`')
    assert.equal(report3[0].keyword, 'type', 'should have no error with `[]`')
    assert.equal(report4[0].keyword, 'type', 'should have no error with `() => {}`')
    assert.equal(report5[0].keyword, 'type', 'should have no error with `abc`')
    assert.equal(report6[0].keyword, 'type', 'should have no error with `{}`')
  })
})

describe('generic.boolean.keywords.enum', () => {
  const instance = compiler.instance()

  it('should successfully validate schema with enum', () => {
    const schema = {
      type: 'boolean',
      enum: [ true, false ]
    }

    assert.doesNotThrow(() => {
      instance.validateSchema(schema)
    })
  })

  it('should successfully validate schema with non boolean enum item', () => {
    const schema = {
      type: 'boolean',
      enum: [ true, 'a', false ]
    }

    assert.throws(() =>
      instance.validateSchema(schema), /enum must be a list of boolean/)
  })

  it('should successfully validate schema with non unique enum', () => {
    const schema = {
      type: 'boolean',
      enum: [ true, false, true ]
    }

    assert.throws(() =>
      instance.validateSchema(schema), /enum must be a list of unique boolean/)
  })

  it('should successfully validate schema with default value in enum', () => {
    const schema = {
      type: 'boolean',
      enum: [ true, false ],
      default: false
    }

    assert.doesNotThrow(() => {
      instance.validateSchema(schema)
    })
  })

  it('should successfully validate schema with unknow default value in enum', () => {
    const schema = {
      type: 'boolean',
      enum: [ true ],
      default: false
    }

    assert.throws(() =>
      instance.validateSchema(schema), /Invalid default value false/)
  })
})
