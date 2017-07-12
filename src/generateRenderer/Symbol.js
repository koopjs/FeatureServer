/**
*
* generate a symbol
*
* @param {object} options [type, style, width]
* @return {object} symbol
*/
module.exports = function (options) {
  const {
    type = 'esriSMS',
    style = 'esriSMSSquare',
    color = [0, 0, 0, 255],
    size = 4,
    angle = 23,
    xoffset = 0,
    yoffset = 0,
    outline = {
      color: [0, 0, 0, 255],
      width: 1
    }
  } = options

  return {
    type: type,
    style: style,
    color: color,
    size: size,
    angle: angle,
    xOffset: xoffset,
    yOffset: yoffset,
    outline: outline
  }
}
