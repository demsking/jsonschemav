'use strict'

const utils = require('../utils')
const Base = require('./base').Base

const re = {
  email: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
  hostname: /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/,
  ipv4: /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/,
  ipv6: /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9-]*[A-Za-z0-9])$|^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/,
  uri: /([[a-z]+]:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/
}

class GenericString extends Base {
  constructor (schema, _generic) {
    super(schema, _generic)

    this.keywords = {
      required (value, data) {
        if (value === true) {
          return typeof data.value !== 'undefined' && data.value !== null
        }
        return true
      },
      enum (value, data) {
        return value.indexOf(data.value) !== -1
      },
      format (value, data) {
        switch (value) {
          /**
          * RFC 3339, section 5.6
          * @see https://tools.ietf.org/html/rfc3339#section-5.6
          */
          case 'date':
          case 'date-time':
            return !isNaN(Date.parse(data.value))

          /**
          * RFC 5322, section 3.4.1
          * @see https://tools.ietf.org/html/rfc5322#section-3.4.1
          */
          case 'email':
            return re.email.test(data.value)

          /**
          * RFC 1034, section 3.1
          * @see https://tools.ietf.org/html/rfc1034#section-3.1
          */
          case 'hostname':
            return re.hostname.test(data.value)

          /**
          * RFC 2673, section 3.2
          * @see https://tools.ietf.org/html/rfc2673#section-3.2
          */
          case 'ipv4':
            return re.ipv4.test(data.value)

          /**
          * RFC 2373, section 2.2
          * @see https://tools.ietf.org/html/rfc2373#section-2.2
          */
          case 'ipv6':
            return re.ipv6.test(data.value)

          /**
          * RFC3986
          * @see https://tools.ietf.org/html/rfc3986
          */
          case 'uri':
          case 'url':
          case 'uriref':
            return re.uri.test(data.value)

          default:
            throw new Error(`Unknow format '${value}'`)
        }
      },
      maxLength (value, data) {
        if (data.value === null) {
          return true
        }

        if (data.value.length > value) {
          return {
            size: data.value.length,
            maxLength: value,
            message: `too many characters. must be less than, or equal to, ${value}`
          }
        }

        return true
      },
      minLength (value, data) {
        if (data.value === null) {
          return true
        }

        if (data.value.length < value) {
          return {
            size: data.value.length,
            minLength: value,
            message: `not enough characters. must be greater than, or equal to, ${value}`
          }
        }

        return true
      },
      pattern (value, data) {
        return new RegExp(value).test(data.value)
      }
    }
  }

  static validateSchema (schema, generic) {
    if (schema.hasOwnProperty('enum')) {
      utils.validateUniqueArray(schema.enum, generic, 'enum', 'string')
    }

    if (schema.hasOwnProperty('maxLength')) {
      if (typeof schema.maxLength !== 'number' || schema.maxLength !== parseInt(schema.maxLength, 10)) {
        throw new Error('maxLength must be an integer')
      }

      if (schema.maxLength < 0) {
        throw new Error('maxLength must be greater than, or equal to, 0')
      }
    }

    if (schema.hasOwnProperty('minLength')) {
      if (typeof schema.minLength !== 'number' || schema.minLength !== parseInt(schema.minLength, 10)) {
        throw new Error('minLength must be an integer')
      }

      if (schema.minLength < 0) {
        throw new Error('minLength must be greater than, or equal to, 0')
      }
    }

    if (schema.hasOwnProperty('pattern')) {
      if (typeof schema.pattern !== 'string') {
        throw new Error('pattern must be a string')
      }

      // SHOULD be a valid regular expression, according to the ECMA 262 regular expression dialect
      this.__re = new RegExp(schema.pattern) // this.__re is just to avoid lint error
    }
  }

  validate (data) {
    return data.value === null || typeof data.value === 'string'
  }
}

module.exports = GenericString
