const proj = require('../../../services/proj');
const status = require('http-status-codes');
const utmParser = require('utm-coordinate-parser');
const CoordinateParser = require('coordinate-parser');

module.exports = function (req, res) {
  // Parse and detect coordinates from the given string in the given system.
  //
  const systemName = req.query.system;
  const text = req.query.text;

  if (!systemName || !proj.hasCoordinateSystem(systemName)) {
    const msg = 'Invalid coordinate system: ' + systemName;
    return res.status(status.BAD_REQUEST).send(msg);
  }

  if (!text || typeof text !== 'string') {
    return res.status(status.BAD_REQUEST).send('Missing coordinate string');
  }

  const projDef = proj.getProjectionDefinition(systemName);
  const projection = proj.parseProjectionDefinition(projDef);

  // Parse the coordinate text according to projection type.
  let xy;
  if (projection.projName === 'longlat') {
    // Use 3rd party parser
    const position = new CoordinateParser(text);
    xy = {
      x: position.getLongitude(),
      y: position.getLatitude(),
    };
  } else if (projection.projName === 'utm') {
    // Use utm parser
    const ne = utmParser.parse(text);
    xy = {
      x: ne.x,
      y: ne.y,
    };
  }

  // Convert to WGS84 if not in WGS84
  const wgs84xy = proj.projectFrom(projection, xy);

  return res.json({
    coordinates: [
      {
        system: systemName,
        xy: xy,
      },
      {
        system: 'WGS84',
        xy: {
          x: wgs84xy.x,
          y: wgs84xy.y,
          // there is also wgs84xy.z but we leave it out as unnecessary
        },
      },
    ],
  });
};
