const moment = require('moment')
const DATE_FORMATS = [moment.ISO_8601]

module.exports = { detectType }

/**
 * returns data type based on type of value passed
 *
 * @param {*} value - object to evaluate
 * @return {string} data type
 */
function detectType (value) {
  const type = typeof value

  if (type === 'number') {
    return Number.isInteger(value) ? 'Integer' : 'Double'
  } else if (type && moment(value, DATE_FORMATS, true).isValid()) {
    return 'Date'
  } else {
    return 'String'
  }
}
