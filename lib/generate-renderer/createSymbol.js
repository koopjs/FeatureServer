const _ = require('lodash')
const {
  PointRenderer,
  LineRenderer,
  PolygonRenderer
} = require('../helpers')

module.exports = { createSymbol }

function createSymbol (baseSymbol, color, geomType) {
  const symbol = _.cloneDeep(baseSymbol) || symbolTemplate(geomType)
  symbol.color = color
  return symbol
}

function symbolTemplate (geomType) {
  let renderer = new PointRenderer()

  if (geomType === 'esriGeometryLine') {
    renderer = new LineRenderer()
  } else if (geomType === 'esriGeometryPolygon') {
    renderer = new PolygonRenderer()
  }

  return renderer.symbol
}
