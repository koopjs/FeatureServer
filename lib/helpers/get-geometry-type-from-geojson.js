const _ = require('lodash')
const debug = process.env.KOOP_LOG_LEVEL === 'debug' || process.env.LOG_LEVEL === 'debug'

const esriLookup = {
  Point: 'esriGeometryPoint',
  MultiPoint: 'esriGeometryMultipoint',
  LineString: 'esriGeometryPolyline',
  MultiLineString: 'esriGeometryPolyline',
  Polygon: 'esriGeometryPolygon',
  MultiPolygon: 'esriGeometryPolygon',
  esriGeometryPoint: 'esriGeometryPoint',
  esriGeometryMultipoint: 'esriGeometryMultipoint',
  esriGeometryPolyline: 'esriGeometryPolyline',
  esriGeometryPolygon: 'esriGeometryPolygon'
}

module.exports = function getGeometryTypeFromGeojson ({ geometryType, metadata = {}, features } = {}) {
  const type = geometryType || metadata.geometryType || _.get(features, '[0].geometry.type')

  if (!type && debug) {
    console.log(`Input JSON has unsupported geometryType: ${type}`)
  }
  return esriLookup[type]
}
