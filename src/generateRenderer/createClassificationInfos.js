const _ = require('lodash')
const { createMultipartRamp, createAlgorithmicRamp } = require('./colorRamps')
const createSymbol = require('./createSymbol')

module.exports = { createClassBreakInfos, createUniqueValueInfos }

const renderers = {
  classBreakInfo: require('../../templates/renderers/classBreakInfo.json'),
  uniqueValueInfo: require('../../templates/renderers/uniqueValueInfo.json'),
  algorithmicColorRamp: require('../../templates/renderers/algorithmicColorRamp.json')
}

function createClassBreakInfos (options) {
  const ramps = createColorRamp(options)
  return options.classBreaks.map((currBreak, index) => {
    const json = _.cloneDeep(renderers.classBreakInfo)
    json.classMaxValue = currBreak[1]
    json.classMinValue = currBreak[0]
    json.label = `${json.classMinValue}-${json.classMaxValue}` // TODO: handle duplicate max/min values between adjacent classes
    json.description = ''
    json.symbol = createSymbol(options.breakCount, ramps[index])
    return json
  })
}

function createUniqueValueInfos () {

}

function createColorRamp (options) {
  const rampOptions = {
    rampDetails: _.cloneDeep(renderers.algorithmicColorRamp),
    breakCount: options.classBreaks.length
  }
  // TODO: tidy this up, but don't alter this check
  // if the user has passed in classification options
  if (options.params.classificationDef) {
    const classification = options.params.classificationDef
    if (classification.colorRamp) rampOptions.rampDetails = classification.colorRamp
  }

  if (rampOptions.rampDetails.type === 'multipart' && rampOptions.rampDetails.colorRamps) {
    return createMultipartRamp(rampOptions)
  } else if (rampOptions.rampDetails.type === 'algorithmic') {
    return createAlgorithmicRamp(rampOptions)
  } else {
    console.log('Incorrect color ramp type: ', rampOptions.rampDetails.type)
  }
}
