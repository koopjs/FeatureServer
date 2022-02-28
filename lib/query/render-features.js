const _ = require('lodash')
const { computeFieldObject } = require('../field')
const { normalizeSpatialReference } = require('../geometry')
const getCollectionCrs = require('../helpers/get-collection-crs')
const featureResponseTemplate = require('../../templates/features.json')

/**
 * Modifies a template features json file with metadata, capabilities, and data from the model
 * @param {object} data - data from provider model
 * @param {object} options
 * @return {object} formatted features data
 */
function renderFeaturesResponse (data = {}, options = {}) {
  const json = _.cloneDeep(featureResponseTemplate)
  const metadata = data.metadata || {}

  json.geometryType = options.geometryType
  json.spatialReference = getOutputSpatialReference(data, options)
  json.fields = computeFieldObject(data, 'query', options)
  json.features = data.features || []

  if (metadata.limitExceeded) json.exceededTransferLimit = true
  if (metadata.transform) json.transform = metadata.transform
  if (metadata.idField) {
    json.objectIdFieldName = metadata.idField
    json.uniqueIdField.name = metadata.idField
  }
  return json
}

function getOutputSpatialReference (collection, {
  outSR,
  outputCrs,
  inputCrs,
  sourceSR
}) {
  const spatialReference = outputCrs || outSR || inputCrs || sourceSR || getCollectionCrs(collection) || 4326

  const { wkid, wkt, latestWkid } = normalizeSpatialReference(spatialReference)

  if (wkid) {
    return { wkid, latestWkid }
  }

  return { wkt }
}

module.exports = { renderFeaturesResponse }
