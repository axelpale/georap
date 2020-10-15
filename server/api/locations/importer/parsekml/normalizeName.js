var findExtendedValue = require('./findExtendedValue');

module.exports = function (loc) {
  // For special extended data
  var extType, extNumber, extCounty;

  // Replace empty names with something
  if (typeof loc.name !== 'string' || loc.name.trim() === '') {

    // Special parser for a historical finnish QGIS military data schema.
    if (loc.extendedData.length > 0) {
      extType = findExtendedValue(loc.extendedData, 'Tyyppi');
      extNumber = findExtendedValue(loc.extendedData, 'Numero');
      extCounty = findExtendedValue(loc.extendedData, 'Kunta');
      if (extType && extNumber) {
        return extType + ' ' + extNumber + ', ' + extCounty;
      }
    }
  }

  return loc.name;
};
