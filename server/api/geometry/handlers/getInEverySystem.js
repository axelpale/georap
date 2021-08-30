const proj = require('../../../services/proj');
const status = require('http-status-codes');

module.exports = function (req, res) {
  // Return given GeoJSON geometry in all configured coordinate systems.
  //
  const geom = req.body.geometry;

  if (!geom) {
    return res.status(status.BAD_REQUEST).send('Invalid geometry');
  }

  if (geom.type !== 'Point') {
    const msg = 'No support yet for geometry type ' + geom.type;
    return res.status(status.NOT_IMPLEMENTED).send(msg);
  }

  const lat = geom.coordinates[1];
  const lng = geom.coordinates[0];

  if (isNaN(lat) || isNaN(lng)) {
    const msg = 'Invalid lat lng: ' + lat + ' ' + lng;
    return res.status(status.BAD_REQUEST).send(msg);
  }

  const positions = proj.getAltPositions([lng, lat]);

  return res.json(positions);
};
