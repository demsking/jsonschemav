'use strict'

const assert = require('assert')
const api = require('../../../lib/api')

/* global describe it */

describe('generic.boolean.validateSchema', () => {
  const instance = api.instance()

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
      instance.compile(schema), /Invalid default value/)
  })
})

describe('generic.boolean.validate', () => {
//   const instance = api.instance()
//   const schema = { type: 'boolean', default: true }
//   const validator = instance.compile(schema)

//   it('should successfully validate a boolean', () => {
//     Promise.all([
//       validator.validate(true),
//       validator.validate(false),
//       validator.validate(undefined)
//     ]).then((results) => {
//       assert.equal(results[0], true, 'should have no error with `true`')
//       assert.equal(results[1], false, 'should have no error with `false`')
//       assert.equal(results[2], true, 'should have no error with `undefined` value')
//     })
//   })

//   it('should successfully validate a non boolean', (done) => {
//     [ 123, null, [], {}, 'abc', () => {} ].forEach((item) =>
//       validator.validate(item)
//         .then(() => done(new Error(`should have an error with ${item}`)))
//         .catch((reasons) => assert.equal(reasons[0].keyword, 'type',
//           `should have no error with ${item}`)))
//     done()
//   })
})

describe('generic.boolean.keywords.enum', () => {
  const instance = api.instance()

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
      instance.compile(schema), /Invalid default value false/)
  })
})
