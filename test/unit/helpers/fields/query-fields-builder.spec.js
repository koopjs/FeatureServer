const should = require('should') // eslint-disable-line
should.config.checkProtoEql = false
const QueryFieldsBuilder = require('../../../../lib/helpers/fields/query-fields-builder')

describe('QueryFieldsBuilder', () => {
  it('create fields from definitions, add OBJECTID', () => {
    const result = QueryFieldsBuilder.create({
      fields: [
        { name: 'foo', type: 'String' }
      ]
    })
    result.should.deepEqual([{
      name: 'OBJECTID',
      alias: 'OBJECTID',
      type: 'esriFieldTypeOID',
      sqlType: 'sqlTypeInteger',
      domain: null,
      defaultValue: null
    }, {
      name: 'foo',
      alias: 'foo',
      type: 'esriFieldTypeString',
      sqlType: 'sqlTypeOther',
      length: 128,
      domain: null,
      defaultValue: null
    }])
  })

  it('create fields from definitions, assign as OBJECTID', () => {
    const result = QueryFieldsBuilder.create({
      fields: [
        { name: 'foo', type: 'Integer' }
      ],
      idField: 'foo'
    })
    result.should.deepEqual([{
      name: 'foo',
      alias: 'foo',
      type: 'esriFieldTypeOID',
      sqlType: 'sqlTypeInteger',
      domain: null,
      defaultValue: null
    }])
  })

  it('create fields from definitions limit to outfields', () => {
    const result = QueryFieldsBuilder.create({
      fields: [
        { name: 'foo', type: 'String' },
        { name: 'bar', type: 'String' },
        { name: 'hello', type: 'String' }
      ],
      outFields: 'foo'
    })
    result.should.deepEqual([{
      name: 'foo',
      alias: 'foo',
      type: 'esriFieldTypeString',
      sqlType: 'sqlTypeOther',
      length: 128,
      domain: null,
      defaultValue: null
    }])
  })
})
