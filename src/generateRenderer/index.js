const { renderRenderers, renderRenderersStats } = require('../templates')

module.exports = generateRenderer

/**
 * processes params based on generate renderer params
 *
 * @param {object} data
 * @param {object} params
 * @param {function} callback
 */
function generateRenderer (data, params = {}) {
  if (data.statistics) return renderRenderersStats(data)
  return renderRenderers(data, params) // TODO: use winnow to calculate class breaks statistics
}
