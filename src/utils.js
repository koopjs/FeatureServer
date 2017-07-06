const _ = require('lodash')
const moment = require('moment')
const esriExtent = require('esri-extent')
const geometryMap = require('./geometry-map')

module.exports = { isTable, getExtent, getGeomType, computeSpatialReference, computeExtent, createFieldAliases, createStatFields, createStatFeatures }

const defaultSR = { wkid: 4326 }
const mercatorSR = { wkid: 102100, latestWkid: 3857 }

/**
 * if we have no extent, but we do have features, then it should be Table
 *
 * @param {object} json
 * @param {object} data
 * @return {boolean}
 */
function isTable (json, data) {
  if (json.geometryType || (json.metadata && json.metadata.geometryType)) return false
  var noExtent = !json.fullExtent || !json.fullExtent.xmin || !json.fullExtent.ymin || json.fullExtent.xmin === Infinity
  var hasFeatures = data.features || data[0].features
  if (noExtent && !hasFeatures) return true
  else return false
}

function getExtent (geojson) {
  if (geojson.metadata && geojson.metadata.extent) return geojson.metadata.extent
  else return esriExtent(geojson)
}

const esriGeomTypes = {
  polygon: 'esriGeometryPolygon',
  linestring: 'esriGeometryPolyline',
  point: 'esriGeometryPoint'
}

function getGeomType (geojson = {}) {
  // TODO this should find the first non-null geometry
  if (geojson.metadata && geojson.metadata.geometryType) return geometryMap[geojson.metadata.geometryType]
  if (!geojson.features || !geojson.features[0]) return undefined
  const feature = geojson.features[0]
  if (!feature || !feature.geometry || !feature.geometry.type) return undefined
  const type = esriGeomTypes[feature.geometry.type.toLowerCase()]
  return type
}

function computeSpatialReference (sr) {
  if (!sr) return defaultSR
  else if (sr === 4326 || sr.wkid === 4326 || sr.latestWkid === 4326) return defaultSR
  else if (sr === 102100 || sr === 3857 || sr.wkid === 102100 || sr.latestWkid === 3857) return mercatorSR
  else if (typeof sr === 'number') return { wkid: sr }
  else {
    return {
      wkid: sr.wkid || sr.latestWkid,
      latestWkid: sr.latestWkid || sr.wkid
    }
  }
}

function computeExtent (input) {
  let coords
  if (input.xmin) return input
  if (Array.isArray(input)) {
    if (Array.isArray(input[0])) coords = input
    else coords = [[input[0], input[1]], [input[2], input[3]]]
  } else {
    throw new Error('invalid extent passed in metadata')
  }
  return {
    xmin: coords[0][0],
    ymin: coords[0][1],
    xmax: coords[1][0],
    ymax: coords[1][1],
    spatialReference: {
      wkid: 4326,
      latestWkid: 4326
    }
  }
}

function createFieldAliases (stats) {
  const fields = Object.keys(stats[0])
  return fields.reduce((aliases, field) => {
    aliases[field] = field
    return aliases
  }, {})
}

function createStatFields (stats) {
  return Object.keys(stats[0]).map(field => {
    const sample = _.find(stats, s => {
      return stats[field] !== null
    })
    const statField = {
      name: field,
      type: detectType(sample[field]),
      alias: field
    }
    if (statField.type === 'esriFieldTypeString') statField.length = 254
    return statField
  }, {})
}

function detectType (value) {
  if (!value) return null
  else if (moment(value, [moment.ISO_8601], true).isValid()) return 'esriFieldTypeDate'
  else if (typeof value === 'string') return 'esriFieldTypeString'
  else if (typeof value === 'number') return 'esriFieldTypeDouble'
}

function createStatFeatures (stats) {
  return stats.map(attributes => {
    const transformed = Object.keys(attributes).reduce((attrs, key) => {
      if (attributes[key] instanceof Date || moment(attributes[key], [moment.ISO_8601], true).isValid()) {
        attrs[key] = new Date(attributes[key]).getTime()
      } else {
        attrs[key] = attributes[key]
      }
      return attrs
    }, {})
    return { attributes: transformed }
  })
}
