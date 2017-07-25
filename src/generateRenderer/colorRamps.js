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
  const { rampDetails, breakCount = 7 } = options
  if (rampDetails.type !== 'algorithmic') return
  let colorRamp = chroma.scale([rampDetails.fromColor.slice(0, 3), rampDetails.toColor.slice(0, 3)])
  let ramp = []
  switch (rampDetails.algorithm) {
    case 'esriHSVAlgorithm': // using HSV & hsl interchangeably
      ramp = colorRamp.mode('hsl').colors(breakCount, 'rgb')
      break
    case 'esriCIELabAlgorithm':
      ramp = colorRamp.mode('lab').colors(breakCount, 'rgb')
      break
    case 'esriLabLChAlgorithm':
      ramp = colorRamp.mode('lch').colors(breakCount, 'rgb')
      break
    default:
      ramp = colorRamp.mode('hsl').colors(breakCount, 'rgb')
      break
  }
  return ramp
}
