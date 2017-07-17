/* global describe, it, beforeEach */
const _ = require('lodash')
const { createAlgorithmicRamp } = require('../src/generateRenderer/colorRamps')
const algorithmicRamp = require('./fixtures/generateRenderer/ramp-algorithmic.json')
// const multipartRamp = require('./fixtures/generateRenderer/ramp-multipart.json')

describe('Generate renderer operations', () => {
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
        it('should change ramp colors when toColor is changed', () => {
          options.rampDetails.toColor = [50, 173, 23]
          const response = createAlgorithmicRamp(options)
          response[3].should.deepEqual([ 25, 223, 10 ])
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
    // describe('multipart', () => {
    //   let options
    //   options = {}
    //   options.rampDetails = _.cloneDeep(multipartRamp)
    //   options.breakCount = 9
    //   it('should return multiple color ramps', () => {
    //     const response = createMultipartRamp(options)
    //     response.should.be.an.instanceOf(Array)
    //     response.length.should.equal(3)
    //   })
    //   it('should return correct color ramps that have different algorithms', () => {
    //     const response = createMultipartRamp(options)
    //     response[2].should.be.an.instanceOf(Array)
    //     response[2].length.should.equal(7)
    //     response[0][7].should.deepEqual([ 0, 64, 255 ])
    //     response[1][7].should.deepEqual([ 83, 58, 233 ])
    //     response[0].length.should.equal(response[1].length)
    //     response[1].length.should.not.equal(response[2].length)
    //   })
    // })
  })
})
