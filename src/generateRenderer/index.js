const { algorithmicRamp } = require('./colorRamps')

module.exports = generateRenderer

/**
 * processes params based on generate renderer params
 *
 * @param {object} data
 * @param {object} params
 * @param {function} callback
 */
function generateRenderer (data, params = {}) {
  return createClassification(data, params)
}

function createClassification (data, params) {
  const classification = params.classificationDef
  if (classification.type === 'classBreaksDef') {
    if (classification.breakCount) {
      classification.valueCount = data.features.length
      return algorithmicRamp(classification)
    }
  } else if (classification.type === 'uniqueValuesDef') {
  } else {
  }
}
