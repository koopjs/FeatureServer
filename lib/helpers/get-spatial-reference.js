const _ = require('lodash')
const getCollectionCrs = require('./get-collection-crs')
const normalizeSpatialReference = require('./normalize-spatial-reference')

function getSpatialReference (geojson, props) {
  if (!props && _.isEmpty(geojson)) return
  const inputCrs = props ? props.inputCrs : undefined
  const sourceSR = props ? props.sourceSR : undefined
  if (!inputCrs && !sourceSR && _.isEmpty(geojson)) return
  const spatialReference = inputCrs || sourceSR || getCollectionCrs(geojson)

  if (!spatialReference) return

  const { latestWkid, wkid, wkt } = normalizeSpatialReference(spatialReference)

  if (wkid) {
    return { wkid, latestWkid }
  }

  return { wkt }
}

module.exports = getSpatialReference
