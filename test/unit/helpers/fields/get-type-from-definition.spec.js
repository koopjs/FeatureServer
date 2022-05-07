const should = require('should') // eslint-disable-line
const getTypeFromDefinition = require('../../../../lib/helpers/fields/get-type-from-definition')

describe('getTypeFromDefinition', () => {
  it('no definition should default to string', () => {
    const result = getTypeFromDefinition()
    result.should.equal('esriFieldTypeString')
  })

  it('string', () => {
    getTypeFromDefinition('String').should.equal('esriFieldTypeString')
    getTypeFromDefinition('string').should.equal('esriFieldTypeString')
  })

  it('double', () => {
    getTypeFromDefinition('Double').should.equal('esriFieldTypeDouble')
    getTypeFromDefinition('double').should.equal('esriFieldTypeDouble')
  })

  it('integer', () => {
    getTypeFromDefinition('Integer').should.equal('esriFieldTypeInteger')
    getTypeFromDefinition('integer').should.equal('esriFieldTypeInteger')
  })

  it('date', () => {
    getTypeFromDefinition('Date').should.equal('esriFieldTypeDate')
    getTypeFromDefinition('date').should.equal('esriFieldTypeDate')
  })

  it('blob', () => {
    getTypeFromDefinition('Blob').should.equal('esriFieldTypeBlob')
    getTypeFromDefinition('blob').should.equal('esriFieldTypeBlob')
  })

  it('geometry', () => {
    getTypeFromDefinition('Geometry').should.equal('esriFieldTypeGeometry')
    getTypeFromDefinition('geometry').should.equal('esriFieldTypeGeometry')
  })

  it('globalid', () => {
    getTypeFromDefinition('GlobalID').should.equal('esriFieldTypeGlobalID')
    getTypeFromDefinition('globalid').should.equal('esriFieldTypeGlobalID')
  })

  it('guid', () => {
    getTypeFromDefinition('GUID').should.equal('esriFieldTypeGUID')
    getTypeFromDefinition('guid').should.equal('esriFieldTypeGUID')
  })

  it('raster', () => {
    getTypeFromDefinition('Raster').should.equal('esriFieldTypeRaster')
    getTypeFromDefinition('raster').should.equal('esriFieldTypeRaster')
  })

  it('single', () => {
    getTypeFromDefinition('Single').should.equal('esriFieldTypeSingle')
    getTypeFromDefinition('single').should.equal('esriFieldTypeSingle')
  })

  it('small-integer', () => {
    getTypeFromDefinition('SmallInteger').should.equal('esriFieldTypeSmallInteger')
    getTypeFromDefinition('smallinteger').should.equal('esriFieldTypeSmallInteger')
  })

  it('xml', () => {
    getTypeFromDefinition('XML').should.equal('esriFieldTypeXML')
    getTypeFromDefinition('xml').should.equal('esriFieldTypeXML')
  })
})
