const Joi = require('joi')
const featuresJson = require('../templates/features.json')
const fieldJson = require('../templates/field.json')

describe('Template content', () => {
  describe('features.json', () => {
    it('should conform to the prescribed schema', () => {
      // Use Joi to build expected schema and test against JSON.
      const schema = Joi.object().keys({
        'objectIdFieldName': Joi.string().valid('OBJECTID'),
        'globalIdFieldName': Joi.string().valid(''),
        'geometryType': Joi.string().valid('esriGeometryPoint'),
        'spatialReference': Joi.object().keys({
          'wkid': Joi.number().valid(4326)
        }),
        'fields': Joi.array().max(0),
        'features': Joi.array().max(0),
        'exceededTransferLimit': Joi.boolean().valid(false)
      })
      Joi.validate(featuresJson, schema, {presence: 'required'}).should.have.property('error', null)
    })
  })

  describe('field.json', () => {
    it('should conform to the prescribed schema', () => {
      // Use Joi to build expected schema and test against JSON.
      const schema = Joi.object().keys({
        'name': Joi.string(),
        'type': Joi.string(),
        'alias': Joi.string(),
        'sqlType': Joi.string().valid('sqlTypeOther'),
        'domain': Joi.valid(null),
        'defaultValue': Joi.valid(null)
      })
      Joi.validate(fieldJson, schema, {presence: 'required'}).should.have.property('error', null)
    })
  })
})
