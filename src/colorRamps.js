const chroma = require('chroma-js')

module.exports = { multipartRamp, algorithmicRamp }

/**
*
* generate multipart color ramp
*
* @param {array} options
* @return {array} algorithmic colorRamps
*/
function multipartRamp (options) {
  let {type, colorRamps} = options
  if (!type === 'multipart' && colorRamps.length < 1) return
  return colorRamps.map((colorRamp) => { return algorithmicRamp(colorRamp) })
}

/**
*
* generate algorithmic color ramp
*
* @param {array} options
* @return {array} colorRamp
*/
function algorithmicRamp (options) {
  const {
    type = 'algorithmic',
    colorRamps,
    fromColor = [0, 255, 0],
    toColor = [0, 0, 255],
    algorithm = 'esriHSVAlgorithm',
    numBreaks = 7
  } = options
  if (!type === 'algorithmic' || (!type === 'multipart' && !colorRamps.length >= 1)) return

  let colorRamp = chroma.scale([fromColor, toColor])
  switch (algorithm) {
    case 'esriHSVAlgorithm': // using HSV & hsl interchangeably
      colorRamp = colorRamp.mode('hsl')
      break
    case 'esriCIELabAlgorithm':
      colorRamp = colorRamp.mode('lab')
      break
    case 'esriLabLChAlgorithm':
      colorRamp = colorRamp.mode('lch')
      break
    default:
      colorRamp = colorRamp.mode('hsl')
  }
  return colorRamp.colors(numBreaks, 'rgb')
}
