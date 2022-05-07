const _ = require('lodash')
const {
  StatisticField,
  StatisticDateField,
  FieldFromFieldDefinition,
  FieldFromKeyValue
} = require('./field-classes')

class StatisticsFieldsBuilder {
  static normalizeOptions (inputOptions) {
    const {
      data: {
        statistics,
        features,
        metadata: {
          fields
        } = {}
      } = {},
      attributeSample,
      ...options
    } = inputOptions

    return {
      propertiesSample: getPropertiesSample({
        statistics: options.statistics || statistics,
        attributeSample,
        features
      }),
      fieldDefinitions: options.fieldDefinitions || options.fields || fields,
      ...options
    }
  }

  static create (inputOptions) {
    const options = StatisticsFieldsBuilder.normalizeOptions(inputOptions)
    return new StatisticsFieldsBuilder(options)
  }

  constructor (options = {}) {
    const {
      fieldDefinitions
    } = options
    const statisticFieldNames = getStatisticFieldsName(options.outStatistics)
    const dateFieldRegexs = getDateFieldRegexs(options.fieldDefinitions, options.outStatistics)

    return Object
      .entries(options.propertiesSample)
      .map(([key, value]) => {
        if (isDateField(dateFieldRegexs, key)) {
          return new StatisticDateField(key)
        }

        if (statisticFieldNames.includes(key)) {
          return new StatisticField(key)
        }

        const fieldDefinition = fieldDefinitions.find(({ name }) => name === key)

        if (fieldDefinition) {
          return new FieldFromFieldDefinition(fieldDefinition)
        }

        return new FieldFromKeyValue(key, value)
      })
  }
}

function isDateField (regexs, fieldName) {
  return regexs.some(regex => {
    return regex.test(fieldName)
  })
}

function getPropertiesSample ({ statistics, attributeSample, features }) {
  if (statistics) {
    return Array.isArray(statistics) ? statistics[0] : statistics
  }

  return attributeSample || _.get(features, '[0].properties') || _.get(features, '[0].attributes', {})
}

function getDateFieldRegexs (fieldDefinitions = [], outStatistics = []) {
  const dateFields = fieldDefinitions.filter(({ type }) => {
    return typeIsDate(type)
  })

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

function getStatisticFieldsName (outStatistics = []) {
  return outStatistics
    .map((statistic) => {
      const {
        onStatisticField,
        outStatisticFieldName
      } = statistic

      const name = outStatisticFieldName || onStatisticField
      return name.replace(/\s/g, '_')
    })
}

function typeIsDate (type) {
  if (!_.isString(type)) {
    return
  }
  return type.toLowerCase() === 'date' || type.toLowerCase() === 'esrifieldtypedate'
}

module.exports = StatisticsFieldsBuilder
