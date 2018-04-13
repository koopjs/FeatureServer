const _ = require('lodash')
const moment = require('moment')
const fieldMap = require('./field-map')
const createFieldAliases = require('./aliases')
const createStatFields = require('./statFields')

module.exports = { computeFieldsFromProperties, computeFieldObject, createStatFields, createFieldAliases }

const templates = {
  server: require('../../templates/server.json'),
  layer: require('../../templates/layer.json'),
  features: require('../../templates/features.json'),
  statistics: require('../../templates/statistics.json'),
  field: require('../../templates/field.json'),
  objectIDField: require('../../templates/oid-field.json')
}

// TODO this should be the only exported function
function computeFieldObject (data, template, options = {}) {
  const metadata = data.metadata || {}
  let metadataFields = metadata.fields

  if (!metadataFields && data.statistics) return computeFieldsFromProperties(data.statistics[0], template, metadata.idField, options).fields
  else if (!metadataFields) return computeAggFieldObject(data, template, options)

  // Handle non-wildcarded outFields
  if (options.outFields && options.outFields !== '*') {
    const outFields = options.outFields.split(/\s*,\s*/)
    metadataFields = metadata.fields.filter(field => {
      if (outFields.indexOf(field.name) > -1) return field
    })
  }
  // Create the fields array based on requested fields
  const fields = metadataFields.map(field => {
    let type = fieldMap[field.type.toLowerCase()] || field.type
    let name = field.name
    let alias = field.alias || field.name

    // If this field is the provider's idField, make it the OBJECTID field
    if (field.name === metadata.idField || field.name.toLowerCase() === 'objectid') {
      name = 'OBJECTID'
      type = 'esriFieldTypeOID'
      alias = 'OBJECTID'
    }
    // Get the template JSON for the field object
    const template = _.cloneDeep(templates.field)
    // Overwrite field-specific template properties
    return Object.assign({}, template, {
      name,
      type,
      alias,
      // Add length property for strings and dates
      length: (type === 'esriFieldTypeString') ? 128 : (type === 'esriFieldTypeDate') ? 36 : undefined
    })
  })

  // If there is no metadata.idField, then an OBJECTID field hasn't yet been created. Add one here.
  if (!fields.find(field => field.name === 'OBJECTID')) fields.push(templates.objectIDField)

  // Ensure the OBJECTID field is first in the array
  fields.unshift(fields.splice(fields.findIndex(field => field.name === 'OBJECTID'), 1)[0])

  return fields
}

/** @type {Array} accepted date formats used by moment.js */
const DATE_FORMATS = [moment.ISO_8601]

/**
 * builds esri json fields object from geojson properties
 *
 * @param  {object} props
 * @param  {string} template
 * @param  {object} options
 * @return {object} fields
 */
function computeFieldsFromProperties (props, template, idField = null, options = {}) {
  const fields = Object.keys(props).map((key, i) => {
    let name = key
    let type = fieldType(props[key])
    let alias = key

    // Create OBJECTID-specific property values if this key is the idField
    if (key === idField) {
      name = 'OBJECTID'
      type = 'esriFieldTypeOID'
      alias = 'OBJECTID'
    }

    const field = {
      name,
      type,
      alias,
      defaultValue: null,
      domain: null,
      editable: false,
      nullable: false,
      sqlType: 'sqlTypeOther'
    }

    // Add length field to strings and dates
    field.length = (type === 'esriFieldTypeString') ? 128 : (type === 'esriFieldTypeDate') ? 36 : undefined

    return field
  })

  // Add OBJECTID field object if one was not created using an assiged idField
  if (template === 'layer' && !fields.find(field => field.name === 'OBJECTID')) {
    fields.push({
      name: 'OBJECTID',
      type: 'esriFieldTypeOID',
      alias: 'OBJECTID',
      defaultValue: null,
      domain: null,
      editable: false,
      nullable: false,
      sqlType: 'sqlTypeOther'
    })
  }

  // Ensure OBJECTID is first object in the array
  fields.unshift(fields.splice(fields.findIndex(field => field.name === 'OBJECTID'), 1)[0])

  return { oidField: 'OBJECTID', fields }
}

/**
 * returns esri field type based on type of value passed
 *
 * @param {*} value - object to evaluate
 * @return {string} esri field type
 */
function fieldType (value) {
  var type = typeof value

  if (type === 'number') {
    return isInt(value) ? 'esriFieldTypeInteger' : 'esriFieldTypeDouble'
  } else if (typeof value === 'string' && moment(value, DATE_FORMATS, true).isValid()) {
    return 'esriFieldTypeDate'
  } else {
    return 'esriFieldTypeString'
  }
}

/**
 * is the value an integer?
 *
 * @param  {Number} value
 * @return {Boolean} is it an integer
 */
function isInt (value) {
  return Math.round(value) === value
}

function computeAggFieldObject (data, template, options = {}) {
  const feature = data.features && data.features[0]
  const properties = feature ? feature.properties || feature.attributes : options.attributeSample
  const idField = data.metadata && data.metadata.idField
  if (properties) return computeFieldsFromProperties(properties, template, idField, options).fields
  else return []
}
