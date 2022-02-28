const _ = require('lodash')
const Winnow = require('winnow')
const { getCollectionCrs } = require('../helpers')

function filterAndTransform (geojson, requestParams) {
  const params = FilterAndTransFormParams.create(requestParams)
    .removeParamsAlreadyApplied(geojson.filtersApplied)
    .addToEsri()
    .addInputCrs(geojson)

  const result = Winnow.query(geojson, params)

  const { objectIds } = params
  const { outStatistics } = result

  if (!shouldFilterByObjectIds(objectIds, outStatistics)) {
    return result
  }

  return {
    ...result,
    features: filterByObjectIds(result, objectIds)
  }
}

class FilterAndTransFormParams {
  static create (requestParams) {
    return new FilterAndTransFormParams(requestParams)
  }

  constructor (requestParams) {
    Object.assign(this, requestParams)
  }

  removeParamsAlreadyApplied (alreadyApplied) {
    for (const key in alreadyApplied) {
      if (key === 'projection') {
        delete this.outSR
      }

      if (key === 'offset') {
        delete this.resultOffset
      }

      if (key === 'limit') {
        delete this.resultRecordCount
      }

      delete this[key]
    }

    return this
  }

  addToEsri () {
    this.toEsri = this.f !== 'geojson' && !this.returnExtentOnly
    return this
  }

  addInputCrs (data = {}) {
    const { metadata = {} } = data
    this.inputCrs = this.inputCrs || this.sourceSR || metadata.crs || getCollectionCrs(data) || 4326
    return this
  }
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

module.exports = { filterAndTransform }
