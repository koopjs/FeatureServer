const { getCollectionCrs, getGeometryTypeFromGeojson } = require('./helpers')
const { renderStats } = require('./templates')
const _ = require('lodash')
const { computeFieldObject } = require('./field')

module.exports = queryRelatedRecords

function queryRelatedRecords (data, params = {}) {
  // TODO clean up this series of if statements
  const filtersApplied = data.filtersApplied || {}
  const options = _.cloneDeep(params)

  if (filtersApplied.projection || options.returnGeometry === false) delete options.outSR
  if (filtersApplied.geometry) delete options.geometry
  if (filtersApplied.where || options.where === '1=1') delete options.where
  if (filtersApplied.offset) delete options.resultOffset
  if (filtersApplied.limit) {
    delete options.resultRecordCount
    delete options.limit
  }
  if (data.statistics) return renderStats(data)
  if (options.returnCountOnly && data.count !== undefined) return { count: data.count }
  if (options.f !== 'geojson' && !options.returnExtentOnly) options.toEsri = true

  const response = {
    hasZ: false,
    hasM: false,
    fields: [],
    relatedRecordGroups: []
  }

  response.fields = computeFieldObject(data, 'query', params)

  const geomType = getGeometryTypeFromGeojson(data)
  if (geomType) {
    response.geomType = geomType
    response.spatialReference = getCollectionCrs(data)
  }

  if (data.features) {
    data.features.forEach(recordGroupJSON => {
      const recordGroup = {
        objectId: recordGroupJSON.properties.objectid,
        relatedRecords: []
      }

      if (recordGroupJSON.features) {
        recordGroupJSON.features.forEach(featureJSON => {
          recordGroup.relatedRecords.push({
            attributes: featureJSON.properties,
            geometry: featureJSON.geometry
          })
        })
      }

      response.relatedRecordGroups.push(recordGroup)
    })
  }

  return response
}
