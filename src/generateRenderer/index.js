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
function generateRenderer (data, params = {}) {
  const options = {}
  options.params = params
  if (data.statistics) {
    const stats = data.statistics
    options.classBreaks = stats.map(attributes => {
      if (attributes.classBreaks) { return attributes.classBreaks } // TODO: find a better way to grab classBreaks from stats
    })[0].sort((a, b) => a - b) // sort class breaks
  } else if (params.classificationDef) {
    const queriedData = Winnow.query(data, params)
    const features = queriedData.features

    if (features === undefined || features.length === 0) return // if there are no features, return

    const classification = params.classificationDef
    if (classification.type === 'classBreaksDef') {
      options.classBreaks = createBreaks(features, classification)
    } else if (classification.type === 'uniqueValuesDef') {
      // TODO: handle unique values & potentially call a different renderer
    }
  } else {
    console.log('error')
  }
  return renderRenderers(options)
}
