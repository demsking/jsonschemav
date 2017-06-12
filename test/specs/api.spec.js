'use strict'

const assert = require('assert')
const should = require('..').should
const JsonSchemav = require('../../lib/api')

/* global describe it */

describe('jsv.validateSchema', () => {
  const jsv = new JsonSchemav()

  it('should successfully validate non object schema', () => {
    const schema = 'non object schema'

    assert.throws(() =>
      jsv.validateSchema(schema), /schema must be an object/)
  })

  it('should successfully validate a null schema', () => {
    const schema = null

    assert.throws(() =>
      jsv.validateSchema(schema), /schema must be an object/)
  })

  it('should successfully validate schema with array type', () => {
    let schema = {
      type: ['string']
    }

    assert.throws(() =>
      jsv.validateSchema(schema), /schema.type must be a string/)

    schema = {
      type: 'object',
      properties: {
        name: {
          type: []
        }
      }
    }

    assert.throws(() => jsv.validateSchema(schema),
      /A property entry must have at least one item/)
  })
})

describe('jsv.addCompileStep', () => {
  const jsv = new JsonSchemav()

  it('should successfully add new compile step', (done) => {
    jsv.addCompileStep('string', function () {
      this.schema.$compiled = true
    })

    jsv.addCompileStep('string', function () {})

    jsv.compile({ type: 'string' }).then((instance) => {
      assert.equal(instance.compileSteps.length, 2,
        'instance should have one compile step function')

      assert.ok(instance.schema.hasOwnProperty('$compiled'),
        'instance\'s schema should have a $compiled entry')

      done()
    }).catch(done)
  })

  it('should successfully execute with a valid type name', () => {
    assert.throws(() =>
      jsv.addCompileStep('xyz', null), /Unknown type 'xyz'/)
  })

  it('should successfully execute with a non compile step function', () => {
    assert.throws(() =>
      jsv.addCompileStep('string', null), /compileStepFn must be a function/)
  })
})

describe('jsv.addAlias', () => {
  const jsv = new JsonSchemav()

  it('should successfully execute with an invalid alias name', () => {
    assert.throws(() =>
      jsv.addAlias('string', 123), /alias must be a string/)
  })

  it('should successfully execute with an unknow type', () => {
    assert.throws(() =>
      jsv.addAlias('xyz', 'integer'), /Unknown type 'xyz'/)
  })

  it('should successfully create an alias', () => {
    assert.doesNotThrow(() => jsv.addAlias('numeric', 'integer'))
  })

  it('should successfully create an alias from another alias', () => {
    assert.doesNotThrow(() => jsv.addAlias('number', 'integer'))
  })
})

describe('jsv.addType', () => {
  const jsv = new JsonSchemav()

  it('should successfully add new type', () => {
    assert.doesNotThrow(() =>
      jsv.addType('twitter', () => true))
  })

  it('should successfully execute with a non prototype object', () => {
    assert.throws(() =>
      jsv.addType('twitter', {}), /validateFn must be a function/)
  })
})

describe('jsv.removeType', () => {
  const jsv = new JsonSchemav()

  it('should successfully remove a type', () => {
    jsv.removeType('string')
    jsv.removeType('string')

    const schema = {
      type: 'string'
    }

    assert.throws(() =>
      jsv.validateSchema(schema), /Unknown type 'string'/)
  })
})

describe('jsv.addKeyword', () => {
  const jsv = new JsonSchemav()

  jsv.addType('twitter', (data) => {
    return data.value.split(/\s/).length === 1
  })

  it('should successfully add new keyword', (done) => {
    const validate = (value, data) => value === data

    assert.doesNotThrow(() => {
      jsv.addKeyword('twitter', 'account', validate)
      jsv.addKeyword('twitter', 'account', validate)
    })

    jsv.compile({ type: 'twitter' }).then((instance) => {
      assert.ok(instance.keywords.hasOwnProperty('account'),
        'instance\'s keywords should have a account entry')
      done()
    }).catch(done)
  })

  it('should successfully execute with a valid type name', () => {
    assert.throws(() =>
      jsv.addKeyword('xyz', null), /Unknown type 'xyz'/)
  })

  it('should successfully execute with a non validate function', () => {
    assert.throws(() =>
      jsv.addKeyword('twitter', null), /validateFn must be a function/)
  })

  it('should successfully validate with a new type validate', () => {
    const schema = {
      type: 'twitter',
      account: 'sebastien',
      default: 'sebastien',
      enum: [ 'ubuntu' ]
    }

    assert.doesNotThrow(() => jsv.validateSchema(schema))
  })

  it('should successfully execute with an invalid default data', (done) => {
    const schema = {
      type: 'twitter',
      account: 'sebastien',
      default: 'invalid value'
    }

    should.throw.with.defaultValue(jsv, schema, 'type', done)
  })
})

describe('jsv.removeKeyword', () => {
  const jsv = new JsonSchemav()

  jsv.addKeyword('string', 'equalsTo', (value, data) => data === value)

  it('should successfully remove a keyword', () => {
    jsv.removeKeyword('string', 'equalsTo')
    jsv.removeKeyword('string', 'equalsTo')
    jsv.removeKeyword('integer', 'keyword')

    const schema = {
      type: 'string',
      equalsTo: 'xyz',
      default: 'faild'
    }

    assert.doesNotThrow(() => jsv.validateSchema(schema))
  })

  it('should successfully execute with a non existing type', () => {
    assert.throws(() =>
      jsv.removeKeyword('unknow', 'x'), /Unknown type 'unknow'/)
  })
})

describe('jsv.compile', () => {
  const jsv = new JsonSchemav()

  jsv.addKeyword('string', 'equalsTo', (value, data) => data === value)

  it('should successfully remove a keyword', () => {
    jsv.removeKeyword('string', 'equalsTo')

    const schema = {
      type: 'string',
      equalsTo: 'xyz',
      default: 'faild'
    }

    assert.doesNotThrow(() => jsv.validateSchema(schema))
  })

  it('should successfully execute with a non existing type', () => {
    assert.throws(() =>
      jsv.removeKeyword('unknow', 'x'), /Unknown type 'unknow'/)
  })
})

describe('jsv.async', () => {
  const jsv = new JsonSchemav({ async: true })

  jsv.addType('twitter', function (data) {
    return new Promise((resolve, reject) => {
      if (/success/.test(data.value)) {
        return resolve()
      }

      reject(new Error('Already used'))
    })
  })

  const schema = { type: 'twitter' }

  jsv.compile(schema).then((instance) => {
    it('should successfully validate with an invalid data', (done) => {
      instance.validate('demsking')
        .then(() => done(new Error()))
        .catch((err) => {
          assert.equal(err.message, 'Already used')
          done()
        })
    })

    it('should successfully validate with a valid data', (done) => {
      instance.validate('success')
        .then(() => done())
        .catch(done)
    })
  })
})
