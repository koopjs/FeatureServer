const { getDataTypeFromValue } = require('./data-type-utils')

function getEsriTypeFromDefinition (typeDefinition = '') {
  switch (typeDefinition.toLowerCase()) {
    case 'double':
      return 'esriFieldTypeDouble'
    case 'integer':
      return 'esriFieldTypeInteger'
    case 'date':
      return 'esriFieldTypeDate'
    case 'blob':
      return 'esriFieldTypeBlob'
    case 'geometry':
      return 'esriFieldTypeGeometry'
    case 'globalid':
      return 'esriFieldTypeGlobalID'
    case 'guid':
      return 'esriFieldTypeGUID'
    case 'raster':
      return 'esriFieldTypeRaster'
    case 'single':
      return 'esriFieldTypeSingle'
    case 'smallinteger':
      return 'esriFieldTypeSmallInteger'
    case 'xml':
      return 'esriFieldTypeXML'
    case 'string':
    default:
      return 'esriFieldTypeString'
  }
}

function getEsriTypeFromValue (value) {
  const dataType = getDataTypeFromValue(value)

  return getEsriTypeFromDefinition(dataType)
}

module.exports = {
  getEsriTypeFromDefinition,
  getEsriTypeFromValue
}
