const _ = require('lodash')
const { filterAndTransform } = require('./filter-and-transform')
const { logWarnings } = require('./log-warnings')
const { renderFeaturesResponse } = require('./render-features')
const { renderGeoservicesStatisticsResponse } = require('./render-postprocessed-statistics')
const { renderPrecalulatedStatisticsResponse } = require('./render-precalculated-statistics')
const { renderCountAndExtentResponse } = require('./render-count-and-exent')
const getGeometryTypeFromGeojson = require('../helpers/get-geometry-type-from-geojson')

module.exports = query

/**
 * processes params based on query params
 *
 * @param {object} json
 * @param {object} requestParams
 */
function query (json, requestParams = {}) {
  const {
    features,
    filtersApplied: {
      all: skipFiltering
    } = {}
  } = json

  const { f: requestedFormat } = requestParams

  if (shouldRenderPrecalculatedData(json, requestParams)) {
    return renderPrecalculatedData(json)
  }

  const data = (skipFiltering || !features) ? json : filterAndTransform(json, requestParams)

  if (shouldLogWarnings()) {
    logWarnings(data, requestParams.f)
  }

  if (requestedFormat === 'geojson') {
    return {
      type: 'FeatureCollection',
      features: data.features
    }
  }

  return renderGeoservicesResponse(data, {
    ...requestParams,
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

function shouldLogWarnings () {
  return process.env.NODE_ENV !== 'production' && process.env.KOOP_WARNINGS !== 'suppress'
}

/**
 * Format the queried data according to request parameters
 * @param {object} data - full dataset
 * @param {object} data - subset of data with query applied
 * @param {object} params
 */
function renderGeoservicesResponse (data, params = {}) {
  const {
    outStatistics,
    returnCountOnly,
    returnExtentOnly,
    returnIdsOnly
  } = params

  if (returnCountOnly || returnExtentOnly) {
    return renderCountAndExtentResponse(data, params)
  }

  if (returnIdsOnly) {
    return renderIdsOnlyResponse(data)
  }

  if (outStatistics) {
    return renderGeoservicesStatisticsResponse(data, params)
  }

  return renderFeaturesResponse(data, params)
}

function renderIdsOnlyResponse ({ features = [], metadata = {} }) {
  const objectIdFieldName = metadata.idField || 'OBJECTID'

  const objectIds = features.map(({ attributes }) => {
    return attributes[objectIdFieldName]
  })

  return {
    objectIdFieldName,
    objectIds
  }
}
