const _ = require('lodash');
const { createColorRamp } = require('./color-ramp');
const { createSymbol } = require('./create-symbol');

module.exports = { createClassBreakInfos, createUniqueValueInfos };

function createClassBreakInfos(breaks, classification, geomType) {
  const { colorRamp: colorRampConfig = {}, baseSymbol } = classification;
  const colorRamp = createColorRamp({ breaks, ...colorRampConfig });

  return breaks.map((currBreak, index) => {
    return {
      classMinValue: currBreak[0],
      classMaxValue: currBreak[1],
      label: `${currBreak[0]}-${currBreak[1]}`,
      description: '',
      symbol: createSymbol(baseSymbol, colorRamp[index], geomType),
    };
  });
}

function createUniqueValueInfos(breaks, classificationDefinition, geomType) {
  const { colorRamp: colorRampConfig = {}, baseSymbol } =
    classificationDefinition;
  const colorRamp = createColorRamp({ breaks, ...colorRampConfig });

  return breaks.map((currBreak, index) => {
    const value = parseUniqueValues(
      currBreak,
      classificationDefinition.fieldDelimiter
    );
    return {
      value,
      count: currBreak.count,
      label: value,
      description: '',
      symbol: createSymbol(baseSymbol, colorRamp[index], geomType),
    };
  });
}

function parseUniqueValues(currBreak, delimiter) {
  const thisBreak = _.cloneDeep(currBreak);
  delete thisBreak.count;
  return Object.keys(thisBreak)
    .map((key) => thisBreak[key])
    .join(delimiter);
}
