const Classifier = require('classybrew')

module.exports = { createBreaks }

function createBreaks (features, classification) {
  const values = getFeatureValues(features, classification)
  if (classification.breakCount > values.length) classification.breakCount = values.length // make sure there aren't more breaks than values
  return calculateBreaks(values, classification)
    .map((value, index, array) => { return [array[index - 1] || array[0], value] }).slice(1)
}

function getFeatureValues (features, options) {
  // TODO: should featureCollection metadata fields be checked too?
  return features.map((feature, index) => {
    const properties = feature.properties || feature.attributes // TODO: should this conditional be an option?

    const key = Object.keys(properties).filter(property => {
      return property === options.classificationField
    })
    return properties[key]
  })
}

function calculateBreaks (values, options) {
  // TODO: handle normalization
  const classifier = new Classifier()
  classifier.setSeries(values)
  classifier.setNumClasses(options.breakCount)
  switch (options.classificationMethod) {
    case 'esriClassifyEqualInterval': return classifier.classify('equal_interval')
    case 'esriClassifyNaturalBreaks': return classifier.classify('jenks')
    case 'esriClassifyQuantile': return classifier.classify('quantile')
    case 'esriClassifyGeometricalInterval': return undefined
    case 'esriClassifyStandardDeviation':
      if (options.standardDeviationInterval) {
        // TODO: either use a different library to classify, or find how to integrate interval
        return classifier.classify('std_deviation')
      } else {
        // handle when a user doesn't add a standard deviation interval
      } break
    default: return undefined
  }
}
