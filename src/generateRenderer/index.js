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
  if (Object.keys(params).length === 0 && !data.statistics) return params // TODO: better error handling, don't just return empty

  let breaks = {}
  const classification = params.classificationDef

  // TODO: throw an error if input values of classification field are non-numeric

  if (data.statistics) {
    const stats = data.statistics
    breaks = stats.map(attributes => {
      if (attributes.classBreaks) { return attributes.classBreaks } // TODO: find a better way to grab classBreaks from stats
    })[0].sort((a, b) => a - b) // sort class breaks
  } else if (classification) {
    const queriedData = Winnow.query(data, params)
    const features = queriedData.features

    if (queriedData.features === undefined || queriedData.features.length === 0) return // if there are no features, return

    if (classification.type === 'classBreaksDef') {
      breaks = createBreaks(features, classification)
      // TODO: HANDLE GEOMETRY TYPE
    } else if (classification.type === 'uniqueValuesDef') {
      // TODO: handle unique values & potentially call a different renderer
    }
  } else {
    console.log('error')
  }
  return renderRenderers(breaks, classification)
}
