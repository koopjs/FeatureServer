const Classifier = require('classybrew')

module.exports = { createBreaks }

function createBreaks (features, classification) {
  let values
  try {
    values = getValues(features, classification.classificationField)
  } catch (e) {
    console.log(e)
    return
  }
  if (classification.breakCount > values.length) classification.breakCount = values.length // make sure there aren't more breaks than values

  return calculateBreaks(values, features, classification)
    .map((value, index, array) => { return [array[index - 1] || array[0], value] }).slice(1)
}

function getValues (features, field) {
  // TODO: should featureCollection metadata fields be checked too?
  return features.map((feature, index) => {
    const properties = feature.properties || feature.attributes // TODO: should this conditional be an option?
    const key = Object.keys(properties).filter(property => { return property === field })
    const value = Number(properties[key])
    if (isNaN(value)) throw new TypeError('Cannot use values from non-numeric field')
    return value
  })
}

function calculateBreaks (values, features, classification) {
  const normValues = normalizeValues(values, features, classification)
  const classifier = new Classifier()
  classifier.setSeries(normValues)
  classifier.setNumClasses(classification.breakCount)

  switch (classification.classificationMethod) {
    case 'esriClassifyEqualInterval': return classifier.classify('equal_interval')
    case 'esriClassifyNaturalBreaks': return classifier.classify('jenks')
    case 'esriClassifyQuantile': return classifier.classify('quantile')
    case 'esriClassifyGeometricalInterval': return undefined
    case 'esriClassifyStandardDeviation':
      if (classification.standardDeviationInterval) {
        // TODO: either use a different library to classify, or find how to integrate interval into calculation
        return classifier.classify('std_deviation')
      } else {
        // handle when a user doesn't add a standard deviation interval
      } break
    default: return undefined
  }
}

function normalizeValues (values, features, classification) {
  if (!classification.normalizationType) return values
  const normType = classification.normalizationType
  switch (normType) {
    case 'esriNormalizeByField':
      if (classification.normalizationField) {
        const normValues = getValues(features, classification.normalizationField)
        if (!isNaN(normValues)) return values.map((value, index) => { return value / normValues[index] }) // TODO: handle non-integer division
      }
      return values
    case 'esriNormalizeByLog': return values.map(value => {
      return value === 0 || Math.log(value) <= 0 ? 0 : (Math.log(value) * Math.LOG10E || 0)
    })
    case 'esriNormalizeByPercentOfTotal':
      if (!isNaN(values)) return (values / values.reduce((sum, value) => { return sum + value }, 0)) * 100
      return values
    default:
      return values
  }
}
