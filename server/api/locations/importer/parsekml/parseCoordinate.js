module.exports = function (str) {
  // Parse coordinate string, e.g. 61.0;23.0 or 61.0,23.0
  //
  // Return
  //   null if not valid
  //   [lat, lng] otherwise
  let lat, lng;
  const parts = str.trim().split(/\s*[,;:\s]\s*/);
  if (parts.length === 2) {
    lat = parseFloat(parts[0]);
    lng = parseFloat(parts[1]);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return null;
    }

    return [lat, lng];
  }
  return null;
};
