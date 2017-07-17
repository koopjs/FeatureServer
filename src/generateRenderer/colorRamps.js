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
  const { type = 'multipart', colorRamps } = options.rampDetails
  if (!type === 'multipart' && !colorRamps.length >= 1) return
  return colorRamps.map((colorRamp) => { return createAlgorithmicRamp(colorRamp) })
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
  if (!rampDetails.type === 'algorithmic') return
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
