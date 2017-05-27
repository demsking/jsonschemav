'use strict'

const assert = require('assert')
const JsonSchemav = require('../../../lib/api')

/* global describe it */

describe('generic.boolean.validateSchema', () => {
  const jsv = new JsonSchemav()

  it('should successfully validate schema', () => {
    const schema = {
      type: 'boolean'
    }

    assert.doesNotThrow(() => {
      jsv.validateSchema(schema)
    })
  })

  it('should successfully validate schema with default value', () => {
    const schema = {
      type: 'boolean',
      default: true
    }

    assert.doesNotThrow(() => {
      jsv.validateSchema(schema)
    })
  })

  it('should successfully validate schema with non boolean default value', () => {
    const schema = {
      type: 'boolean',
      default: 1
    }

    assert.throws(() =>
      jsv.compile(schema), /Invalid default value/)
  })
})

describe('generic.boolean.validate', () => {
  const jsv = new JsonSchemav()
  const schema = { type: 'boolean', default: true }
  const instance = jsv.compile(schema)

  it('should successfully validate a boolean', () => {
    const report1 = instance.validate(true)
    const report2 = instance.validate(false)

    assert.equal(report1, true, 'should have no error with `true`')
    assert.equal(report2, true, 'should have no error with `false`')
  })

  it('should successfully validate a non boolean', () => {
    const report1 = instance.validate(123)
    const report2 = instance.validate(null)
    const report3 = instance.validate([])
    const report4 = instance.validate(() => {})
    const report5 = instance.validate('abc')
    const report6 = instance.validate({})

    assert.equal(report1[0].keyword, 'type', 'should have no error with `123`')
    assert.equal(report2[0].keyword, 'type', 'should have no error with `null`')
    assert.equal(report3[0].keyword, 'type', 'should have no error with `[]`')
    assert.equal(report4[0].keyword, 'type', 'should have no error with `() => {}`')
    assert.equal(report5[0].keyword, 'type', 'should have no error with `abc`')
    assert.equal(report6[0].keyword, 'type', 'should have no error with `{}`')
  })
})

describe('generic.boolean.keywords.enum', () => {
  const jsv = new JsonSchemav()

  it('should successfully validate schema with enum', () => {
    const schema = {
      type: 'boolean',
      enum: [ true, false ]
    }

    assert.doesNotThrow(() => {
      jsv.validateSchema(schema)
    })
  })

  it('should successfully validate schema with non boolean enum item', () => {
    const schema = {
      type: 'boolean',
      enum: [ true, 'a', false ]
    }

    assert.throws(() =>
      jsv.validateSchema(schema), /enum must be a list of boolean/)
  })

  it('should successfully validate schema with non unique enum', () => {
    const schema = {
      type: 'boolean',
      enum: [ true, false, true ]
    }

    assert.throws(() =>
      jsv.validateSchema(schema), /enum must be a list of unique boolean/)
  })

  it('should successfully validate schema with default value in enum', () => {
    const schema = {
      type: 'boolean',
      enum: [ true, false ],
      default: false
    }

    assert.doesNotThrow(() => {
      jsv.compile(schema)
    })
  })

  it('should successfully validate schema with unknow default value in enum', () => {
    const schema = {
      type: 'boolean',
      enum: [ true ],
      default: false
    }

    assert.throws(() =>
      jsv.compile(schema), /Invalid default value false/)
  })
})
