const _ = require('lodash')
const chalk = require('chalk')
const {
  ObjectIdField,
  FieldFromKeyValue,
  FieldFromFieldDefinition,
  ObjectIdFieldFromDefinition
} = require('./field-classes')

class QueryFieldsBuilder {
  static create (data, options) {
    const {
      metadata: {
        fields,
        idField
      } = {},
      ...rest
    } = data
    const builder = new QueryFieldsBuilder(rest, {
      ...options,
      idField: options.idField || idField,
      fields: options.fields || fields
    })
    return builder.filterByOutfields().build()
  }

  constructor (data, options = {}) {
    const {
      fields: fieldDefinitions,
      idField,
      attributeSample,
      outFields
    } = options

    if (shouldWarnAboutMissingIdFieldDefinition(idField, fieldDefinitions)) {
      console.warn(
        chalk.yellow(`WARNING: provider's "idField" is set to ${idField}, but this field is not found in field-definitions`)
      )
    }

    this.fieldDefinitions = fieldDefinitions
    this.idField = idField || 'OBJECTID'
    this.propertiesSample = getPropertiesSample(data, attributeSample)
    this.outFields = outFields
  }

  filterByOutfields () {
    if (!this.outFields || this.outFields === '*') {
      return this
    }

    this.outFieldNames = this.outFields.split(/\s*,\s*/)
    return this
  }

  build () {
    this.fields = this.fieldDefinitions
      ? setFieldsFromDefinitions(this.fieldDefinitions, this.idField)
      : setFieldsFromProperties(this.propertiesSample, this.idField)

    if (this.outFieldNames) {
      this.fields = this.fields.filter(field => {
        return this.outFieldNames.includes(field.name)
      })
    }

    return this.fields
  }
}

function setFieldsFromDefinitions (fieldDefinitions, idField) {
  const fields = fieldDefinitions
    .filter(fieldDefinition => fieldDefinition.name !== idField)
    .map(fieldDefinition => {
      return new FieldFromFieldDefinition(fieldDefinition)
    })

  const idFieldDefinition = getIdFieldDefinition(fieldDefinitions, idField)
  fields.unshift(new ObjectIdFieldFromDefinition(idFieldDefinition))
  return fields
}

function setFieldsFromProperties (propertiesSample, idField) {
  const fieldNames = Object.keys(propertiesSample)
  const simpleFieldNames = fieldNames.filter(name => name !== idField)

  const fields = simpleFieldNames.map((key) => {
    return new FieldFromKeyValue(key, propertiesSample[key])
  })

  fields.unshift(new ObjectIdField(idField))

  return fields
}

function getPropertiesSample (data, attributeSample) {
  const { statistics } = data

  if (statistics) {
    return Array.isArray(statistics) ? statistics[0] : statistics
  }

  return attributeSample || _.get(data, 'features[0].properties') || _.get(data, 'features[0].attributes', {})
}

function getIdFieldDefinition (fieldDefinitions, idField) {
  const idFieldDefinition = fieldDefinitions.find(definition => {
    return definition.name === idField
  })

  if (idFieldDefinition) {
    return idFieldDefinition
  }

  return { name: 'OBJECTID' }
}

function shouldWarnAboutMissingIdFieldDefinition (idField, fieldDefinitions) {
  if (!idField || !fieldDefinitions) {
    return
  }

  const fieldNames = fieldDefinitions.map(field => field.name)

  return !fieldNames.includes(idField)
}

module.exports = QueryFieldsBuilder
