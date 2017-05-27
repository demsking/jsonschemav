'use strict'

const ValidationError = require('../error')

const globalKeywords = {
  required (value, data) {
    if (value === true) {
      return typeof data.value !== 'undefined'
    }
    return true
  }
}

const parseData = function (data, defaultValue) {
  // default value
  if (typeof defaultValue === 'undefined') {
    if (this.schema.hasOwnProperty('default')) {
      defaultValue = this.schema.default
    }
  }

  if (typeof defaultValue !== 'undefined') {
    if (typeof data === 'undefined') {
      data = defaultValue
    }
  }

  return { value: data }
}

const validateKeywords = function (data) {
  const errors = []
  const exclude = [ 'type', 'default' ]
  const filterSchemaKeywords = (item) =>
    exclude.indexOf(item) === -1 && this._keywords.hasOwnProperty(item)

  const validateKeyword = (entry) => {
    const keyword = entry.keyword
    const value = entry.value
    const validate = entry.validate
    const result = validate.apply(this, [ value, data ])

    if (result === true) {
      return
    }

    if (result === false) {
      return errors.push({ keyword, message: 'invalid input data' })
    }

    if (result instanceof Array) {
      return errors.push({ keyword, errors: result })
    }

    errors.push(Object.assign({ keyword }, result))
  }

  Object.keys(globalKeywords)
    .filter((keyword) => this.schema.hasOwnProperty(keyword))
    .map((keyword) => ({
      keyword: keyword,
      value: this.schema[keyword],
      validate: globalKeywords[keyword] }))
    .forEach(validateKeyword)

  Object.keys(this.schema)
    .filter(filterSchemaKeywords)
    .map((keyword) => ({
      keyword: keyword,
      value: this.schema[keyword],
      validate: this._keywords[keyword] }))
    .forEach(validateKeyword)

  return errors
}

const async = function () {
  this.validate = function (data, defaultValue) {
    data = parseData.apply(this, [ data, defaultValue ])

    const result = this._validate(data)

    if (result === false) {
      return new Promise((resolve, reject) => {
        const message = 'Invalid type input'
        const report = { keyword: 'type' }

        reject(new ValidationError(message, report))
      })
    }

    const next = (resolve, reject) => {
      const errors = validateKeywords.apply(this, [ data ])

      if (errors.length === 0) {
        if (typeof resolve === 'function') {
          return resolve(true)
        }

        return true
      }

      return reject(errors)
    }

    if (result instanceof Promise) {
      return result.then(next)
    } else if (result !== true) {
      return new Promise((resolve, reject) => {
        reject(new ValidationError('Invalid type input', result))
      })
    }

    return new Promise(next)
  }
}

const precompile = function () {
  this.validate = function (data, defaultValue) {
    data = parseData.apply(this, [ data, defaultValue ])

    const result = this._validate(data)

    if (result === false) {
      return [{
        keyword: 'type',
        message: 'invalid type input'
      }]
    }

    if (result !== true) {
      if (!Array.isArray(result)) {
        return [ result ]
      }

      return result
    }

    const errors = validateKeywords.apply(this, [ data ])

    if (errors.length === 0) {
      return true
    }

    return errors
  }
}

module.exports = class Base {
  constructor (schema, options) {
    const keywords = options.keywords[schema.type] || {}

    Object.defineProperty(this, '_schema', { value: schema })
    Object.defineProperty(this, '_options', { value: options || {} })
    Object.defineProperty(this, '_keywords', { value: keywords })
    Object.defineProperty(this, '_validate', { value: this.validate })

    if (this._options.async) {
      async.apply(this)
    } else {
      precompile.apply(this)
    }
  }

  compile () {
    if (this.schema.hasOwnProperty('default')) {
      const result = this.validate(this.schema.default, this.schema.default)

      if (this._options.async) {
        return result
      }

      if (result !== true) {
        const value = JSON.stringify(this.schema.default)
        const message = `Invalid default value ${value}`

        throw new ValidationError(message, result)
      }

      return result
    }

    if (this._options.async) {
      return new Promise((resolve) => resolve(this))
    }
  }

  get options () {
    return this._options
  }

  get generic () {
    return this._options.generic
  }

  get schema () {
    return this._schema
  }

  get keywords () {
    return Object.assign({}, globalKeywords, this._keywords)
  }

  set keywords (keywords) {
    for (let name in keywords) {
      this._keywords[name] = keywords[name]
    }
  }
}
