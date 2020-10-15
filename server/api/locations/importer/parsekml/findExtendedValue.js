var _ = require('lodash');

module.exports = function (extendedDataArray, extendedDataName) {
  var item = _.find(extendedDataArray, function (x) {
    return x.name === extendedDataName;
  });
  // item is undefined if not found
  if (item) {
    return item.value;
  }
  return item;
};
