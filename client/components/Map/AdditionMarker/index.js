/* global google */

var icons = require('../lib/icons');

module.exports = function (map) {

  // An addition marker. User moves this large marker to point where
  // the new location is to be created.
  var additionMarker = null;

  // Keep track if the marker is dragged or not.
  // This helps to determine should map pan change the marker position or not.
  // Dragging marker near the edge will pan the view,
  // which would cause the marker to flick between pointer and center,
  // if we do not care if marker is dragged or not.
  var dragged = false;

  // Bind

  // Make addition marker to follow map center except when marker is dragged.
  // See comment next to var dragged for details.
  var setMarkerPosition = function () {
    if (additionMarker && !dragged) {
      additionMarker.setPosition(map.getCenter());
    }
  };
  var centerListener = map.addListener('center_changed', setMarkerPosition);

  // Public methods

  this.show = function () {
    // Creates a draggable marker at the middle of the map.
    additionMarker = new google.maps.Marker({
      position: map.getCenter(),
      map: map,
      icon: icons.additionMarker(),
      draggable: true,
    });

    // See comment next to var dragged for details.
    additionMarker.addListener('dragstart', function () {
      dragged = true;
    });

    additionMarker.addListener('dragend', function () {
      // Move the map so that the marker is at the middle.
      map.panTo(additionMarker.getPosition());
      // See comment next to var dragged for details.
      dragged = false;
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
    centerListener.remove();
    google.maps.event.clearListeners(additionMarker, 'dragstart');
    google.maps.event.clearListeners(additionMarker, 'dragend');
    additionMarker.setMap(null);
    additionMarker = null;
  };
};
