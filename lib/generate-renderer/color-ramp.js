const chroma = require('chroma-js')
const { CodedError } = require('../helpers/errors')

module.exports = { createColorRamp }

function createColorRamp (params = {}) {
  const {
    breaks,
    colorRamps,
    type = 'algorithmic',
    fromColor = [0, 255, 0],
    toColor = [0, 0, 255],
    algorithm = 'HSVAlgorithm'
  } = params

  if (!breaks || breaks.length === 0) {
    throw new Error('Must supply breaks')
  }

  if (type === 'algorithmic') {
    return createAlgorithmicRamp({
      fromColor,
      toColor,
      algorithm,
      breakCount: breaks.length
    })
  }

  if (type === 'multipart') {
    return createMultipartRamp({ colorRamps, breakCount: breaks.length })
  }

  throw new CodedError(`Invalid color ramp type: ${type}`, 400)
}

function createMultipartRamp (options) {
  const { colorRamps, breakCount } = options

  if (!colorRamps || !Array.isArray(colorRamps)) {
    throw new CodedError(
      'Multipart color-ramps need a valid color-ramp configuration array'
    )
  }

  return colorRamps.map((ramp) => {
    return createAlgorithmicRamp({
      ...ramp,
      breakCount: breakCount
    })
  })
}

function createAlgorithmicRamp (options) {
  const { fromColor, toColor, algorithm, breakCount } = options
  const colorRamp = chroma.scale([fromColor.slice(0, 3), toColor.slice(0, 3)])

  if (algorithm === 'esriCIELabAlgorithm') {
    return colorRamp.mode('lab').colors(breakCount, 'rgb')
  }

  if (algorithm === 'esriLabLChAlgorithm') {
    return colorRamp.mode('lch').colors(breakCount, 'rgb')
  }

  return colorRamp.mode('hsl').colors(breakCount, 'rgb')
}
