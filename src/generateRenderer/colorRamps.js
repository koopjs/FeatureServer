const chroma = require('chroma-js')

module.exports = { multipartColorRamp, algorithmicColorRamp }

/**
*
* generate multipart color ramp
*
* @param {array} options
* @return {array} algorithmic colorRamps
*/
function multipartColorRamp (options) {
  let {
    type = 'multipart',
    colorRamps
  } = options
  if (!type === 'multipart' && colorRamps.length < 1) return
  return colorRamps.map((colorRamp) => { return algorithmicColorRamp(colorRamp) })
}

/**
*
* generate algorithmic color ramp
*
* @param {array} options
* @return {array} colorRamp
*/
function algorithmicColorRamp (options) {
  // TODO: add value count check for a uniqueValueDef color ramp
  const {
    type = 'algorithmic',
    colorRamps,
    fromColor = [0, 255, 0],
    toColor = [0, 0, 255],
    algorithm = 'HSVAlgorithm',
    breakCount = 7,
    valueCount
  } = options
  if (!type === 'algorithmic' || (!type === 'multipart' && !colorRamps.length >= 1)) return
  if (valueCount < breakCount) {
    // TODO: cleaner handle when number of values is less than breaks
    console.log('More breaks than available data.')
    return
  }

  let colorRamp = chroma.scale([fromColor, toColor])
  switch (algorithm) {
    case 'HSVAlgorithm': // using HSV & hsl interchangeably
      return colorRamp.mode('hsl').colors(breakCount, 'rgb')
    case 'CIELabAlgorithm':
      return colorRamp.mode('lab').colors(breakCount, 'rgb')
    case 'LabLChAlgorithm':
      return colorRamp.mode('lch').colors(breakCount, 'rgb')
    default:
      return colorRamp.mode('hsl').colors(breakCount, 'rgb')
  }
}
