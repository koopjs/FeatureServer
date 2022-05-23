const {
  getEsriTypeFromDefinition,
  getEsriTypeFromValue
} = require('./esri-type-utils')

class Field {
  setEditable (value = false) {
    this.editable = value
    return this
  }

  setNullable (value = false) {
    this.nullable = value
    return this
  }

  setLength () {
    if (this.type === 'esriFieldTypeString') {
      this.length = 128
    } else if (this.type === 'esriFieldTypeDate') {
      this.length = 36
    }
  }
}

class ObjectIdField extends Field {
  constructor (key = 'OBJECTID') {
    super()
    this.name = key
    this.type = 'esriFieldTypeOID'
    this.alias = key
    this.sqlType = 'sqlTypeInteger'
    this.domain = null
    this.defaultValue = null
  }
}

class FieldFromKeyValue extends Field {
  constructor (key, value) {
    super()
    this.name = key
    this.type = getEsriTypeFromValue(value)
    this.alias = key
    this.sqlType = 'sqlTypeOther'
    this.domain = null
    this.defaultValue = null
    this.setLength()
  }
}

class StatisticField extends Field {
  constructor (key) {
    super()
    this.name = key
    this.type = 'esriFieldTypeDouble'
    this.sqlType = 'sqlTypeFloat'
    this.alias = key
    this.domain = null
    this.defaultValue = null
  }
}

class StatisticDateField extends StatisticField {
  constructor (key) {
    super(key)
    this.type = 'esriFieldTypeDate'
    this.sqlType = 'sqlTypeOther'
  }
}

class FieldFromFieldDefinition extends Field {
  constructor (fieldDefinition) {
    super()
    const {
      name,
      type,
      alias,
      domain,
      sqlType,
      length,
      defaultValue
    } = fieldDefinition

    this.name = name
    this.type = getEsriTypeFromDefinition(type)
    this.alias = alias || name
    this.sqlType = sqlType || 'sqlTypeOther'
    this.domain = domain || null
    this.defaultValue = defaultValue || null
    this.length = length

    if (!this.length || !Number.isInteger(this.length)) {
      this.setLength()
    }
  }
}

class ObjectIdFieldFromDefinition extends FieldFromFieldDefinition {
  constructor (definition = {}) {
    super(definition)
    this.type = 'esriFieldTypeOID'
    this.sqlType = 'sqlTypeInteger'
    delete this.length
  }
}

module.exports = {
  ObjectIdField,
  ObjectIdFieldFromDefinition,
  FieldFromKeyValue,
  FieldFromFieldDefinition,
  StatisticField,
  StatisticDateField
}
