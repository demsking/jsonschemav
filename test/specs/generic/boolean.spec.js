'use strict'

const assert = require('assert')
const should = require('../..').should
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

  it('should successfully validate schema with non boolean default value', (done) => {
    const schema = {
      type: 'boolean',
      default: 1
    }

    should.throw.with.defaultValue(jsv, schema, 'type', done)
  })
})

describe('generic.boolean.validate', () => {
  const jsv = new JsonSchemav()
  const schema = { type: 'boolean', default: true }

  it('should successfully validate a boolean', (done) => {
    [ true, false ].forEach((data) => {
      schema.default = data
      should.validate.with.defaultValue(jsv, schema, done, false)
    })

    done()
  })

  it('should successfully validate a non boolean', (done) => {
    [ 123, null, [], () => {}, 'abc', {}, undefined ].forEach((data) => {
      schema.default = data
      should.throw.with.defaultValue(jsv, schema, 'type', done, false)
    })

    done()
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

    return jsv.compile(schema)
  })

  it('should successfully validate schema with unknow default value in enum', (done) => {
    const schema = {
      type: 'boolean',
      enum: [ true ],
      default: false
    }

    should.throw.with.defaultValue(jsv, schema, 'enum', done)
  })
})
