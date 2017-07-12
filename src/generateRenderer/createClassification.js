const _ = require('lodash')
const { algorithmicColorRamp } = require('./colorRamps')
const createSymbol = require('./createSymbol')

module.exports = { createClassBreakInfos }

const renderers = {
  classBreakInfo: require('../../templates/renderers/classBreakInfo.json')
}

function createClassBreakInfos (classBreaks) {
  const breakCount = classBreaks.length
  const ramps = algorithmicColorRamp({breakCount}) // TODO: handle multipartColorRamp
  return classBreaks.map((currBreak, index) => {
    const json = _.cloneDeep(renderers.classBreakInfo)
    json.classMaxValue = currBreak[1]
    json.classMinValue = currBreak[0]
    json.label = `${json.classMinValue}-${json.classMaxValue}` // TODO: Potentially handle diplicate max/min values between adjacent classes
    json.description = ''
    json.symbol = createSymbol(breakCount, ramps[index])
    return json
  })
}
