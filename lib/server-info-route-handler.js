const _ = require('lodash')
const { calculateBounds } = require('@terraformer/spatial')
const {
  getCollectionCrs,
  getGeometryTypeFromGeojson,
  normalizeExtent,
  normalizeSpatialReference
} = require('./helpers')
const { serverMetadata: serverMetadataDefaults } = require('./defaults')
const debug = process.env.KOOP_LOG_LEVEL === 'debug' || process.env.LOG_LEVEL === 'debug'

function serverMetadata (json, { query = {} } = {}) {
  const { metadata, ...rest } = json
  const { maxRecordCount, hasStaticData, description } = { ...metadata, ...rest }
  const spatialReference = getSpatialReference(json, query)
  const fullExtent = getServiceExtent(json, spatialReference)
  const { layers, tables } = transformLayersMetadataToServerMetadata(json)

  // TODO reproject default extents when non WGS84 CRS is found or passed

  return _.defaults({
    spatialReference,
    fullExtent,
    initialExtent: fullExtent,
    layers,
    tables,
    serviceDescription: description,
    maxRecordCount: maxRecordCount || _.get(layers, '[0].metadata.maxRecordCount'),
    hasStaticData: typeof hasStaticData === 'boolean' ? hasStaticData : false
  }, serverMetadataDefaults)
}

function getServiceExtent (data = {}, spatialReference = { latestWkid: 4326 }) {
  const { extent, metadata = {} } = data
  if (extent || metadata.extent) return normalizeExtent(extent || metadata.extent, spatialReference)
  return calculateServiceExtentFromLayers(data, spatialReference)
}

function calculateServiceExtentFromLayers (data, spatialReference) {
  try {
    const layers = normalizeLayersInput(data)

    if (layers.length === 0) {
      return
    }

    const layerBounds = layers.filter(layer => {
      return _.has(layer, 'features[0]')
    }).map(calculateBounds)

    if (layerBounds.length === 0) return

    const { xmins, xmaxs, ymins, ymaxs } = layerBounds.reduce((accumulator, bounds) => {
      const [xmin, ymin, xmax, ymax] = bounds
      accumulator.xmins.push(xmin)
      accumulator.xmaxs.push(xmax)
      accumulator.ymins.push(ymin)
      accumulator.ymaxs.push(ymax)
      return accumulator
    }, { xmins: [], xmaxs: [], ymins: [], ymaxs: [] })

    return {
      xmin: Math.min(...xmins),
      xmax: Math.max(...xmaxs),
      ymin: Math.min(...ymins),
      ymax: Math.max(...ymaxs),
      spatialReference
    }
  } catch (error) {
    if (debug) {
      console.log(`Could not calculate extent from data: ${error.message}`)
    }
  }
}

function transformLayersMetadataToServerMetadata (input) {
  const layers = normalizeLayersInput(input)
  return layers.reduce((accumulator, layer, i) => {
    const layerMetadata = serverLayerInfo(layer, i)
    if (layerMetadata.geometryType) {
      accumulator.layers.push(layerMetadata)
    } else {
      accumulator.tables.push(layerMetadata)
    }
    return accumulator
  },
  { layers: [], tables: [], layerExtents: [] }
  )
}

function normalizeLayersInput (input) {
  const { type, layers = [] } = input

  if (type === 'FeatureCollection') {
    return [input]
  }

  return layers
}

function serverLayerInfo (geojson = {}, defaultId) {
  const {
    metadata: {
      id,
      name,
      minScale = 0,
      maxScale = 0,
      defaultVisibility
    } = {}
  } = geojson

  return {
    id: id || defaultId,
    name: name || `Layer_${id || defaultId}`,
    parentLayerId: -1,
    defaultVisibility: defaultVisibility !== false,
    subLayerIds: null,
    minScale,
    maxScale,
    geometryType: getGeometryTypeFromGeojson(geojson)
  }
}

function getSpatialReference (collection, {
  inputCrs,
  sourceSR
}) {
  if (!inputCrs && !sourceSR && _.isEmpty(collection)) return
  const spatialReference = inputCrs || sourceSR || getCollectionCrs(collection)

  if (!spatialReference) return

  const { latestWkid, wkid, wkt } = normalizeSpatialReference(spatialReference)

  if (wkid) {
    return { wkid, latestWkid }
  }

  return { wkt }
}

module.exports = serverMetadata
