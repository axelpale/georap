const _ = require('lodash');

module.exports = function (extendedDataArray, extendedDataName) {
  const item = _.find(extendedDataArray, (x) => {
    return x.name === extendedDataName;
  });
  // item is undefined if not found
  if (item) {
    return item.value;
  }
  return item;
};
