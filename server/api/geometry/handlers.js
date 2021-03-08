const proj = require('../../services/proj');
const status = require('http-status-codes');

exports.getInEverySystem = function (req, res) {
  // Return given WGS84 coordinate in all configured coordinate systems.
  //
  const lat = parseFloat(req.body.latitude);
  const lng = parseFloat(req.body.longitude);

  if (isNaN(lat) || isNaN(lng)) {
    const msg = 'Invalid lat lng: ' +
      req.body.latitude + ' ' + req.body.longitude;
    return res.status(status.BAD_REQUEST).send(msg);
  }

  const positions = proj.getAltPositions([lng, lat]);

  return res.json(positions);
};
