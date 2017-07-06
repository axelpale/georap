
module.exports = function (loc, stringify) {
  // Convert location to GeoJSON
  //
  // Parameters:
  //   loc
  //     raw location
  //   stringify (bool, optional, default false)
  //     true to return json instead of object
  //

  if (typeof stringify !== 'boolean') {
    stringify = false;
  }

  var geo = {
    'type': 'Feature',
    'geometry': loc.geom,
    'properties': {
      'name': loc.name,
    },
  };

  if (stringify) {
    return JSON.stringify(geo);
  }

  return geo;
};
