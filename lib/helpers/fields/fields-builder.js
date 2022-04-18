const _ = require('lodash')
const chalk = require('chalk')
const {
  ObjectIdField,
  FieldFromKeyValue,
  FieldFromFieldDefinition,
  ObjectIdFieldFromDefinition
} = require('./field-classes')

class FieldsBuilder {
  static create (data, options) {
    const {
      metadata: {
        fields,
        idField
      } = {},
      ...rest
    } = data
    const builder = new FieldsBuilder(rest, {
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

    this.fieldDefinitions = fieldDefinitions
    // Warn on missing idField from props or definitions
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
    this.fieldDefinitions ? this._setFieldsFromDefinitions() : this._setFieldsFromProperties()

    if (this.outFieldNames) {
      this.fields = this.fields.filter(field => {
        return this.outFieldNames.includes(field.name)
      })
    }

    return this.fields
  }

  _setFieldsFromDefinitions (fieldDefinitions, idField) {
    this.fields = this.fieldDefinitions
      .filter(fieldDefinition => fieldDefinition.name !== this.idField)
      .map(fieldDefinition => {
        return new FieldFromFieldDefinition(fieldDefinition)
      })

    const idFieldDefinition = getIdFieldDefinition(this.fieldDefinitions, this.idField)

    this.fields.unshift(new ObjectIdFieldFromDefinition(idFieldDefinition))
  }

  _setFieldsFromProperties () {
    const fieldNames = Object.keys(this.propertiesSample)
    const simpleFieldNames = fieldNames.filter(name => name !== this.idField)

    this.fields = simpleFieldNames.map((key) => {
      return new FieldFromKeyValue(key, this.propertiesSample[key])
    })

    this.fields.unshift(new ObjectIdField(this.idField))
  }
}

function getPropertiesSample (data, attributeSample) {
  const { statistics } = data
  if (statistics) {
    return Array.isArray(statistics) ? statistics[0] : statistics
  }

  return attributeSample || _.get(data, 'features[0].properties', {})
}

function getIdFieldDefinition (fieldDefinitions, idField) {
  const idFieldDefinition = fieldDefinitions.find(definition => {
    return definition.name === idField
  })

  if (idFieldDefinition) {
    return idFieldDefinition
  }

  if (idField && fieldDefinitions && !idFieldDefinition) {
    console.warn(
      chalk.yellow(`WARNING: provider's "idField" is set to ${idField}, but this field is not found in field-definitions`)
    )
  }

  return { name: 'OBJECTID' }
}

module.exports = FieldsBuilder
