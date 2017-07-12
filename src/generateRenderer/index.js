const { renderRenderers } = require('../templates')

module.exports = generateRenderer

/**
 * processes params based on generate renderer params
 *
 * @param {object} data
 * @param {object} params
 * @param {function} callback
 */
function generateRenderer (data, params = {}) {
  return renderRenderers(data, params)
}
