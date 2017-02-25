
module.exports = function (map) {
  // Parameters:
  //   map
  //     google.maps.Map instance.
  //
  // Return:
  //   a mapState object

  var latlng = map.getCenter();
  var state = {
    lat: latlng.lat(),
    lng: latlng.lng(),
    zoom: map.getZoom(),
    mapTypeId: map.getMapTypeId(),
  };

  return state;
};
