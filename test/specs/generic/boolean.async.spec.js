'use strict'

const assert = require('assert')
const JsonSchemav = require('../../../lib/api')

/* global describe it */

describe('generic.boolean.async.compile', () => {
  const jsv = new JsonSchemav({ async: true })

  it('should successfully validate schema with non boolean default value', (done) => {
    const schema = {
      type: 'boolean',
      default: 1
    }

    jsv.compile(schema)
      .then(() => done(new Error()))
      .catch(() => done())
  })
})

describe('generic.boolean.async.validate', () => {
  const jsv = new JsonSchemav({ async: true })
  const schema = { type: 'boolean', default: true }

  jsv.compile(schema).then((instance) => {
    it('should successfully validate a boolean', () => {
      instance.validate(true).then((report) => {
        assert.equal(report, true, 'should have no error with `true`')
      })

      instance.validate(false).then((report) => {
        assert.equal(report, true, 'should have no error with `false`')
      })
    })

    it('should successfully validate a non boolean', () => {
      [ 123, null, [], () => {}, 'abc', {} ].forEach((data) => {
        const message = `should have no error with ${JSON.stringify(data)}`

        instance.validate(data)
          .then(() => {
            throw new Error(message)
          })
          .catch((err) => {
            assert.equal(err.errors[0].keyword, 'type', message)
          })
      })
    })
  })
})

describe('generic.boolean.async.keywords.enum', () => {
  const jsv = new JsonSchemav({ async: true })

  it('should successfully validate schema with default value in enum', (done) => {
    const schema = {
      type: 'boolean',
      enum: [ true, false ],
      default: false
    }

    jsv.compile(schema)
      .then(() => done())
      .catch(done)
  })

  it('should successfully validate schema with unknown default value in enum', (done) => {
    const schema = {
      type: 'boolean',
      enum: [ true ],
      default: false
    }

    jsv.compile(schema)
      .then(() => done(new Error()))
      .catch(() => done())
  })
})
