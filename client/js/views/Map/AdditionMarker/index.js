var icons = require('../lib/icons');

module.exports = function (map) {

  // An addition marker. User moves this large marker to point where
  // the new location is to be created.
  var additionMarker = null;

  // Bind

  // Make addition marker to follow map center.
  map.addListener('center_changed', function () {
    if (additionMarker) {
      additionMarker.setPosition(map.getCenter());
    }
  });

  // Public methods

  this.show = function () {
    // Creates a draggable marker at the middle of the map.
    additionMarker = new google.maps.Marker({
      position: map.getCenter(),
      map: map,
      icon: icons.additionMarker(),
      draggable: true,
    });

    additionMarker.addListener('dragend', function () {
      // Move the map so that the marker is at the middle.
      map.panTo(additionMarker.getPosition());
    });
  };

  this.getGeom = function () {
    // Return GeoJSON Point at the addition marker. Throws if
    // the marker is not set.

    if (additionMarker === null) {
      throw new Error('additionMarker needs to be created first');
    }

    var latlng = additionMarker.getPosition();

    return {
      type: 'Point',
      coordinates: [latlng.lng(), latlng.lat()],
    };
  };

  this.hide = function () {
    // Remove addition marker from the map.
    additionMarker.setMap(null);
    additionMarker = null;
  };
};
