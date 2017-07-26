const _ = require('lodash')
const { createMultipartRamp, createAlgorithmicRamp } = require('./colorRamps')
const createSymbol = require('./createSymbol')

module.exports = { createClassBreakInfos, createUniqueValueInfos }

const renderers = {
  classBreakInfos: require('../../templates/renderers/classBreakInfos.json'),
  uniqueValueInfos: require('../../templates/renderers/uniqueValueInfos.json'),
  algorithmicColorRamp: require('../../templates/renderers/algorithmicColorRamp.json')
}

function createClassBreakInfos (breaks, classification) {
  const { colorRamp, baseSymbol, type } = setSymbology(breaks, classification)

  return breaks.map((currBreak, index) => {
    const json = _.cloneDeep(renderers.classBreakInfos)
    json.classMaxValue = currBreak[1]
    json.classMinValue = currBreak[0]
    json.label = `${json.classMinValue}-${json.classMaxValue}`
    json.description = ''
    json.symbol = createSymbol(baseSymbol, colorRamp[index], type)
    return json
  })
}

function createUniqueValueInfos (breaks, classification) {
  const { colorRamp, baseSymbol, type } = setSymbology(breaks, classification)
  // TODO: ? check to make sure that break name(s) == classification.uniqueValueFields
  // if (_.findKey(currBreak, { currBreak.name }) !== classification.uniqueValueFields[0]) throw new Error('')

  return breaks.map((currBreak, index) => {
    const json = _.cloneDeep(renderers.uniqueValueInfos)
    json.value = currBreak[classification.uniqueValueFields[0]]
    json.count = currBreak.count
    json.label = currBreak[classification.uniqueValueFields[0]]
    json.description = ''
    json.symbol = createSymbol(baseSymbol, colorRamp[index], type)
    return json
  })
}

function setSymbology (breaks, classification) {
  const type = 1 // TODO: use this to get the geometry type for creating a symbol
  const inputRamp = classification && classification.colorRamp ? classification.colorRamp : undefined
  const colorRamp = createColorRamp(breaks, inputRamp)
  let baseSymbol
  if (classification && classification.baseSymbol) baseSymbol = classification.baseSymbol
  return { colorRamp, baseSymbol, type }
}

function createColorRamp (breaks, inputRamp) {
  const rampOptions = {
    rampDetails: inputRamp || _.cloneDeep(renderers.algorithmicColorRamp),
    breakCount: breaks.length
  }
  const type = rampOptions.rampDetails.type
  if (type === 'multipart' && rampOptions.rampDetails.colorRamps) return createMultipartRamp(rampOptions) // TODO: create checks for multipart
  else if (type === 'algorithmic') return createAlgorithmicRamp(rampOptions)
  else throw new Error('Invalid color ramp type: ', rampOptions.rampDetails.type)
}
