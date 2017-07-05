/* global describe, it, beforeEach */
const _ = require('lodash')
const { multipartRamp, algorithmicRamp } = require('../src/colorRamps')
const algorithmicColorRamp = require('./fixtures/ramp-algorithmic.json')
const multipartColorRamp = require('./fixtures/ramp-multipart.json')

describe('Generate renderer operations', () => {
  describe('when creating an algorithmic color ramp', () => {
    let options
    beforeEach(() => {
      options = _.cloneDeep(algorithmicColorRamp)
    })
    it('should use default values', () => {
      ['type', 'toColor', 'fromColor', 'algorithm', 'numBreaks'].forEach((k) => delete options[k])
      const response = algorithmicRamp(options)
      response.length.should.equal(7)
      response[0].should.deepEqual([0, 255, 0])
      response[2].should.deepEqual([0, 255, 170])
      response[6].should.deepEqual([0, 0, 255])
    })
    describe('using the HSV algorithm', () => {
      it('should return correct hsv color ramp', () => {
        const response = algorithmicRamp(options)
        response.should.be.an.instanceOf(Array)
        response.length.should.equal(9)
        response[3].should.be.an.instanceOf(Array)
        response[3].length.should.equal(3)
        response[3].should.deepEqual([ 0, 255, 191 ])
      })
      it('should return correct number of breaks', () => {
        options.numBreaks = 13
        const response = algorithmicRamp(options)
        response.length.should.equal(13)
      })
      it('should change ramp colors when toColor is changed', () => {
        options.toColor = [50, 173, 23]
        const response = algorithmicRamp(options)
        response[3].should.deepEqual([ 25, 223, 10 ])
      })
    })
    describe('using the LAB algorithm', () => {
      it('should return correct lab color ramp', () => {
        options.algorithm = 'esriCIELabAlgorithm'
        const response = algorithmicRamp(options)
        response.should.be.an.instanceOf(Array)
        response.length.should.equal(9)
        response[3].should.be.an.instanceOf(Array)
        response[3].length.should.equal(3)
        response[3].should.deepEqual([ 123, 174, 141 ])
      })
    })
    describe('using the LCH algorithm', () => {
      it('should return correct lch color ramp', () => {
        options.algorithm = 'esriLabLChAlgorithm'
        const response = algorithmicRamp(options)
        response.should.be.an.instanceOf(Array)
        response.length.should.equal(9)
        response[3].should.be.an.instanceOf(Array)
        response[3].length.should.equal(3)
        response[3].should.deepEqual([ 0, 206, 237 ])
      })
    })
  })
  describe('when creating a multipart color ramp', () => {
    let options
    beforeEach(() => {
      options = _.cloneDeep(multipartColorRamp)
    })
    it('should return multiple color ramps', () => {
      const response = multipartRamp(options)
      response.should.be.an.instanceOf(Array)
      response.length.should.equal(3)
    })
    it('should return correct color ramps that have different algorithms', () => {
      const response = multipartRamp(options)
      response[2].should.be.an.instanceOf(Array)
      response[2].length.should.equal(7)
      response[0][7].should.deepEqual([ 0, 64, 255 ])
      response[1][7].should.deepEqual([ 83, 58, 233 ])
      response[0].length.should.equal(response[1].length)
      response[1].length.should.not.equal(response[2].length)
    })
  })
})
