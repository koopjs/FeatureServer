const FieldsBuilder = require('./fields-builder')

class QueryFieldsBuilder extends FieldsBuilder {
  static create (inputOptions = {}) {
    const options = FieldsBuilder.normalizeOptions(inputOptions)
    return new QueryFieldsBuilder(options)
  }

  constructor (options = {}) {
    super(options)

    const {
      outFields
    } = options

    if (outFields && outFields !== '*') {
      return filterByOutfields(outFields, this.fields)
    }

    return this.fields
  }
}

function filterByOutfields (outFields, fields) {
  const outFieldNames = outFields.split(/\s*,\s*/)
  return fields.filter(field => {
    return outFieldNames.includes(field.name)
  })
}

module.exports = QueryFieldsBuilder
