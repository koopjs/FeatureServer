const _ = require('lodash')
const chalk = require('chalk')
const {
  ObjectIdField,
  FieldFromKeyValue,
  FieldFromFieldDefinition,
  ObjectIdFieldFromDefinition
} = require('./field-classes')

class FieldsBuilder {
  static normalizeOptions (inputOptions) {
    const {
      features,
      metadata: {
        fields,
        idField
      } = {},
      attributeSample,
      ...options
    } = inputOptions

    return {
      idField: options.idField || idField,
      fieldDefinitions: options.fieldDefinitions || options.fields || fields,
      propertiesSample: getPropertiesSample(features, attributeSample),
      ...options
    }
  }

  constructor (options = {}) {
    const {
      fieldDefinitions,
      idField,
      propertiesSample
    } = options

    if (shouldWarnAboutMissingIdFieldDefinition(idField, fieldDefinitions)) {
      console.warn(
        chalk.yellow(`WARNING: provider's "idField" is set to ${idField}, but this field is not found in field-definitions`)
      )
    }

    this.fieldDefinitions = fieldDefinitions
    this.idField = idField || 'OBJECTID'
    this.propertiesSample = propertiesSample

    this.fields = this.fieldDefinitions
      ? setFieldsFromDefinitions(this.fieldDefinitions, this.idField)
      : setFieldsFromProperties(this.propertiesSample, this.idField)
  }
}

function getPropertiesSample (features, attributeSample) {
  return attributeSample || _.get(features, '[0].properties') || _.get(features, '[0].attributes', {})
}

function shouldWarnAboutMissingIdFieldDefinition (idField, fieldDefinitions) {
  if (!idField || !fieldDefinitions) {
    return
  }

  const fieldNames = fieldDefinitions.map(field => field.name)

  return !fieldNames.includes(idField)
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

function getIdFieldDefinition (fieldDefinitions, idField) {
  const idFieldDefinition = fieldDefinitions.find(definition => {
    return definition.name === idField
  })

  if (idFieldDefinition) {
    return idFieldDefinition
  }

  return { name: 'OBJECTID' }
}

module.exports = FieldsBuilder
