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
  const type = 1 // TODO: use this to get the geometry type for creating a symbol
  const inputRamp = classification && classification.colorRamp ? classification.colorRamp : undefined
  const colorRamp = createColorRamp(breaks, inputRamp)
  let baseSymbol
  if (classification && classification.baseSymbol) baseSymbol = classification.baseSymbol

  return breaks.map((currBreak, index) => {
    const json = _.cloneDeep(renderers.classBreakInfos)
    json.classMaxValue = currBreak[1]
    json.classMinValue = currBreak[0]
    json.label = `${json.classMinValue}-${json.classMaxValue}` // TODO: handle duplicate max/min values between adjacent classes
    json.description = ''
    json.symbol = createSymbol(baseSymbol, colorRamp[index], type)
    return json
  })
}

function createUniqueValueInfos (breaks, classification) {
  const type = 1 // TODO: use this to get the geometry type for creating a symbol
  const inputRamp = classification && classification.colorRamp ? classification.colorRamp : undefined
  const breakValues = breaks.map((currBreak) => { return currBreak.count })

  const colorRamp = createColorRamp(breakValues, inputRamp)
  let baseSymbol
  if (classification && classification.baseSymbol) baseSymbol = classification.baseSymbol
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

function createColorRamp (breaks, inputRamp) {
  const rampOptions = {
    rampDetails: inputRamp || _.cloneDeep(renderers.algorithmicColorRamp),
    breakCount: breaks.length
  }
  if (rampOptions.rampDetails.type === 'multipart' && rampOptions.rampDetails.colorRamps) {
    return createMultipartRamp(rampOptions)
  } else if (rampOptions.rampDetails.type === 'algorithmic') {
    return createAlgorithmicRamp(rampOptions)
  } else {
    console.log('Incorrect color ramp type: ', rampOptions.rampDetails.type)
  }
}
