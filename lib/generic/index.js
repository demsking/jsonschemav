'use strict'

module.exports.Base = require('./base')
module.exports.types = {}
module.exports.register = (type, prototype) => {
  this.types[type] = prototype
}

this.register('string', require('./string'))
this.register('numeric', require('./numeric'))
this.register('number', require('./numeric'))
this.register('integer', require('./integer'))
this.register('boolean', require('./boolean'))
this.register('object', require('./object'))
this.register('array', require('./array'))

// TODO implement keyword allOf
// TODO implement keyword anyOf
// TODO implement keyword anyOf
// TODO implement keyword not
// TODO implement keyword definitions
