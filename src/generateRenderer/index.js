const Winnow = require('winnow')
const { renderClassBreaks, renderUniqueValue } = require('../templates')

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
    if (data.statistics && data.statistics.classBreaks) {
      // TODO: found issue at 5pm 7/21 - need to ignore parts of classificationDef if statistics are passed in
      breaks = data.statistics.classBreaks.sort((a, b) => a - b)
      return renderClassBreaks(breaks)
    } else breaks = Winnow.query(data, params)

    if (params.classificationDef && params.classificationDef.type) {
      const classification = params.classificationDef
      if (classification.type && classification.type === 'classBreaksDef') {
        return renderClassBreaks(breaks, classification)
      } else if (classification.type && classification.type === 'uniqueValueDef') {
        return renderUniqueValue(breaks, classification)
      } else { throw new Error('invalid classification type: ', classification.type) }
    } else { throw new Error('invalid classification: ', params.classificationDef) }
  } catch (e) {
    console.log(e)
    return {}
  }
}
