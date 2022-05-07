const should = require('should') // eslint-disable-line
const getTypeFromValue = require('../../../../lib/helpers/fields/get-type-from-value')

describe('getTypeFromValue', () => {
  it('no value should default to string', () => {
    const result = getTypeFromValue()
    result.should.equal('esriFieldTypeString')
  })

  it('string', () => {
    getTypeFromValue('some-string').should.equal('esriFieldTypeString')
  })

  it('double', () => {
    getTypeFromValue(3.145678).should.equal('esriFieldTypeDouble')
  })

  it('integer', () => {
    getTypeFromValue(2).should.equal('esriFieldTypeInteger')
  })

  it('date', () => {
    getTypeFromValue(new Date()).should.equal('esriFieldTypeDate')
    getTypeFromValue((new Date()).toISOString()).should.equal('esriFieldTypeDate')
  })
})
