const moment = require('moment')
const DATE_FORMATS = [moment.ISO_8601]

/**
 * returns data type based on type of value passed
 *
 * @param {*} value - object to evaluate
 * @return {string} data type
 */
function detectType (value) {
  var type = typeof value

  if (type === 'number') {
    return Number.isInteger(value) ? 'Integer' : 'Double'
  } else if (type && moment(value, DATE_FORMATS, true).isValid()) {
    return 'Date'
  } else {
    return 'String'
  }
}

/**
 * returns converts type to ESRI field type
 * @param {string} type string representation of data type
 * @return {string} string representation of ESRI data type
 */
function esriTypeMap (type) {
  switch (type.toLowerCase()) {
    case 'double':
      return 'esriFieldTypeDouble'
    case 'integer':
      return 'esriFieldTypeInteger'
    case 'date':
      return 'esriFieldTypeDate'
    default:
      return 'esriFieldTypeString'
  }
}

module.exports = { detectType, esriTypeMap }
