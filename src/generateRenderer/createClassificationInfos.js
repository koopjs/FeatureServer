const _ = require('lodash')
const { createColorRamp } = require('./colorRamps')
const { createSymbol } = require('./createSymbol')

module.exports = { createClassBreakInfos, createUniqueValueInfos }

const renderers = {
  classBreakInfos: require('../../templates/renderers/classification/classBreakInfos.json'),
  uniqueValueInfos: require('../../templates/renderers/classification/uniqueValueInfos.json')
}

function createClassBreakInfos (breaks, classification, geomType) {
  const { colorRamp, baseSymbol } = setSymbology(breaks, classification)

  return breaks.map((currBreak, index) => {
    const json = _.cloneDeep(renderers.classBreakInfos)
    json.classMaxValue = currBreak[1]
    json.classMinValue = currBreak[0]
    json.label = `${json.classMinValue}-${json.classMaxValue}`
    json.description = '' // TODO: ? fill in description
    json.symbol = createSymbol(baseSymbol, colorRamp[index], geomType)
    return json
  })
}

function createUniqueValueInfos (breaks, classification, geomType) {
  const { colorRamp, baseSymbol } = setSymbology(breaks, classification)
  // TODO: ? check to make sure that break name(s) == classification.uniqueValueFields
  // if (_.findKey(currBreak, { currBreak.name }) !== classification.uniqueValueFields[0]) throw new Error('')
  return breaks.map((currBreak, index) => {
    const json = _.cloneDeep(renderers.uniqueValueInfos)
    json.value = parseUniqueValues(currBreak)
    json.count = currBreak.count
    json.label = json.value
    json.description = '' // TODO: ? fill in description
    json.symbol = createSymbol(baseSymbol, colorRamp[index], geomType)
    return json
  })
}

function parseUniqueValues (currBreak) {
  const thisBreak = _.cloneDeep(currBreak)
  delete thisBreak.count
  return Object.values(thisBreak).join(', ')
}

function setSymbology (breaks, classification) {
  const inputRamp = classification && classification.colorRamp ? classification.colorRamp : undefined
  const colorRamp = createColorRamp(breaks, inputRamp)
  let baseSymbol
  if (classification && classification.baseSymbol) baseSymbol = classification.baseSymbol
  return { colorRamp, baseSymbol }
}
