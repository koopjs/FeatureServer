const _ = require('lodash')
const { isValidISODateString, isValidDate } = require('iso-datestring-validator')
const { computeFieldObject } = require('../field')

function renderPrecalulatedStatisticsResponse (input, options = {}) {
  const {
    statistics,
    metadata
  } = input

  const normalizedStatistics = Array.isArray(statistics) ? statistics : [statistics]
  const fields = metadata ? computeFieldObject(input) : createFieldDefinitions(normalizedStatistics)
  const fieldAliases = _.chain(fields).map(field => field.name).keyBy(key => key).value()

  return {
    displayFieldName: '',
    fieldAliases,
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

function createFieldDefinitions (statisticRecords) {
  return _.chain(statisticRecords)
    .map(Object.entries)
    .flatten()
    .uniqBy(([key]) => {
      return key
    })
    .map(([key, value]) => {
      const type = detectType(value)
      return {
        name: key,
        type,
        alias: key,
        length: type === 'esriFieldTypeString' ? 254 : undefined
      }
    })
    .value()
}

function detectType (value) {
  if (isDate(value)) {
    return 'esriFieldTypeDate'
  }

  if (typeof value === 'string') {
    return 'esriFieldTypeString'
  }

  if (typeof value === 'number') {
    return 'esriFieldTypeDouble'
  }

  return null
}

function isDate (value) {
  return value instanceof Date || ((typeof value === 'string') && (isValidDate(value) || isValidISODateString(value)))
}

module.exports = { renderPrecalulatedStatisticsResponse }
