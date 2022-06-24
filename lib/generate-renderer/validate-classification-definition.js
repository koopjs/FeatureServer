const joi = require('joi')

const classificationDefinitionSchema = joi.object({
  type: joi.string().valid('classBreaksDef', 'uniqueValueDef').error(new Error('invalid classification type')),
  baseSymbol: joi.object({
    type: joi.string().valid('esriSMS', 'esriSLS', 'esriSFS').required().error(new Error('baseSymbol requires a type'))
  }).optional().unknown()
}).unknown()

function validateClassificationDefinition (definition, geometryType, breaks) {
  validateDefinitionShape(definition)
  validateDefinitionSymbolAgainstGeometry(definition.baseSymbol, geometryType)
  validateUniqueValueFields(definition.uniqueValueFields, breaks)
}

function validateDefinitionShape (definition) {
  const { error } = classificationDefinitionSchema.validate(definition)

  if (error) {
    error.code = 400
    throw error
  }
}

function validateDefinitionSymbolAgainstGeometry (baseSymbol = {}, geometryType) {
  const { type: symbolType } = baseSymbol

  if (!symbolType) {
    return
  }

  if (symbolLookup(geometryType) !== symbolType) {
    const error = new Error('Classification defintion uses a base symbol that is incompatiable with dataset geometry')
    error.code = 400
    throw error
  }
}

function symbolLookup (geometryType) {
  switch (geometryType) {
    case 'esriGeometryPoint':
    case 'esriGeometryMultipoint':
      return 'esriSMS'
    case 'esriGeometryPolyline':
      return 'esriSLS'
    case 'esriGeometryPolygon':
      return 'esriSFS'
    default:
  }
}

function validateUniqueValueFields (uniqueValueFields, breaks) {
  if (!uniqueValueFields) {
    return
  }

  const breakFieldNames = Object.keys(breaks[0])

  if (uniqueValueFields.some(fieldName => !breakFieldNames.includes(fieldName))) {
    const error = new Error(`Unique value fields are incongruous: ${breakFieldNames} ${uniqueValueFields}`)
    error.code = 400
    throw error
  }
}

module.exports = validateClassificationDefinition
