'use strict'

const ValidationError = require('../error')

const globalKeywords = {
  default (value, data) {
    if (typeof data.value === 'undefined') {
      data.value = value
    }

    return true
  },
  required (value, data) {
    if (value === true) {
      return typeof data.value !== 'undefined'
    }
    return true
  }
}

const toPromise = (self, keyword, data) => {
  const result = keyword.validate.apply(self, [ keyword.value, data ])

  if (result === true) {
    return Promise.resolve(data.value)
  }

  if (result === false) {
    return Promise.reject(new ValidationError({
      keyword: keyword.name,
      message: 'invalid data' }))
  }

  if (result instanceof Promise) {
    return result.then(() => data.value).catch((err) => {
      throw new ValidationError(Object.assign(err.props || {}, {
        keyword: keyword.name, errors: err.errors }))
    })
  }

  return Promise.reject(new ValidationError(
    Object.assign({ keyword: keyword.name }, result)))
}

const excludedKeywords = ['type', 'default']
const globalCompileSteps = function () {
  const promisedKeywords = Object.keys(this.schema)
    .filter((item) => !excludedKeywords.includes(item) &&
      this._keywords.hasOwnProperty(item))
    .map((keyword) => ({
      name: keyword,
      value: this.schema[keyword],
      validate: this._keywords[keyword] }))
    .map((keyword) => (data) => toPromise(this, keyword, data))

  Object.defineProperty(this, '_promisedKeywords', { value: promisedKeywords })
}

const validateKeywords = (_promises, data) =>
  Promise.all(_promises.map((fn) => fn(data)))
    .then(() => data.value)
    .catch((err) => {
      return err instanceof Error ? err : new ValidationError(err)
    })

const validate = function (data) {
  data = { value: data }

  if (this.schema.hasOwnProperty('default')) {
    if (this._keywords.hasOwnProperty('default')) {
      this._keywords.default.apply(this, [this.schema.default, data])
    }
  }

  const result = this._validate(data)

  if (result === false) {
    return Promise.reject(new ValidationError({
      keyword: 'type',
      message: 'invalid type'
    }))
  }

  if (result instanceof Promise) {
    return result.then(validateKeywords(this._promisedKeywords, data))
  }

  if (result !== true) {
    return Promise.reject(new ValidationError(result))
  }

  return validateKeywords(this._promisedKeywords, data).then((result) => {
    if (result instanceof Error) {
      throw result
    }
    return result
  })
}

module.exports = class Base {
  constructor (schema, options, keywords) {
    const compileSteps = options.compileSteps[schema.type] || []

    Object.defineProperty(this, '_schema', { value: schema })
    Object.defineProperty(this, '_options', { value: options || {} })
    Object.defineProperty(this, '_keywords', { value: {} })
    Object.defineProperty(this, '_validate', { value: this.validate })
    Object.defineProperty(this, '_compileSteps', { value: compileSteps })

    this.keywords = globalKeywords

    if (typeof keywords === 'object') {
      this.keywords = keywords
    }

    if (options.keywords.hasOwnProperty(schema.type)) {
      this.keywords = options.keywords[schema.type]
    }

    this.validate = validate
  }

  validateDefaultValue () {
    return this.validate(this.schema.default)
  }

  setDefaultValue (value, data) {
    globalKeywords.default(value, data)
  }

  compile () {
    this._compileSteps.concat([globalCompileSteps])
      .forEach((fn) => fn.apply(this))

    if (this.schema.hasOwnProperty('default')) {
      const result = this.validateDefaultValue()

      if (result instanceof Promise) {
        return result.then((err) => {
          if (err instanceof Error) {
            throw err
          }
          return this
        })
      }
    }

    return Promise.resolve(this)
  }

  get options () {
    return this._options
  }

  get compileSteps () {
    return this._compileSteps
  }

  get generic () {
    return this._options.generic
  }

  get schema () {
    return this._schema
  }

  get keywords () {
    return this._keywords
  }

  set keywords (values) {
    for (let name in values) {
      this._keywords[name] = values[name]
    }
  }
}
