const chroma = require('chroma-js')

module.exports = { createMultipartRamp, createAlgorithmicRamp }

/**
*
* generate multipart color ramp
*
* @param {array} options
* @return {array} algorithmic colorRamps
*/
function createMultipartRamp (options) {
  // TODO: determine if we even need multipart ramps. If so, finish & write tests
  const { rampDetails, breakCount = 7 } = options
  const type = rampDetails.type
  const colorRamps = rampDetails.colorRamps

  if (type !== 'multipart' && colorRamps.length < 1) return
  return colorRamps.map((currentRamp) => {
    const rampOptions = {
      rampDetails: currentRamp,
      breakCount: breakCount
    }
    return createAlgorithmicRamp(rampOptions)
  })
}

/**
*
* generate algorithmic color ramp
*
* @param {array} options
* @return {array} colorRamp
*/
function createAlgorithmicRamp (options) {
  // TODO: default breakCount currently isn't being used. breakCount is required
  const { rampDetails, breakCount = 7 } = options
  if (rampDetails.type !== 'algorithmic') return
  let colorRamp = chroma.scale([rampDetails.fromColor.slice(0, 3), rampDetails.toColor.slice(0, 3)])
  switch (rampDetails.algorithm) {
    case 'esriHSVAlgorithm': // using HSV & hsl interchangeably
      return colorRamp.mode('hsl').colors(breakCount, 'rgb')
    case 'esriCIELabAlgorithm':
      return colorRamp.mode('lab').colors(breakCount, 'rgb')
    case 'esriLabLChAlgorithm':
      return colorRamp.mode('lch').colors(breakCount, 'rgb')
    default:
      return colorRamp.mode('hsl').colors(breakCount, 'rgb')
  }
}
