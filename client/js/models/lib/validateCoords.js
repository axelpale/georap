/* eslint-disable no-magic-numbers,yoda */

exports.isValidLatitude = function (lat) {
  // Parameters
  //   lat
  //     number
  if (typeof lat !== 'number' || Number.isNaN(lat)) {
    return false;
  }

  return (-90.0 <= lat && lat <= 90.0);
};

exports.isValidLongitude = function (lng) {
  // Parameters
  //   lng
  //     number
  if (typeof lng !== 'number' || Number.isNaN(lng)) {
    return false;
  }

  return (-180.0 <= lng && lng <= 180.0);
};
