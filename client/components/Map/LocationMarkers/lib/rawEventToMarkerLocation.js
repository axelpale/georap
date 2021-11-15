var statuses = georap.config.locationStatuses;
var types = georap.config.locationTypes;

module.exports = function (ev) {
  if (ev.type !== 'location_created') {
    throw new Error('Incorrect location_created event: ' + ev.type);
  }

  return {
    _id: ev.locationId,
    name: ev.locationName,
    geom: {
      type: 'Point',
      coordinates: [ev.data.lng, ev.data.lat],
    },
    status: statuses[0],
    type: types[0],
    layer: 1,  // TODO Have ev.data.layer,
    childLayer: 0,
  };
};
