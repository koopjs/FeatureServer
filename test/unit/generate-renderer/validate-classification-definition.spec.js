/* global describe, it */
const _ = require('lodash')
const should = require('should'); // eslint-disable-line
const validateClassificationDefinition = require('../../../lib/generate-renderer/validate-classification-definition')

describe('when creating a symbol', () => {
  it('throws error with undefined classification definition', () => {
    try {
      const result = validateClassificationDefinition();
      should.fail('should have thrown error');
      
    } catch (error) {
      error.message.should.equal('classification definition is required')
      error.code.should.equal(400);
    }
  })

  it('throws error with unknown classification definition type', () => {
    try {
      const result = validateClassificationDefinition({ type: 'lol'});
      should.fail('should have thrown error');
      
    } catch (error) {
      error.message.should.equal('invalid classification type')
      error.code.should.equal(400);
    }
  })

  it('throws error with unknown base symbol type', () => {
    try {
      const result = validateClassificationDefinition({ type: 'classBreaksDef', baseSymbol: { type: 'foo' }});
      should.fail('should have thrown error');
      
    } catch (error) {
      error.message.should.equal('baseSymbol requires a valid type: esriSMS, esriSLS, esriSFS')
      error.code.should.equal(400);
    }
  })

  it('throws error with undefined base symbol type', () => {
    try {
      const result = validateClassificationDefinition({ type: 'classBreaksDef', baseSymbol: {}});
      should.fail('should have thrown error');
      
    } catch (error) {
      error.message.should.equal('baseSymbol requires a valid type: esriSMS, esriSLS, esriSFS')
      error.code.should.equal(400);
    }
  })

  it('throws error with base symbol type / geometry: line/sms', () => {
    try {
      const result = validateClassificationDefinition({ type: 'classBreaksDef', baseSymbol: { type: 'esriSMS' }}, 'esriGeometryPolyline');
      should.fail('should have thrown error');
      
    } catch (error) {
      error.message.should.equal('Classification defintion uses a base symbol type that is incompatiable with dataset geometry')
      error.code.should.equal(400);
    }
  })

  it('throws error with base symbol type / geometry: polygon/sms', () => {
    try {
      const result = validateClassificationDefinition({ type: 'classBreaksDef', baseSymbol: { type: 'esriSMS' }}, 'esriGeometryPolygon');
      should.fail('should have thrown error');
      
    } catch (error) {
      error.message.should.equal('Classification defintion uses a base symbol type that is incompatiable with dataset geometry')
      error.code.should.equal(400);
    }
  })

  it('throws error with base symbol type / geometry: point/sls', () => {
    try {
      const result = validateClassificationDefinition({ type: 'classBreaksDef', baseSymbol: { type: 'esriSLS' }}, 'esriGeometryPoint');
      should.fail('should have thrown error');
      
    } catch (error) {
      error.message.should.equal('Classification defintion uses a base symbol type that is incompatiable with dataset geometry')
      error.code.should.equal(400);
    }
  })

  it('throws error with unsupport geometry', () => {
    try {
      const result = validateClassificationDefinition({ type: 'classBreaksDef', baseSymbol: { type: 'esriSLS' }}, 'foo');
      should.fail('should have thrown error');
      
    } catch (error) {
      error.message.should.equal('Classification defintion uses a base symbol type that is incompatiable with dataset geometry')
      error.code.should.equal(400);
    }
  })

  it('validates with undefined base symbol', () => {
    try {
      validateClassificationDefinition({ type: 'classBreaksDef' });
      
    } catch (error) {
      should.fail(`should not have thrown error: ${error}`);
    }
  })

  it('validates with base symbol / geometry match', () => {
    try {
      validateClassificationDefinition({ type: 'classBreaksDef', baseSymbol: { type: 'esriSMS'} }, 'esriGeometryPoint');
      
    } catch (error) {
      should.fail(`should not have thrown error: ${error}`);
    }
  })

  it('throws error when unique-value-fields definition is missing uniqueValueFields array', () => {
    try {
      const result = validateClassificationDefinition({ type: 'uniqueValueDef' }, 'esriGeometryPoint', [{ fooz: 'bar'}]);
      should.fail('should have thrown error');
      
    } catch (error) {
      error.message.should.equal('uniqueValueDef requires a classification definition with "uniqueValueFields" array')
      error.code.should.equal(400);
    }
  })

  it('throws error when unique-value-fields definition diverges from classification', () => {
    try {
      const result = validateClassificationDefinition({ type: 'uniqueValueDef', uniqueValueFields: ['foo'] }, 'esriGeometryPoint', [{ fooz: 'bar'}]);
      should.fail('should have thrown error');
      
    } catch (error) {
      error.message.should.equal('Unique value definition fields are incongruous with classification fields: foo : fooz')
      error.code.should.equal(400);
    }
  })
})
