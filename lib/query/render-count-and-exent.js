const _ = require('lodash')
const esriExtent = require('esri-extent')

function renderCountAndExtentResponse (data, params) {
  const {
    returnCountOnly,
    returnExtentOnly,
    outSR
  } = params

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

module.exports = { renderCountAndExtentResponse }
