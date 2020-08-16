
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
    tags: [],
    layer: 1,  // TODO Have ev.data.layer,
    childLayer: 0,
  };
};
