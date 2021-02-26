const _ = require('lodash')
const esriLookup = {
  Point: 'esriGeometryPoint',
  MultiPoint: 'esriGeometryMultipoint',
  LineString: 'esriGeometryPolyline',
  MultiLineString: 'esriGeometryPolyline',
  Polygon: 'esriGeometryPolygon',
  MultiPolygon: 'esriGeometryPolygon'
}

module.exports = function getGeometryTypeFromGeojson ({ geometryType, metadata, features } = {}) {
  const type = geometryType || metadata.geometryType || _.get(features, '[0].geometry.type')

  return esriLookup[type] || type
}
