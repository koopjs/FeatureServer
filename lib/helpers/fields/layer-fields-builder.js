const FieldsBuilder = require('./fields-builder')

class LayerFieldsBuilder extends FieldsBuilder {
  static create (inputOptions) {
    const options = FieldsBuilder.normalizeOptions(inputOptions)
    return new LayerFieldsBuilder(options)
  }

  constructor (options) {
    super(options)

    return this.fields.map(field => {
      field.setEditable().setNullable()
      return field
    })
  }
}

module.exports = LayerFieldsBuilder
