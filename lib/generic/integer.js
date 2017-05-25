'use strict'

const GenericNumeric = require('./numeric')

class GenericInteger extends GenericNumeric {
  validate (data) {
    if (!Number.isInteger(data.value)) {
      return {
        keyword: 'type',
        message: 'data must be an integer'
      }
    }

    return true
  }
}

module.exports = GenericInteger
