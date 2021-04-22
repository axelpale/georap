const db = require('tresdb-db');
const googlemaps = require('../../../../services/googlemaps');
const eventsDal = require('../../../events/dal');

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
  const lat = params.latitude;
  const lng = params.longitude;

  googlemaps.reverseGeocode([lat, lng], (err, newPlaces) => {
    // Places is an array of strings
    if (err) {
      return callback(err);
    }

    const newGeom = {
      type: 'Point',
      coordinates: [lng, lat],  // note different order to google
    };

    // Find new layer or do not find new layer?
    // Do not. Because findLayerForPoint picks the highest layer number,
    // i.e. the bottommost empty layer. A single move of loc with low layer
    // number would hide it from global navigation if new layer is searched
    // for. So we do not find new layer here but use the same layer as
    // before.

    const locColl = db.collection('locations');
    const q = { _id: params.locationId };

    const u = {
      $set: {
        geom: newGeom,
        places: newPlaces,
        layer: params.locationLayer,
      },
    };

    locColl.updateOne(q, u, (err2) => {
      if (err2) {
        return callback(err2);
      }

      const oldGeom = params.locationGeom;

      eventsDal.createLocationGeomChanged({
        locationId: params.locationId,
        locationName: params.locationName,
        username: params.username,
        newGeom: newGeom,
        oldGeom: oldGeom,
      }, (err3) => {
        if (err3) {
          return callback(err3);
        }

        return callback();
      });
    });  // updateOne
  });  // reverseGeocode
};
