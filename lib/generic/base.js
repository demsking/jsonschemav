'use strict'

const globalKeywords = {
  required (value, data) {
    if (value === true) {
      return typeof data.value !== 'undefined'
    }
    return true
  }
}

class Base {
  constructor (schema, _generic) {
    this.schema = schema
    this._generic = _generic || {}
    this._keywords = {}

    this._validate = this.validate
    this.validate = function (data, defaultValue) {
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

      data = { value: data }

      let result = this._validate(data)

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

      let errors = []
      const exclude = [ 'type', 'default' ]
      const filterSchemaKeywords = (item) =>
        exclude.indexOf(item) === -1 && this._keywords.hasOwnProperty(item)

      const validateKeyword = (entry) => {
        const keyword = entry.keyword
        const value = entry.value
        const validate = entry.validate

        result = validate.apply(this, [ value, data ])

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

      if (errors.length === 0) {
        return true
      }

      return errors
    }
  }

  get generic () {
    return this._generic
  }

  compile () {
    this.validateDefaultValue()
  }

  validateDefaultValue () {
    if (this.schema.hasOwnProperty('default')) {
      const result = this.validate(this.schema.default, this.schema.default)

      if (result !== true) {
        const value = JSON.stringify(this.schema.default)
        const message = `Invalid default value ${value}`

        throw new ValidationError(message, result)
      }
    }
  }

  set keywords (keywords) {
    for (let name in keywords) {
      this._keywords[name] = keywords[name]
    }
  }
}

class ValidationError extends Error {
  constructor (message, errors) {
    super(message)
    this.errors = errors
  }
}

module.exports.Base = Base
module.exports.ValidationError = ValidationError
