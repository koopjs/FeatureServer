const _ = require('lodash')
const { createMultipartRamp, createAlgorithmicRamp } = require('./colorRamps')
const createSymbol = require('./createSymbol')

module.exports = { createClassBreakInfos, createUniqueValueInfos }

const renderers = {
  classBreakInfo: require('../../templates/renderers/classBreakInfo.json'),
  uniqueValueInfo: require('../../templates/renderers/uniqueValueInfo.json'),
  algorithmicColorRamp: require('../../templates/renderers/algorithmicColorRamp.json')
}

function createClassBreakInfos (breaks, classification) {
  const type = 1
  let baseSymbol
  if (classification && classification.baseSymbol) baseSymbol = classification.baseSymbol
  const colorRamp = createColorRamp(breaks, classification)

  return breaks.map((currBreak, index) => {
    const json = _.cloneDeep(renderers.classBreakInfo)
    json.classMaxValue = currBreak[1]
    json.classMinValue = currBreak[0]
    json.label = `${json.classMinValue}-${json.classMaxValue}` // TODO: handle duplicate max/min values between adjacent classes
    json.description = ''
    json.symbol = createSymbol(baseSymbol, colorRamp[index], type)
    return json
  })
}

function createUniqueValueInfos () {

}

function createColorRamp (breaks, classification) {
  const ramp = classification !== undefined ? classification.colorRamp : _.cloneDeep(renderers.algorithmicColorRamp)
  const rampOptions = {
    rampDetails: ramp,
    breakCount: breaks.length
  }
  // // TODO: tidy this up, but don't alter this check
  // // if the user has passed in classification options
  // if (options.params.classificationDef) {
  //   const classification = options.params.classificationDef
  //   if (classification.colorRamp) rampOptions.rampDetails = classification.colorRamp
  // }

  if (rampOptions.rampDetails.type === 'multipart' && rampOptions.rampDetails.colorRamps) {
    return createMultipartRamp(rampOptions)
  } else if (rampOptions.rampDetails.type === 'algorithmic') {
    return createAlgorithmicRamp(rampOptions)
  } else {
    console.log('Incorrect color ramp type: ', rampOptions.rampDetails.type)
  }
}
