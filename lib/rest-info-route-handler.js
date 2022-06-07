const _ = require('lodash')
const {
  CURRENT_VERSION,
  FULL_VERSION
} = require('./constants')

function restInfo (req, options = {}) {
  const currentVersion = _.get(req, 'app.locals.config.featureServer.currentVersion', CURRENT_VERSION)
  const fullVersion = _.get(req, 'app.locals.config.featureServer.fullVersion', FULL_VERSION)

  return {
    currentVersion,
    fullVersion,
    ...options
  }
}

module.exports = restInfo
