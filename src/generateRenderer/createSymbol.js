const _ = require('lodash')

module.exports = createSymbol

const renderers = {
  fillSymbol: require('../../templates/renderers/fill-symbol.json')
}

function createSymbol (breakCount, ramp) {
  // TODO: handle different symbol type (i.e., point, polyline, polygon)
  const json = _.cloneDeep(renderers.fillSymbol)
  json.color = ramp
  return json
}
