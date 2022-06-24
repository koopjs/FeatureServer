const {
  createClassBreakInfos,
  createUniqueValueInfos
} = require('./createClassificationInfos')
const Winnow = require('winnow')
const { getGeometryTypeFromGeojson } = require('../helpers')
const validateClassificationDefinition = require('./validate-classification-definition')
const VALID_GEOMETRY_TYPES = ['esriGeometryMultiPoint', 'esriGeometryPoint', 'esriGeometryLine', 'esriGeometryPolygon']

module.exports = generateRenderer

function generateRenderer (data = {}, params = {}) {
  const {
    statistics = {},
    features
  } = data

  if (statistics.classBreaks) {
    const breaks = statistics.classBreaks.sort((a, b) => a - b)
    return renderClassBreaks(breaks, {}, '')
  }

  if (features) {
    return generateRendererFromFeatures(data, params)
  }

  return {}
}

function generateRendererFromFeatures (data, params) {
  const { classificationDef = {} } = params
  const geometryType = getGeometryTypeFromGeojson(data)

  // TODO: this seems weird; the winnow method is "query" but it's really a very specialized aggregation
  // consider changes to winnow - this should maybe be a different method
  const breaks = Winnow.query(data, params)
  validateGeometryType(geometryType)
  validateClassificationDefinition(classificationDef, geometryType, breaks)

  if (classificationDef.type === 'classBreaksDef') {
    return renderClassBreaks(breaks, classificationDef, geometryType)
  }

  if (classificationDef.type === 'uniqueValueDef') {
    return renderUniqueValue(breaks, classificationDef, geometryType)
  }

  throw new Error('invalid classification type: ', classificationDef.type)
}

function renderClassBreaks (breaks, classificationDef, geomType) {
  if (!Array.isArray(breaks) || !Array.isArray(breaks[0])) {
    throw new Error('Breaks must be an array of break ranges')
  }

  return {
    type: 'classBreaks',
    field: classificationDef.classificationField || '',
    classificationMethod: classificationDef.classificationMethod || '',
    minValue: breaks[0][0],
    classBreakInfos: createClassBreakInfos(breaks, classificationDef, geomType)
  }
}

function renderUniqueValue (breaks, classificationDef, geomType) {
  return {
    type: 'uniqueValue',
    field1: classificationDef.uniqueValueFields[0],
    field2: '',
    field3: '',
    fieldDelimiter: classificationDef.fieldDelimiter,
    defaultSymbol: {},
    defaultLabel: '',
    uniqueValueInfos: createUniqueValueInfos(breaks, classificationDef, geomType)
  }
}

function validateGeometryType (geometryType) {
  if (!VALID_GEOMETRY_TYPES.includes(geometryType)) {
    const error = new Error('Dataset geometry type is not supported for renderers.')
    error.code = 400
    throw error
  }
}
