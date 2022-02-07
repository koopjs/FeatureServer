const { getCollectionCrs, getGeometryTypeFromGeojson } = require('./helpers')
const { computeFieldObject } = require('./field')

module.exports = queryRelatedRecords

function queryRelatedRecords (data, params = {}) {
  const response = {
    relatedRecordGroups: []
  }

  if (!params.returnCountOnly) response.fields = computeFieldObject(data, 'query', params)

  const geomType = getGeometryTypeFromGeojson(data)
  if (geomType) {
    response.geomType = geomType
    response.spatialReference = getCollectionCrs(data)
    response.hasZ = false
    response.hasM = false
  }

  if (data.features) {
    const start =
    response.relatedRecordGroups = data.features.map(recordGroupJSON => {
      const recordGroup = {
        objectId: recordGroupJSON.properties.objectid
      }

      if (params.returnCountOnly) {
        // allow for preprocessing of count within provider
        if ('count' in recordGroupJSON.properties) {
          recordGroup.count = recordGroupJSON.properties.count
        } else {
          recordGroup.count = recordGroupJSON.features ? recordGroupJSON.features.length : 0
        }

        return recordGroup
      }

      if (recordGroupJSON.features) {
        recordGroup.relatedRecords = recordGroupJSON.features.map(featureJSON => {
          return {
            attributes: featureJSON.properties,
            geometry: featureJSON.geometry
          }
        })
      }

      return recordGroup
    })
  }

  return response
}
