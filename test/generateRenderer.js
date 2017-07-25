/* global describe, it, beforeEach */
const _ = require('lodash')
const snow = require('./fixtures/snow.json')
const trees = require('./fixtures/trees.json')
const generateRenderer = require('../src/generateRenderer')
const { createClassBreakInfos, createUniqueValueInfos } = require('../src/generateRenderer/createClassificationInfos')
const { createMultipartRamp, createAlgorithmicRamp } = require('../src/generateRenderer/colorRamps')

const algorithmicRamp = require('./fixtures/generateRenderer/ramp-algorithmic.json')
const multipartRamp = require('./fixtures/generateRenderer/ramp-multipart.json')
const classBreaksDef = require('./fixtures/generateRenderer/classBreaksDef.json')
const uniqueValueDef = require('./fixtures/generateRenderer/uniqueValueDef')
const classBreakInfos = require('./fixtures/generateRenderer/classBreakInfos.json')
const uniqueValueInfos = require('./fixtures/generateRenderer/uniqueValueInfos.json')
const ProviderStatsClassBreaks = require('./fixtures/generateRenderer/provider-statistics-with-classBreaks.json')

describe('Generate renderer operations', () => {
  let data
  beforeEach(() => {
    data = _.cloneDeep(snow)
  })
  describe('when statistics passed in', () => {
    beforeEach(() => {
      data = _.cloneDeep(ProviderStatsClassBreaks)
    })
    describe('do not exist', () => {
      it('should throw an error and return an empty object', () => {
        let options = {}
        data.statistics = []
        const response = generateRenderer(data, options)
        response.should.deepEqual({})
      })
    })
    it('should properly return a renderer', () => {
      let options = {}
      const response = generateRenderer(data, options)
      response.minValue.should.equal(80)
      response.classBreakInfos.length.should.equal(9)
      response.classBreakInfos[0].label.should.equal('80-147')
      response.classBreakInfos[0].symbol.color.should.deepEqual([0, 255, 0])
      response.classBreakInfos[4].symbol.color.should.deepEqual([0, 255, 255])
      response.classBreakInfos[8].symbol.color.should.deepEqual([0, 0, 255])
      response.classBreakInfos[0].symbol.type.should.equal('esriSMS')
    })
  })
  describe('when a class breaks classification passed in', () => {
    let options
    beforeEach(() => { options = _.cloneDeep(classBreaksDef) })
    describe('does not exist', () => {
      it('should throw an error and return an empty object', () => {
        options = {}
        const response = generateRenderer(data, options)
        response.should.deepEqual({})
      })
    })
    describe('with no input data', () => {
      it('should throw and error and return an empty object', () => {
        data = {}
        const response = generateRenderer(data, options)
        response.should.deepEqual({})
      })
    })
    describe('returns no queried features', () => {
      it('should throw and error and return an empty object', () => {
        options.where = 'latitude>1000'
        const response = generateRenderer(data, options)
        response.should.deepEqual({})
      })
    })
    describe('has correct parameters', () => {
      it('should properly return a renderer', () => {
        const response = generateRenderer(data, options)
        response.type.should.equal('classBreaks')
        response.minValue.should.equal(0)
        response.classBreakInfos.length.should.equal(9)
        response.classBreakInfos[0].classMinValue.should.equal(0)
        response.classBreakInfos[0].label.should.equal('0-1.4555555555555555')
        response.classBreakInfos[0].symbol.color.should.deepEqual([115, 76, 0])
        response.classBreakInfos[4].symbol.color.should.deepEqual([198, 39, 0])
        response.classBreakInfos[8].symbol.color.should.deepEqual([255, 25, 86])
        response.classBreakInfos[0].symbol.type.should.equal('esriSLS')
      })
      it('should use a default symbol and color ramp', () => {
        delete options.classificationDef.baseSymbol
        delete options.classificationDef.colorRamp
        const response = generateRenderer(data, options)
        response.type.should.equal('classBreaks')
        response.minValue.should.equal(0)
        response.classBreakInfos.length.should.equal(9)
        response.classBreakInfos[0].classMinValue.should.equal(0)
        response.classBreakInfos[0].label.should.equal('0-1.4555555555555555')
        response.classBreakInfos[0].symbol.color.should.deepEqual([0, 255, 0])
        response.classBreakInfos[4].symbol.color.should.deepEqual([0, 255, 255])
        response.classBreakInfos[8].symbol.color.should.deepEqual([0, 0, 255])
        response.classBreakInfos[0].symbol.type.should.equal('esriSMS')
      })
      describe('has normalization', () => {
        it('should properly return log normalized values', () => {
          options.classificationDef.normalizationType = 'esriNormalizeByLog'
          const response = generateRenderer(data, options)
          response.type.should.equal('classBreaks')
          response.minValue.should.equal(0)
          response.classBreakInfos.length.should.equal(9)
          response.classBreakInfos[0].classMinValue.should.equal(0)
          response.classBreakInfos[0].label.should.equal('0-0.1241412550728627')
        })
      })
    })
  })

  describe('when a unique value classification passed in', () => {
    let options
    beforeEach(() => {
      data = _.cloneDeep(trees)
      options = _.cloneDeep(uniqueValueDef)
    })
    describe('does not exist', () => {
      it('should throw an error and return an empty object', () => {
        options = {}
        const response = generateRenderer(data, options)
        response.should.deepEqual({})
      })
    })
    describe('with no input data', () => {
      it('should throw and error and return an empty object', () => {
        data = {}
        const response = generateRenderer(data, options)
        response.should.deepEqual({})
      })
    })
    describe('returns no queried features', () => {
      it('should throw and error and return an empty object', () => {
        options.where = 'latitude>1000'
        const response = generateRenderer(data, options)
        response.should.deepEqual({})
      })
    })
    describe.only('has correct parameters', () => {
      it('should properly return a renderer', () => {
        const response = generateRenderer(data, options)
        response.type.should.equal('uniqueValue')
        response.field1.should.equal('Genus')
        response.fieldDelimiter.should.equal(', ')
        response.uniqueValueInfos.length.should.equal(162)
        response.uniqueValueInfos[0].value.should.equal('MAGNOLIA')
        response.uniqueValueInfos[0].count.should.equal(5908)
        response.uniqueValueInfos[0].label.should.equal('MAGNOLIA')
        response.uniqueValueInfos[0].symbol.color.should.deepEqual([115, 76, 0])
        response.uniqueValueInfos[81].symbol.color.should.deepEqual([198, 39, 0])
        response.uniqueValueInfos[161].symbol.color.should.deepEqual([255, 25, 86])
        response.uniqueValueInfos[0].symbol.type.should.equal('esriSLS')
      })
      it('should use a default symbol and color ramp', () => {
        delete options.classificationDef.baseSymbol
        delete options.classificationDef.colorRamp
        const response = generateRenderer(data, options)
        response.type.should.equal('uniqueValue')
        response.field1.should.equal('Genus')
        response.fieldDelimiter.should.equal(', ')
        response.uniqueValueInfos.length.should.equal(162)
        response.uniqueValueInfos[0].value.should.equal('MAGNOLIA')
        response.uniqueValueInfos[0].count.should.equal(5908)
        response.uniqueValueInfos[0].label.should.equal('MAGNOLIA')
        response.uniqueValueInfos[0].symbol.color.should.deepEqual([0, 255, 0])
        response.uniqueValueInfos[81].symbol.color.should.deepEqual([0, 253, 255])
        response.uniqueValueInfos[161].symbol.color.should.deepEqual([0, 0, 255])
        response.uniqueValueInfos[0].symbol.type.should.equal('esriSMS')
      })
    })
  })
  describe('when creating class break infos', () => {
    it('should properly return class break infos', () => {
      const options = _.cloneDeep(classBreakInfos)
      const classification = options.params.classificationDef
      const classBreaks = options.classBreaks
      const response = createClassBreakInfos(classBreaks, classification)
      response.length.should.equal(9)
      response[0].classMinValue.should.equal(0)
      response[0].label.should.equal('0-0.1241412550728627')
      response[0].symbol.color.should.deepEqual([115, 76, 0])
      response[4].symbol.color.should.deepEqual([ 198, 39, 0 ])
      response[8].symbol.color.should.deepEqual([255, 25, 86])
    })
  })
  describe('when creating unique value infos', () => {
    it('should properly return unqiue value infos', () => {
      const options = _.cloneDeep(uniqueValueInfos)
      const classification = options.params.classificationDef
      const breaks = options.uniqueValue
      const response = createUniqueValueInfos(breaks, classification)
      response.length.should.equal(5)
      response[0].symbol.color.should.deepEqual([115, 76, 0])
      response[2].symbol.color.should.deepEqual([ 198, 39, 0 ])
      response[4].symbol.color.should.deepEqual([255, 25, 86])
    })
  })
  describe('when creating a color ramp that is', () => {
    describe('algorithmic', () => {
      let options
      beforeEach(() => {
        options = {}
        options.rampDetails = _.cloneDeep(algorithmicRamp)
        options.breakCount = 9
      })
      it('should use default breakCount', () => {
        delete options.breakCount
        const response = createAlgorithmicRamp(options)
        response.length.should.equal(7)
        response[0].should.deepEqual([0, 255, 0])
        response[2].should.deepEqual([0, 255, 170])
        response[6].should.deepEqual([0, 0, 255])
      })
      describe('using the HSV algorithm', () => {
        it('should return correct hsv color ramp', () => {
          const response = createAlgorithmicRamp(options)
          response.should.be.an.instanceOf(Array)
          response.length.should.equal(9)
          response[3].should.be.an.instanceOf(Array)
          response[3].length.should.equal(3)
          response[3].should.deepEqual([ 0, 255, 191 ])
        })
        it('should return correct number of breaks', () => {
          options.breakCount = 13
          const response = createAlgorithmicRamp(options)
          response.length.should.equal(13)
        })
        it('should change ramp colors when fromColor & toColor are changed', () => {
          options.rampDetails.fromColor = [115, 76, 0]
          options.rampDetails.toColor = [255, 25, 86]
          const response = createAlgorithmicRamp(options)
          response[0].should.deepEqual([115, 76, 0])
          response[4].should.deepEqual([198, 39, 0])
          response[8].should.deepEqual([255, 25, 86])
        })
      })
      describe('using the LAB algorithm', () => {
        beforeEach(() => {
          options.rampDetails.algorithm = 'esriCIELabAlgorithm'
        })
        it('should return correct lab color ramp', () => {
          const response = createAlgorithmicRamp(options)
          response.should.be.an.instanceOf(Array)
          response.length.should.equal(9)
          response[3].should.be.an.instanceOf(Array)
          response[3].length.should.equal(3)
          response[3].should.deepEqual([ 123, 174, 141 ])
        })
        it('should return correct number of breaks', () => {
          options.breakCount = 13
          const response = createAlgorithmicRamp(options)
          response.length.should.equal(13)
        })
        it('should change ramp colors when toColor is changed', () => {
          options.rampDetails.toColor = [50, 173, 23]
          const response = createAlgorithmicRamp(options)
          response[3].should.deepEqual([ 35, 224, 14 ])
        })
      })
      describe('using the LCH algorithm', () => {
        beforeEach(() => {
          options.rampDetails.algorithm = 'esriLabLChAlgorithm'
        })
        it('should return correct lch color ramp', () => {
          const response = createAlgorithmicRamp(options)
          response.should.be.an.instanceOf(Array)
          response.length.should.equal(9)
          response[3].should.be.an.instanceOf(Array)
          response[3].length.should.equal(3)
          response[3].should.deepEqual([ 0, 206, 237 ])
        })
        it('should return correct number of breaks', () => {
          options.breakCount = 13
          const response = createAlgorithmicRamp(options)
          response.length.should.equal(13)
        })
        it('should change ramp colors when toColor is changed', () => {
          options.rampDetails.toColor = [50, 173, 23]
          const response = createAlgorithmicRamp(options)
          response[3].should.deepEqual([ 37, 224, 13 ])
        })
      })
    })
    describe('multipart', () => {
      let options
      beforeEach(() => {
        options = {}
        options.rampDetails = _.cloneDeep(multipartRamp)
        options.breakCount = 9
      })
      it('should return multiple color ramps', () => {
        const response = createMultipartRamp(options)
        response.should.be.an.instanceOf(Array)
        response.length.should.equal(3)
      })
      it('should return correct color ramps that have different algorithms', () => {
        const response = createMultipartRamp(options)
        response[2].should.be.an.instanceOf(Array)
        response[2].length.should.equal(9)
        response[0][7].should.deepEqual([ 0, 64, 255 ])
        response[1][7].should.deepEqual([ 83, 58, 233 ])
        response[0].length.should.equal(response[1].length)
        response[1].length.should.equal(response[2].length) // TODO: allow differnt breakCounts for each ramp?
      })
    })
  })
})
