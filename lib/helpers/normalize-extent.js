const joi = require('joi')

const esriExtentSchema = joi.object({
  xmin: joi.number().required(),
  xmax: joi.number().required(),
  ymin: joi.number().required(),
  ymax: joi.number().required(),
  type: joi.string().optional(),
  spatialReference: joi.object().keys({
    wkid: joi.number().integer().optional(),
    latestWkid: joi.number().integer().optional()
  }).optional()
}).unknown()

const simpleArraySchema = joi.array().items(joi.number())
const cornerArraySchema = joi.array().items(joi.array().items(joi.number()))

module.exports = function (input, spatialReference) {
  if (!input) return undefined

  const { value: arrayExent } = simpleArraySchema.validate(input)

  if (arrayExent) {
    return simpleArrayToEsriExtent(arrayExent, spatialReference)
  }

  const { value: cornerArrayExtent } = cornerArraySchema.validate(input)

  if (cornerArrayExtent) {
    return cornerArrayToEsriExtent(cornerArrayExtent, spatialReference)
  }

  const { value: esriExtent } = esriExtentSchema.validate(input)

  if (esriExtent) {
    return { ...esriExtent, spatialReference }
  }

  throw new Error('invalid extent passed in metadata')
}

function simpleArrayToEsriExtent (arrayExent, spatialReference) {
  return {
    xmin: arrayExent[0],
    ymin: arrayExent[1],
    xmax: arrayExent[2],
    ymax: arrayExent[3],
    spatialReference
  }
}

function cornerArrayToEsriExtent (cornerArrayExtent, spatialReference) {
  return {
    xmin: cornerArrayExtent[0][0],
    ymin: cornerArrayExtent[0][1],
    xmax: cornerArrayExtent[1][0],
    ymax: cornerArrayExtent[1][1],
    spatialReference
  }
}
