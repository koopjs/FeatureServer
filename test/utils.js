const { detectType, esriTypeMap } = require('../src/utils')

describe('Detect Types', () => {
  describe('detectType', () => {
    it('should return correct string representation of a values data type', () => {
      detectType(1).should.equal('Integer')
      detectType(100.1).should.equal('Double')
      detectType('test').should.equal('String')
      detectType(new Date()).should.equal('Date')
      detectType(new Date().toISOString()).should.equal('Date')
    })
  })

  describe('esriTypeMap', () => {
    it('should return correct string representation of a values data type', () => {
      esriTypeMap('Integer').should.equal('esriFieldTypeInteger')
      esriTypeMap('Double').should.equal('esriFieldTypeDouble')
      esriTypeMap('String').should.equal('esriFieldTypeString')
      esriTypeMap('Date').should.equal('esriFieldTypeDate')
      esriTypeMap('esriFieldTypeBlob').should.equal('esriFieldTypeBlob')
      esriTypeMap('esriFieldTypeDate').should.equal('esriFieldTypeDate')
      esriTypeMap('esriFieldTypeDouble').should.equal('esriFieldTypeDouble')
      esriTypeMap('esriFieldTypeGeometry').should.equal('esriFieldTypeGeometry')
      esriTypeMap('esriFieldTypeGlobalID').should.equal('esriFieldTypeGlobalID')
      esriTypeMap('esriFieldTypeGUID').should.equal('esriFieldTypeGUID')
      esriTypeMap('esriFieldTypeInteger').should.equal('esriFieldTypeInteger')
      esriTypeMap('esriFieldTypeRaster').should.equal('esriFieldTypeRaster')
      esriTypeMap('esriFieldTypeSingle').should.equal('esriFieldTypeSingle')
      esriTypeMap('esriFieldTypeSmallInteger').should.equal('esriFieldTypeSmallInteger')
      esriTypeMap('esriFieldTypeString').should.equal('esriFieldTypeString')
      esriTypeMap('esriFieldTypeXML').should.equal('esriFieldTypeXML')
      esriTypeMap('esriFieldTypeInteger').should.equal('esriFieldTypeInteger')
      esriTypeMap('esriFieldTypeDouble').should.equal('esriFieldTypeDouble')
      esriTypeMap('esriFieldTypeString').should.equal('esriFieldTypeString')
      esriTypeMap('esriFieldTypeDate').should.equal('esriFieldTypeDate')
    })
  })
})
