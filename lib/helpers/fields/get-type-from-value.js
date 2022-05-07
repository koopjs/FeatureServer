const {
  isValidISODateString,
  isValidDate
} = require('iso-datestring-validator')
const getTypeFromDefinition = require('./get-type-from-definition')

function getTypeFromValue (value) {
  const simpleType = getSimpleType(value)

  return getTypeFromDefinition(simpleType)
}

function getSimpleType (value) {
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'Integer' : 'Double'
  }

  if (isDate(value)) {
    return 'Date'
  }

  return 'String'
}

function isDate (value) {
  return value instanceof Date || ((typeof value === 'string') && (isValidDate(value) || isValidISODateString(value)))
}

module.exports = getTypeFromValue
