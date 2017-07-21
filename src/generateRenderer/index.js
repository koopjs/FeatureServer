const Winnow = require('winnow')
const { renderRenderers } = require('../templates')

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

    let breaks = []
    if (data.statistics && data.statistics.length > 0) {
      const stats = data.statistics
      breaks = stats.map(attributes => {
        if (attributes.classBreaks) { return attributes.classBreaks } // TODO: find a better way to grab classBreaks from stats
      })[0].sort((a, b) => a - b) // sort class breaks
    } else {
      // throw new Error('other operations are not currently supported')
      breaks = Winnow.query(data, params)
    }
    return renderRenderers(breaks, params.classificationDef)
  } catch (e) {
    console.log(e)
    return {}
  }
}
