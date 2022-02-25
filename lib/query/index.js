const Winnow = require('winnow')
const esriExtent = require('esri-extent')
const { getCollectionCrs } = require('../helpers')
const { renderFeatures } = require('./render-features')
const { renderGeoservicesStatisticsResponse } = require('./render-postprocessed-statistics')
const { renderPrecalulatedStatisticsResponse } = require('./render-precalculated-statistics')
const Utils = require('../utils')
const _ = require('lodash')
const chalk = require('chalk')
const getGeometryTypeFromGeojson = require('../helpers/get-geometry-type-from-geojson')

module.exports = query

/**
 * processes params based on query params
 *
 * @param {object} json
 * @param {object} params
 */
function query (json, params = {}) {
  const {
    features,
    filtersApplied: {
      all: skipFiltering
    } = {}
  } = json

  if (shouldRenderPrecalculatedData(json, params)) {
    return renderPrecalculatedData(json)
  }

  const data = (skipFiltering || !features) ? json : postProcessData(json, params)

  if (shouldLogWarnings()) {
    logWarnings(data, modifyParams)
  }

  if (params.f === 'geojson') {
    return {
      type: 'FeatureCollection',
      features: data.features
    }
  }

  return renderGeoservicesResponse(data, {
    ...params,
    attributeSample: _.get(json, 'features[0].properties'),
    geometryType: getGeometryTypeFromGeojson(json)
  })
}

function shouldRenderPrecalculatedData ({ statistics, count, extent }, { returnCountOnly, returnExtentOnly }) {
  if (statistics) {
    return true
  }

  if (returnCountOnly === true && count !== undefined && returnExtentOnly === true && extent) {
    return true
  }

  if (returnCountOnly === true && count !== undefined && !returnExtentOnly) {
    return true
  }

  if (returnExtentOnly === true && extent && !returnCountOnly) {
    return true
  }

  return false
}

function renderPrecalculatedData (data) {
  const { statistics, count, extent } = data

  if (statistics) {
    return renderPrecalulatedStatisticsResponse(data)
  }

  return {
    count,
    extent
  }
}
function postProcessData (inputData, params) {
  const postProcessingParams = modifyParams(params, inputData)
  return Winnow.query(inputData, postProcessingParams)
}

function modifyParams (params, data) {
  const { f: format, returnExtentOnly, inputCrs, sourceSR } = params
  const { filtersApplied } = data
  const modifedParams = filtersApplied ? modifyParamsForProcessingAlreadyApplied(params, filtersApplied) : params

  if (shouldTransformToEsriJson(format, returnExtentOnly)) {
    modifedParams.toEsri = true
  }

  modifedParams.inputCrs = getInputCrs(data, { inputCrs, sourceSR })

  return modifedParams
}

function modifyParamsForProcessingAlreadyApplied (params, alreadyApplied) {
  const paramsToOmit = _.chain(alreadyApplied).entries()
    .map(([key, value]) => {
      if (key === 'projection') {
        return ['outSR', key]
      }

      if (key === 'offset') {
        return ['resultOffset', key]
      }

      if (key === 'limit') {
        return ['resultRecordCount', key]
      }

      return key
    })
    .flatten()
    .value()

  return _.omit(params, paramsToOmit)
}

function shouldTransformToEsriJson (requestedFormat, returnExtentOnly) {
  return requestedFormat !== 'geojson' && !returnExtentOnly
}

function getInputCrs (data, { inputCrs, sourceSR }) {
  return inputCrs || sourceSR || _.get(data, 'metadata.crs') || getCollectionCrs(data) || 4326
}

function shouldLogWarnings () {
  return process.env.NODE_ENV !== 'production' && process.env.KOOP_WARNINGS !== 'suppress'
}

function logWarnings (geojson, { toEsri }) {
  const { metadata = {}, features } = geojson
  // ArcGIS client warnings
  if (toEsri && !metadata.idField) {
    console.warn(chalk.yellow('WARNING: requested provider has no "idField" assignment. You will get the most reliable behavior from ArcGIS clients if the provider assigns the "idField" to a property that is an unchanging 32-bit integer. Koop will create an OBJECTID field in the absence of an "idField" assignment.'))
  }

  if (toEsri && hasMixedCaseObjectIdKey(metadata.idField)) {
    console.warn(chalk.yellow('WARNING: requested provider\'s "idField" is a mixed-case version of "OBJECTID". This can cause errors in ArcGIS clients.'))
  }

  // Compare provider metadata fields to feature properties
  // TODO: refactor
  if (metadata.fields && _.has(features, '[0].properties')) {
    warnOnMetadataFieldDiscrepencies(geojson.metadata.fields, geojson.features[0].properties)
  }
}

function hasMixedCaseObjectIdKey (idField = '') {
  return idField.toLowerCase() === 'objectid' && idField !== 'OBJECTID'
}

/**
 * Compare fields generated from metadata to properties of a data feature.
 * Warn if differences discovered
 * @param {*} metadataFields
 * @param {*} properties
 */
function warnOnMetadataFieldDiscrepencies (metadataFields, featureProperties) {
  // build a comparison collection from the data samples properties
  const featureFields = Object.keys(featureProperties).map(name => {
    return { name, type: Utils.detectType(featureProperties[name]) }
  })

  // compare metadata to feature properties; identifies fields defined in metadata that are not found in feature properties
  // or that have a metadata type definition inconsistent with feature property's value
  metadataFields.filter(field => {
    // look for a defined field in the features properties
    const featureField = _.find(featureFields, ['name', field.name]) || _.find(featureFields, ['name', field.alias])
    if (!featureField || (field.type !== featureField.type && !(field.type === 'Date' && featureField.type === 'Integer') && !(field.type === 'Double' && featureField.type === 'Integer'))) {
      console.warn(chalk.yellow(`WARNING: requested provider's metadata field "${field.name} (${field.type})" not found in feature properties)`))
    }
  })

  // compare feature properties to metadata fields; identifies fields found on feature that are not defined in metadata field array
  featureFields.filter(field => {
    const noNameMatch = _.find(metadataFields, ['name', field.name])
    const noAliasMatch = _.find(metadataFields, ['alias', field.name])

    // Exclude warnings on feature fields named OBJECTID because OBJECTID may have been added by winnow in which case it should not be in the metadata fields array
    if (!(noNameMatch || noAliasMatch) && field.name !== 'OBJECTID') {
      console.warn(chalk.yellow(`WARNING: requested provider's features have property "${field.name} (${field.type})" that was not defined in metadata fields array)`))
    }
  })
}

/**
 * Format the queried data according to request parameters
 * @param {object} data - full dataset
 * @param {object} data - subset of data with query applied
 * @param {object} params
 */
function renderGeoservicesResponse (data, params = {}) {
  const {
    objectIds,
    outStatistics,
    returnCountOnly,
    returnExtentOnly,
    returnIdsOnly,
    outSR
  } = params

  if (shouldFilterByObjectIds(objectIds, outStatistics)) {
    data.features = filterByObjectIds(data, objectIds)
  }

  if (returnCountOnly && returnExtentOnly) {
    return {
      count: _.get(data, 'features.length', 0),
      extent: getExtent(data)
    }
  }

  if (returnCountOnly) {
    return {
      count: _.get(data, 'features.length', 0)
    }
  }

  if (returnExtentOnly) {
    return {
      extent: getExtent(data, outSR)
    }
  }

  if (returnIdsOnly) {
    return renderIdsOnlyResponse(data)
  }

  if (outStatistics) {
    return renderGeoservicesStatisticsResponse(data, params)
  }

  return renderFeatures(data, params)
}

function shouldFilterByObjectIds (objectIds, outStatistics) {
  // request for objectIds ignored if out-statistics option is also requested
  return objectIds && !outStatistics
}

function filterByObjectIds (data, objectIds) {
  const idField = _.get(data, 'metadata.idField') || 'OBJECTID'
  const requestedObjectIds = normalizeObjectIds(objectIds)

  return data.features.filter(({ attributes }) => {
    return requestedObjectIds.includes(attributes[idField])
  })
}

function normalizeObjectIds (objectIds) {
  let ids
  if (Array.isArray(objectIds)) {
    ids = objectIds
  } else if (typeof objectIds === 'string') {
    ids = objectIds.split(',')
  } else if (typeof objectIds === 'number') {
    ids = [objectIds]
  } else {
    const error = new Error('Invalid "objectIds" parameter.')
    error.code = 400
    throw error
  }

  return ids.map(i => {
    if (isNaN(i)) {
      return i
    }

    return parseInt(i)
  })
}

/**
 * Format a response for an ids-only request
 * @param {object} data
 */
function renderIdsOnlyResponse (data) {
  const objectIdFieldName = _.get(data, 'metadata.idField') || 'OBJECTID'
  const objectIds = data.features.map(feature => {
    return feature.attributes[objectIdFieldName]
  })

  return {
    objectIdFieldName,
    objectIds
  }
}

/**
 * Get an extent object for passed GeoJSON
 * @param {object} geojson
 * @param {*} outSR Esri spatial reference object, or WKID integer
 */
function getExtent (geojson, outSR) {
  // Calculate extent from features
  const extent = esriExtent(geojson)

  if (!outSR) return extent

  // Esri extent assumes WGS84, but the data passed in may have been transformed
  // to a different coordinate system by winnow. Math should be the same for the
  // output spatial references we support, but we need to alter the spatial reference
  // property to reflect the requested outSR

  // when outSR submitted as wkt
  if (outSR.wkt) {
    extent.spatialReference = {
      wkt: outSR.wkt
    }
    return extent
  }

  // When submitted as a WKID
  const wkid = outSR.latestWkid || outSR.wkid || outSR
  if (Number.isInteger(wkid)) {
    extent.spatialReference = { wkid }
    return extent
  }

  return extent
}
