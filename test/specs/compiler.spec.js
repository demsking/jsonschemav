'use strict'

const assert = require('assert')
const compiler = require('../../lib/compiler')

/* global describe it */

describe('api.validateSchema', () => {
  const instance = compiler.instance()

  it('should successfully validate non object schema', () => {
    const schema = 'non object schema'

    assert.throws(() =>
      instance.validateSchema(schema), /schema must be an object/)
  })

  it('should successfully validate a null schema', () => {
    const schema = null

    assert.throws(() =>
      instance.validateSchema(schema), /schema must be an object/)
  })

  it('should successfully validate schema with array type', () => {
    const schema = {
      type: ['string']
    }

    assert.throws(() =>
      instance.validateSchema(schema), /schema.type must be a string/)
  })
})

describe('api.addAlias', () => {
  const instance = compiler.instance()

  it('should successfully execute with an invalid alias name', () => {
    assert.throws(() =>
      instance.addAlias('string', 123), /alias must be a string/)
  })

  it('should successfully execute with an unknow type', () => {
    assert.throws(() =>
      instance.addAlias('xyz', 'integer'), /Unknow type 'xyz'/)
  })

  it('should successfully create an alias', () => {
    assert.doesNotThrow(() => instance.addAlias('numeric', 'integer'))
  })

  it('should successfully create an alias from another alias', () => {
    assert.doesNotThrow(() => instance.addAlias('number', 'integer'))
  })
})

describe('api.addType', () => {
  const instance = compiler.instance()

  it('should successfully add new type', () => {
    assert.doesNotThrow(() =>
      instance.addType('twitter'))
  })

  it('should successfully execute with a non prototype object', () => {
    assert.throws(() =>
      instance.addType('twitter', {}), /validator must be a function/)
  })
})

describe('api.removeType', () => {
  const instance = compiler.instance()

  it('should successfully remove a type', () => {
    instance.removeType('string')

    const schema = {
      type: 'string'
    }

    assert.throws(() =>
      instance.validateSchema(schema), /Unknow type 'string'/)
  })
})

describe('api.addKeyword', () => {
  const instance = compiler.instance()
  const validator = (value, data) => value === data

  instance.addType('twitter')

  it('should successfully add new keyword', () => {
    assert.doesNotThrow(() =>
      instance.addKeyword('twitter', 'account', validator))
  })

  it('should successfully execute with a valid type name', () => {
    assert.throws(() =>
      instance.addKeyword('xyz', null), /Unknow type 'xyz'/)
  })

  it('should successfully execute with a non validator function', () => {
    assert.throws(() =>
      instance.addKeyword('twitter', null), /validator must be a function/)
  })

  it('should successfully validate with a new type validator', () => {
    const schema = {
      type: 'twitter',
      account: 'sebastien',
      default: 'sebastien',
      enum: [ 'ubuntu' ]
    }

    assert.doesNotThrow(() => instance.validateSchema(schema))
  })

  it('should successfully execute with a null prototype', () => {
    const schema = {
      type: 'twitter',
      account: 'sebastien',
      default: 'invalid value'
    }

    assert.throws(() =>
      instance.validateSchema(schema), /Invalid default value "invalid value"/)
  })
})

describe('api.removeKeyword', () => {
  const instance = compiler.instance()

  instance.addKeyword('string', 'equalsTo', (value, data) => data === value)

  it('should successfully remove a keyword', () => {
    instance.removeKeyword('string', 'equalsTo')

    const schema = {
      type: 'string',
      equalsTo: 'xyz',
      default: 'faild'
    }

    assert.doesNotThrow(() => instance.validateSchema(schema))
  })

  it('should successfully execute with a non existing type', () => {
    assert.throws(() =>
      instance.removeKeyword('unknow', 'x'), /Unknow type 'unknow'/)
  })
})

describe('api.compile', () => {
  const instance = compiler.instance()

  instance.addKeyword('string', 'equalsTo', (value, data) => data === value)

  it('should successfully remove a keyword', () => {
    instance.removeKeyword('string', 'equalsTo')

    const schema = {
      type: 'string',
      equalsTo: 'xyz',
      default: 'faild'
    }

    assert.doesNotThrow(() => instance.validateSchema(schema))
  })

  it('should successfully execute with a non existing type', () => {
    assert.throws(() =>
      instance.removeKeyword('unknow', 'x'), /Unknow type 'unknow'/)
  })
})
