const should = require('should') // eslint-disable-line
const proxyquire = require('proxyquire')
const sinon = require('sinon')

describe('generate-render', () => {
  it('should render precalculated statistics', () => {
    const createClassificationInfosSpy = sinon.spy(function () {
      return 'class-break-infos'
    })
    const generateRenderer = proxyquire('../../../lib/generate-renderer', {
      './createClassificationInfos' : {
        createClassBreakInfos: createClassificationInfosSpy
      }
    })

    const result = generateRenderer({
      statistics: {
        classBreaks: [
          [0, 10], [21, 30], [11, 20]
        ]
      }
    })

    result.should.deepEqual({
      type: 'classBreaks',
      field: '',
      classificationMethod: '',
      minValue: 0,
      classBreakInfos: 'class-break-infos'
    })
    createClassificationInfosSpy.calledOnce.should.equal(true)
    createClassificationInfosSpy.firstCall.args.should.deepEqual([
      [[0, 10], [11, 20], [21, 30]],
      {},
      undefined
    ])
  })

  it.skip('should calculate breaks and use classBreaksDef for renderer', () => {
    const winnowSpy = sinon.spy(function () {
      return [[0, 10], [11, 20], [21, 30]]
    })

    const getGeometrySpy = sinon.spy(function () {
      return ''
    })

    const generateRenderer = proxyquire('../../../lib/generate-renderer', {
      'winnow': {
        query: winnowSpy
      },
      '../helpers': {
        getGeometryTypeFromGeojson: getGeometrySpy
      },
      './createClassificationInfos' : {
        createClassBreakInfos: createClassificationInfosSpy
      }
    })
  })
})
