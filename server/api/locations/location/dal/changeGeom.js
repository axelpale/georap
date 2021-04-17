const db = require('tresdb-db');
const googlemaps = require('../../../../services/googlemaps');
const eventsDal = require('../../../../events/dal');

module.exports = function (params, callback) {
  // Change geom but do not recompute layer.
  //
  // Parameters:
  //   params
  //     locationId
  //       ObjectId
  //     locationName
  //       string
  //     locationGeom
  //       GeoJSON Point
  //     locationLayer
  //       integer
  //     username
  //       string
  //     latitude
  //       number
  //     longitude
  //       number
  //
  var lat = params.latitude;
  var lng = params.longitude;

  googlemaps.reverseGeocode([lat, lng], function (err, newPlaces) {
    // Places is an array of strings
    if (err) {
      return callback(err);
    }

    var newGeom = {
      type: 'Point',
      coordinates: [lng, lat],  // note different order to google
    };

    // Find new layer or do not find new layer?
    // Do not. Because findLayerForPoint picks the highest layer number,
    // i.e. the bottommost empty layer. A single move of loc with low layer
    // number would hide it from global navigation if new layer is searched
    // for. So we do not find new layer here but use the same layer as
    // before.

    var locColl = db.collection('locations');
    var q = { _id: params.locationId };

    var u = {
      $set: {
        geom: newGeom,
        places: newPlaces,
        layer: params.locationLayer,
      },
    };

    locColl.updateOne(q, u, function (err2) {
      if (err2) {
        return callback(err2);
      }

      var oldGeom = params.locationGeom;

      eventsDal.createLocationGeomChanged({
        locationId: params.locationId,
        locationName: params.locationName,
        username: params.username,
        newGeom: newGeom,
        oldGeom: oldGeom,
      }, function (err3) {
        if (err3) {
          return callback(err3);
        }

        return callback();
      });
    });  // updateOne
  });  // reverseGeocode
};
