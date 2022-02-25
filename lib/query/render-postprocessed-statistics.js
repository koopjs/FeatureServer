const { computeFieldObject } = require('../field')
module.exports = { renderGeoservicesStatisticsResponse }

function renderGeoservicesStatisticsResponse (input = {}, options = {}) {
  const statistics = Array.isArray(input) ? input : [input]
  const features = statistics.map(attributes => {
    return { attributes }
  })

  return {
    displayFieldName: '',
    fields: computeFieldObject({
      type: 'FeatureCollection',
      features
    }, 'statistics', options),
    features
  }
}
