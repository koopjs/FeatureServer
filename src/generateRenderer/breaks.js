const Classifier = require('classybrew')

module.exports = { createBreaks }

function createBreaks (features, classification) {
  const values = getFeatureValues(features, classification)
  if (classification.breakCount > values.length) classification.breakCount = values.length // make sure there aren't more breaks than values
  return calculateBreaks(values, features, classification)
    .map((value, index, array) => { return [array[index - 1] || array[0], value] }).slice(1)
}

function getFeatureValues (features, options) {
  // TODO: should featureCollection metadata fields be checked too?
  return features.map((feature, index) => {
    const properties = feature.properties || feature.attributes // TODO: should this conditional be an option?

    const key = Object.keys(properties).filter(property => {
      return property === options.classificationField
    })
    return Number(properties[key])
  })
}

function calculateBreaks (values, features, options) {
  const normValues = normalizeValues(values, features, options)
  const classifier = new Classifier()
  classifier.setSeries(normValues)
  classifier.setNumClasses(options.breakCount)

  switch (options.classificationMethod) {
    case 'esriClassifyEqualInterval': return classifier.classify('equal_interval')
    case 'esriClassifyNaturalBreaks': return classifier.classify('jenks')
    case 'esriClassifyQuantile': return classifier.classify('quantile')
    case 'esriClassifyGeometricalInterval': return undefined
    case 'esriClassifyStandardDeviation':
      if (options.standardDeviationInterval) {
        // TODO: either use a different library to classify, or find how to integrate interval into calculation
        return classifier.classify('std_deviation')
      } else {
        // handle when a user doesn't add a standard deviation interval
      } break
    default: return undefined
  }
}

function normalizeValues (values, features, options) {
  if (!options.normalizationType) return values
  const normType = options.normalizationType
  switch (normType) {
    case 'esriNormalizeByField':
      if (!options.normalizationField || options.normalizationField) return
      const normField = options.normalizationField
      return (normField + values)
    case 'esriNormalizeByLog': return values.map(value => {
      return value === 0 || Math.log(value) <= 0 ? 0 : (Math.log(value) * Math.LOG10E || 0)
    })
    case 'esriNormalizeByPercentOfTotal': return (values / values.reduce((sum, value) => { return sum + value }, 0)) * 100
    default:
      return values
  }
}
