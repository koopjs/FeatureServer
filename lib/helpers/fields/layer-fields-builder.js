const FieldsBuilder = require('./fields-builder')

class LayerFieldsBuilder extends FieldsBuilder {
  static create (data, options) {
    const builder = new LayerFieldsBuilder(data, options)
    return builder.filterByOutfields().build()
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
