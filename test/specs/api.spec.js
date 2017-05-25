'use strict'

const assert = require('assert')
const api = require('../../lib/api')

/* global describe it */

describe('instance.validateSchema', () => {
  const instance = api.instance()

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

describe('instance.addAlias', () => {
  const instance = api.instance()

  it('should successfully execute with an invalid alias name', () => {
    assert.throws(() =>
      instance.addAlias('string', 123), /alias must be a string/)
  })

  it('should successfully execute with an unknow type', () => {
    assert.throws(() =>
      instance.addAlias('xyz', 'integer'), /Unknown type 'xyz'/)
  })

  it('should successfully create an alias', () => {
    assert.doesNotThrow(() => instance.addAlias('numeric', 'integer'))
  })

  it('should successfully create an alias from another alias', () => {
    assert.doesNotThrow(() => instance.addAlias('number', 'integer'))
  })
})

describe('instance.addType', () => {
  const instance = api.instance()

  it('should successfully add new type', () => {
    assert.doesNotThrow(() =>
      instance.addType('twitter', () => true))
  })

  it('should successfully execute with a non prototype object', () => {
    assert.throws(() =>
      instance.addType('twitter', {}), /validator must be a function/)
  })
})

describe('instance.removeType', () => {
  const instance = api.instance()

  it('should successfully remove a type', () => {
    instance.removeType('string')

    const schema = {
      type: 'string'
    }

    assert.throws(() =>
      instance.validateSchema(schema), /Unknown type 'string'/)
  })
})

describe('instance.addKeyword', () => {
  const instance = api.instance()

  instance.addType('twitter', (data) => {
    return data.value.split(/\s/).length === 1
  })

  it('should successfully add new keyword', () => {
    const validator = (value, data) => value === data

    assert.doesNotThrow(() =>
      instance.addKeyword('twitter', 'account', validator))
  })

  it('should successfully execute with a valid type name', () => {
    assert.throws(() =>
      instance.addKeyword('xyz', null), /Unknown type 'xyz'/)
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

  it('should successfully execute with an invalid default data', () => {
    const schema = {
      type: 'twitter',
      account: 'sebastien',
      default: 'invalid value'
    }

    assert.throws(() =>
      instance.compile(schema), /Invalid default value "invalid value"/)
  })
})

describe('instance.removeKeyword', () => {
  const instance = api.instance()

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
      instance.removeKeyword('unknow', 'x'), /Unknown type 'unknow'/)
  })
})

describe('instance.compile', () => {
  const instance = api.instance()

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
      instance.removeKeyword('unknow', 'x'), /Unknown type 'unknow'/)
  })
})
