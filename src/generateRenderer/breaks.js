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
  // make sure there aren't more breaks than values
  if (classification.breakCount > values.length) classification.breakCount = values.length

  // calculate break ranges [ [a-b], [b-c], ...] from input values
  return calculateBreaks(values, features, classification)
    .map((value, index, array) => { return [array[index - 1] || array[0], value] }).slice(1)
}

function calculateBreaks (values, features, classification) {
  if (classification.normalizationType) { values = normalizeValues(values, features, classification) }
  const classifier = new Classifier()
  classifier.setSeries(values)
  classifier.setNumClasses(classification.breakCount)

  switch (classification.classificationMethod) {
    case 'esriClassifyEqualInterval': return classifier.classify('equal_interval')
    case 'esriClassifyNaturalBreaks': return classifier.classify('jenks')
    case 'esriClassifyQuantile': return classifier.classify('quantile')
    case 'esriClassifyGeometricalInterval': throw new Error('Classification not yet supported')
    case 'esriClassifyStandardDeviation':
      // TODO: either use a different library to classify, or find how to integrate interval into calculation
      throw new Error('Classification not yet supported')
    default: throw new Error('Classification not supported: ', classification.classificationMethod)
  }
}

function normalizeValues (values, features, classification) {
  const normType = classification.normalizationType
  switch (normType) {
    case 'esriNormalizeByField': return normalizeByField(values, features, classification)
    case 'esriNormalizeByLog': return normalizeByLog(values)
    case 'esriNormalizeByPercentOfTotal': return normalizeByPercent(values)
    default: throw new Error('Normalization not supported: ', normType)
  }
}

function normalizeByField (values, features, classification) {
  if (classification.normalizationField) {
    const normValues = getValues(features, classification.normalizationField)
    if (!isNaN(normValues)) return values.map((value, index) => { return value / normValues[index] })
    throw new Error('Field to normalize with is non-numeric: ', classification.normalizationField)
  }
  throw new Error('normalizationField not found: ', classification.normalizationField)
}

function normalizeByLog (values) {
  return values.map(value => {
    if (value === 0 || Math.log(value) <= 0) return 0
    return (Math.log(value) * Math.LOG10E || 0)
  })
}

function normalizeByPercent (values) {
  if (!isNaN(values)) return (values / values.reduce((sum, value) => { return sum + value }, 0)) * 100
  return values
}

function getValues (features, field) {
  return features.map((feature, index) => {
    const properties = feature.properties
    const key = Object.keys(properties).filter(property => { return property === field })
    const value = Number(properties[key])
    if (isNaN(value)) throw new TypeError('Cannot use values from non-numeric field')
    return value
  })
}
