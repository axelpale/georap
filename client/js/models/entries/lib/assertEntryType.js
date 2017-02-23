
module.exports = function (actualType, requiredType) {
  if (actualType !== requiredType) {
    throw new Error('Wrong content entry type for ' + requiredType +
                    ': ' + actualType);
  }
};
