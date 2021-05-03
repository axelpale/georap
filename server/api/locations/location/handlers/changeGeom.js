const locationDal = require('../dal');
const status = require('http-status-codes');

module.exports = (req, res, next) => {
  // Update location geom

  const loc = req.location;

  if (typeof req.body.lat !== 'number' ||
      typeof req.body.lng !== 'number') {
    return res.sendStatus(status.BAD_REQUEST);
  }

  const lat = req.body.lat;
  const lng = req.body.lng;
  const u = req.user.name;

  locationDal.changeGeom({
    locationId: loc._id,
    locationName: loc.name,
    locationGeom: loc.geom,
    locationLayer: loc.layer,
    username: u,
    latitude: lat,
    longitude: lng,
  }, (err) => {
    if (err) {
      return next(err);
    }

    return res.sendStatus(status.OK);
  });
};
