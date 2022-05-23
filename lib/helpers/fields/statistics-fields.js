const _ = require('lodash')
const { isDate } = require('./data-type-utils')
const {
  StatisticField,
  StatisticDateField,
  FieldFromFieldDefinition,
  FieldFromKeyValue
} = require('./field-classes')

class StatisticsFields {
  static normalizeOptions (inputOptions) {
    const {
      statistics,
      metadata: {
        fields
      } = {},
      groupByFieldsForStatistics = [],
      attributeSample,
      ...options
    } = inputOptions

    return {
      statisticsSample: Array.isArray(statistics) ? statistics[0] : statistics,
      fieldDefinitions: options.fieldDefinitions || options.fields || fields,
      groupByFieldsForStatistics: Array.isArray(groupByFieldsForStatistics) ? groupByFieldsForStatistics : groupByFieldsForStatistics
        .replace(/\s*,\s*/g, ',')
        .replace(/^\s/, '')
        .replace(/\s*$/, '')
        .split(','),
      ...options
    }
  }

  static create (inputOptions) {
    const options = StatisticsFields.normalizeOptions(inputOptions)
    return new StatisticsFields(options)
  }

  constructor (options = {}) {
    const {
      statisticsSample,
      groupByFieldsForStatistics = [],
      fieldDefinitions = [],
      outStatistics
    } = options
    const dateFieldRegexs = getDateFieldRegexs(fieldDefinitions, outStatistics)

    return Object
      .entries(statisticsSample)
      .map(([key, value]) => {
        if (groupByFieldsForStatistics.includes(key)) {
          const fieldDefinition = fieldDefinitions.find(({ name }) => name === key)

          if (fieldDefinition) {
            return new FieldFromFieldDefinition(fieldDefinition)
          }

          return new FieldFromKeyValue(key, value)
        }

        if (isDateField(dateFieldRegexs, key, value)) {
          return new StatisticDateField(key)
        }

        return new StatisticField(key)
      })
  }
}

function isDateField (regexs, fieldName, value) {
  return regexs.some(regex => {
    return regex.test(fieldName)
  }) || isDate(value)
}

function getDateFieldRegexs (fieldDefinitions = [], outStatistics = []) {
  const dateFields = fieldDefinitions.filter(({ type }) => {
    return typeIsDate(type)
  }).map(({ name }) => name)

  return outStatistics
    .filter(({ onStatisticField }) => dateFields.includes(onStatisticField))
    .map((statistic) => {
      const {
        onStatisticField,
        outStatisticFieldName
      } = statistic

      const name = outStatisticFieldName || onStatisticField
      const spaceEscapedName = name.replace(/\s/g, '_')
      return new RegExp(`${spaceEscapedName}$`)
    })
}

function typeIsDate (type) {
  if (!_.isString(type)) {
    return
  }
  return type.toLowerCase() === 'date' || type.toLowerCase() === 'esrifieldtypedate'
}

module.exports = StatisticsFields
