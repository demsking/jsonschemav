'use strict'

const assert = require('assert')
const expected = (data, expectedData) => new Error(`parsed data should equals to ${JSON.stringify(data)}, recieved ${JSON.stringify(expectedData)}`)

// assert.fail = ()
module.exports.should = {
  throw: {
    with: {
      data (data, jsv, schema, expectedKeyword, end, done, closing) {
        if (typeof done === 'boolean') {
          closing = done
          done = end
          end = undefined
        } else if (typeof done === 'undefined') {
          done = end
          end = undefined
        }

        const _schema = JSON.stringify(schema)

        jsv.compile(schema)
          .then((instance) => instance.validate(data))
          .then(() => {
            done(new Error(`should throw with ${JSON.stringify(data)}. Schema: ${_schema}`))
          }).catch((err) => {
            if (err.errors[0].keyword !== expectedKeyword) {
              return done(new Error(`should have a '${expectedKeyword}' expected keyword error with ${data}. Recieved: ${JSON.stringify(err.errors)}`))
            }
            if (typeof end === 'function') {
              end(err, done)
            }
          })

        if (closing !== false) {
          done()
        }
      },
      defaultValue (jsv, schema, expectedKeyword, done, closing) {
        const data = JSON.stringify(schema.default)
        const _schema = JSON.stringify(schema)

        jsv.compile(schema).then(() => {
          done(new Error(`should throw with ${data}. Schema: ${_schema}`))
        }).catch((err) => {
          if (err.errors[0].keyword !== expectedKeyword) {
            return done(new Error(`should have a '${expectedKeyword}' expected keyword error with ${data}. Recieved: ${JSON.stringify(err.errors)}`))
          }
        })

        if (closing !== false) {
          done()
        }
      },
      each (values, jsv, schema, done) {
        jsv.compile(schema).then((instance) => values.forEach((data) => {
          instance.validate(data)
            .then(() => {
              done(new Error(`should have an error with ${JSON.stringify(data)}`))
            })
            .catch((err) => {
              if (err.errors[0].keyword !== 'type') {
                return done(new Error(`should have a 'type' error with ${JSON.stringify(data)}`))
              }
            })
        }))

        done()
      }
    }
  },
  validate: {
    with: {
      data (data, jsv, schema, done, closing) {
        jsv.compile(schema)
          .then((instance) => instance.validate(data))
          .then(() => {
            if (closing !== false) {
              done()
            }
          }).catch((err) => {
            done(new Error(`should does not throw with ${data}. Recieved: ${JSON.stringify(err.errors)}`))
          })
      },
      defaultValue (jsv, schema, done, closing) {
        const data = JSON.stringify(schema.default)

        jsv.compile(schema).then(() => {
          if (closing !== false) {
            done()
          }
        }).catch((err) => {
          done(new Error(`should does not throw with ${data}. Recieved: ${JSON.stringify(err.errors)}`))
        })
      },
      each (values, jsv, schema, done) {
        const defaultData = schema.default

        jsv.compile(schema).then((instance) => values.forEach((data) =>
          instance.validate(data)
            .then((parsedData) => {
              if (data === undefined) {
                if (parsedData.constructor === {}.constructor) {
                  assert.deepStrictEqual(parsedData, defaultData)
                } else if (parsedData !== defaultData) {
                  done(expected(defaultData, parsedData))
                }
              } else {
                assert.deepStrictEqual(data, parsedData)
              }
            })
            .catch((err) => {
              done(new Error(`should validate with ${JSON.stringify(data)}. Errors: ${err.errors}`))
            })
        ))

        done()
      }
    }
  }
}
