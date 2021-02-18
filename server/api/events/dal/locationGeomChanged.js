const db = require('tresdb-db');
const lib = require('./lib');
const proj = require('../../../services/proj');

module.exports = (params, callback) => {
  // Parameters:
  //   params:
  //     locationId
  //     locationName
  //     username
  //     newGeom
  //       GeoJSON Point
  //     oldGeom
  //       GeoJSON Point

  const newEvent = {
    type: 'location_geom_changed',
    user: params.username,
    time: db.timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      newGeom: params.newGeom,
      oldGeom: params.oldGeom,
    },
  };

  // Insert the basic version and emit an extended version with alt coords.
  // The alt coords are needed in client.
  lib.insertOne(newEvent, (err, newId) => {
    if (err) {
      return callback(err);
    }
    newEvent._id = newId;
    // Compute additional coodinate systems
    const newAltGeom = proj.getAltPositions(params.newGeom.coordinates);
    newEvent.data.newAltGeom = newAltGeom;
    // Emit the extended version.
    lib.emitOne(newEvent);
    return callback(null);
  });
};
