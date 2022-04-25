const QueryFieldsBuilder = require('./query-fields-builder')

class LayerFieldsBuilder extends QueryFieldsBuilder {
  static create (data, options) {
    const builder = new LayerFieldsBuilder(data, options)
    return builder.build()
  }

  build () {
    super.build()

    this.fields = this.fields.map(field => {
      field.setEditable().setNullable()
      return field
    })

    return this.fields
  }
}

module.exports = LayerFieldsBuilder
