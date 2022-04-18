const _ = require('lodash')
const FieldsBuilder = require('./fields-builder')
const {
  StatisticField,
  StatisticDateField,
  FieldFromFieldDefinition,
  FieldFromKeyValue
} = require('./field-classes')

class StatisticsFieldsBuilder extends FieldsBuilder {
  static create (data, options) {
    const {
      metadata: {
        fields
      } = {},
      ...rest
    } = data
    const builder = new StatisticsFieldsBuilder(rest, { ...options, fields })
    return builder.filterByOutfields().build()
  }

  constructor (data, options = {}) {
    super(data, options)
    this.statisticFieldNames = getStatisticFieldsName(options.outStatistics)
    this.statisticDateFieldRegexs = getDateFieldRegexs(this.fieldDefinitions, options.outStatistics)
  }

  build () {
    const fieldDefinitions = this.fieldDefinitions || []
    return Object.entries(this.propertiesSample)
      .map(([key, value]) => {
        if (this._isDateField(key)) {
          return new StatisticDateField(key)
        }

        if (this.statisticFieldNames.includes(key)) {
          return new StatisticField(key)
        }

        const fieldDefinition = fieldDefinitions.find(({ name }) => name === key)

        if (fieldDefinition) {
          return new FieldFromFieldDefinition(fieldDefinition)
        }

        return new FieldFromKeyValue(key, value)
      })
  }

  _isDateField (fieldName) {
    return this.statisticDateFieldRegexs.some(regex => {
      return regex.test(fieldName)
    })
  }
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
