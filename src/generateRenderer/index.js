const Winnow = require('winnow')
const { renderRenderers } = require('../templates')
const { createBreaks } = require('./breaks')

module.exports = generateRenderer

/**
 * processes params based on generate renderer params
 *
 * @param {object} data
 * @param {object} params
 * @param {function} callback
 */
function generateRenderer (data = {}, params = {}) {
  try {
    if (Object.keys(data).length === 0) throw new Error('there must be input features in order to generate a renderer')

    let breaks = {}
    const classification = params.classificationDef

    if (data.statistics && data.statistics.length > 0) {
      const stats = data.statistics
      breaks = stats.map(attributes => {
        if (attributes.classBreaks) { return attributes.classBreaks } // TODO: find a better way to grab classBreaks from stats
      })[0].sort((a, b) => a - b) // sort class breaks
    } else if (classification) {
      const queriedData = Winnow.query(data, params)
      const features = queriedData.features
      if (features === undefined || features.length === 0) throw new Error('features returned in order to generate a renderer')

      if (classification.type === 'classBreaksDef') {
        breaks = createBreaks(features, classification)
        // TODO: HANDLE GEOMETRY TYPE
      } else if (classification.type === 'uniqueValuesDef') {
        // TODO: handle unique values & potentially call a different renderer
      }
    } else throw new Error('must supply input statistics or a classification')
    return renderRenderers(breaks, classification)
  } catch (e) {
    console.log(e)
    return {}
  }
}
