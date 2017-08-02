const _ = require('lodash')

module.exports = { createSymbol }

const renderers = {
  fillSymbol: require('../../templates/renderers/symbology/fill-symbol.json'), // TODO: remove if other templates are correct
  point: require('../../templates/renderers/symbology/point.json'),
  line: require('../../templates/renderers/symbology/line.json'),
  polygon: require('../../templates/renderers/symbology/polygon.json')
}

function createSymbol (baseSymbol, color, geomType) {
  const symbol = _.cloneDeep(baseSymbol) || symbolTemplate(geomType) // TODO: figure out why cloneDeep is necessary
  symbol.color = color
  return symbol
}

function symbolTemplate (geomType) {
  switch (geomType) {
    case 'Point': return _.cloneDeep(renderers.point.symbol)
    case 'Line': return _.cloneDeep(renderers.line.symbol)
    case 'Polygon': return _.cloneDeep(renderers.polygon.symbol)
    default: return _.cloneDeep(renderers.point.symbol)
  }
}
