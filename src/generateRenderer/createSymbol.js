const _ = require('lodash')

module.exports = createSymbol

const renderers = {
  fillSymbol: require('../../templates/renderers/fill-symbol.json'), // TODO: remove if other templates are correct
  point: require('../../templates/renderers/point.json'),
  line: require('../../templates/renderers/line.json'),
  polygon: require('../../templates/renderers/polygon.json')
}

function createSymbol (baseSymbol, color, type) {
  const symbol = _.cloneDeep(baseSymbol) || symbolTemplate(type) // TODO: figure out why cloneDeep is necessary
  symbol.color = color
  return symbol
}

function symbolTemplate (options) {
  const geometryType = options // TODO: have this be a real check! this is a placeholder
  switch (geometryType) {
    case 'esriGeometryPoint': return _.cloneDeep(renderers.point.symbol)
    case 'esriGeometryLine': return _.cloneDeep(renderers.line.symbol)
    case 'esriGeometryPolygon': return _.cloneDeep(renderers.polygon.symbol)
    default: return _.cloneDeep(renderers.point.symbol)
  }
}
