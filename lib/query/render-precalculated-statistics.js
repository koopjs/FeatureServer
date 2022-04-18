const _ = require('lodash')
const { isValidISODateString, isValidDate } = require('iso-datestring-validator')
const {
  StatisticsFieldsBuilder
} = require('../helpers/fields')

function renderPrecalculatedStatisticsResponse (input, options) {
  const {
    statistics,
    metadata = {}
  } = input

  const normalizedStatistics = Array.isArray(statistics) ? statistics : [statistics]
  const fields = StatisticsFieldsBuilder.create(input, {
    ...metadata,
    ...options
  })

  return {
    fields,
    features: createStatisticFeatures(normalizedStatistics)
  }
}

function createStatisticFeatures (statistics) {
  return statistics.map(statistic => {
    return {
      attributes: convertDatePropertiesToTimestamps(statistic)
    }
  })
}

function convertDatePropertiesToTimestamps (obj) {
  return _.mapValues(obj, value => {
    if (isDate(value)) {
      return new Date(value).getTime()
    }
    return value
  })
}

function isDate (value) {
  return value instanceof Date || ((typeof value === 'string') && (isValidDate(value) || isValidISODateString(value)))
}

module.exports = { renderPrecalculatedStatisticsResponse }
