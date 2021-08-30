const proj = require('../../services/proj');
const status = require('http-status-codes');

module.exports = function (req, res) {
  // Parse and detect coordinates from the given string in the given system.
  //
  const systemName = req.body.coordinateSystem;
  const text = req.body.coordinatesText;

  if (!systemName) {
    // TODO check if system exists
    return res.status(status.BAD_REQUEST).send('Invalid coordinate system');
  }

  if (!text || typeof text !== 'string') {
    return res.status(status.BAD_REQUEST).send('Missing coordinate string');
  }

  // TODO parse
  // TODO convert to WGS84 if not in WGS84

  return res.json({
    coordinates: [
      {
        system: systemName,
        xy: [12, 34],
        pretty: 'foobar',
      },
      {
        system: 'WGS84',
        xy: [56, 78],
        pretty: 'foobar',
      },
    ],
  });
};
