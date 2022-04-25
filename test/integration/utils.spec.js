const { detectType } = require('../../lib/utils')

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
})
