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

describe('generic.boolean.async.validate', async () => {
  const jsv = new JsonSchemav({ async: true })
  const schema = { type: 'boolean', default: true }
  const instance = await jsv.compile(schema)

  it('should successfully validate a boolean', async () => {
    const report1 = await instance.validate(true)
    const report2 = await instance.validate(false)

    assert.equal(report1, true, 'should have no error with `true`')
    assert.equal(report2, true, 'should have no error with `false`')
  })

  it('should successfully validate a non boolean', () => {
    [ 123, null, [], () => {}, 'abc', {} ].forEach(async (data) => {
      try {
        await instance.validate(data)
      } catch (report) {
        data = JSON.stringify(data)

        assert.equal(report[0].keyword, 'type', `should have no error with ${data}`)
      }
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
      .catch(() => done(new Error()))
  })

  it('should successfully validate schema with unknow default value in enum', (done) => {
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
