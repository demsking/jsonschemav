'use strict'

module.exports = class ValidationError extends Error {
  constructor (message, errors) {
    if (typeof message !== 'string') {
      errors = message
      message = 'invalid data'
    }

    super(message)

    this.errors = Array.isArray(errors) ? errors : [ errors ]
  }
}
