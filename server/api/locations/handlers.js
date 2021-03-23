const dal = require('./dal');
const status = require('http-status-codes');

exports.count = (req, res, next) => {

  dal.count((err, numLocs) => {
    if (err) {
      return next(err);
    }

    return res.json(numLocs);
  });
};

exports.create = (req, res, next) => {

  // Validate required arguments

  const valid = (typeof req.body === 'object' &&
               typeof req.body.lat === 'number' &&
               typeof req.body.lng === 'number');

  if (!valid) {
    return res.status(status.BAD_REQUEST).send('Invalid loc name');
  }

  const lat = req.body.lat;
  const lng = req.body.lng;

  const username = req.user.name;

  // Validate optional arguments

  if (typeof req.body.name === 'string') {
    const name = req.body.name.trim();

    const minLen = 2;
    const maxLen = 120;
    if (name.length < minLen || name.length > maxLen) {
      return res.status(status.BAD_REQUEST).send('Too short or too long name');
    }

    dal.createLocation({
      name: name,
      latitude: lat,
      longitude: lng,
      username: username,
    }, (err) => {
      if (err) {
        if (err.message === 'TOO_CLOSE') {
          return res.json('TOO_CLOSE');
        }
        return next(err);
      }
    });

    return;
  }

  dal.create(lat, lng, username, (err, rawLoc) => {
    if (err) {
      if (err.message === 'TOO_CLOSE') {
        return res.json('TOO_CLOSE');
      }
      return next(err);
    }

    return res.json(rawLoc);
  });
};

exports.latest = (req, res, next) => {
  // Latest created locations. For this, we use locations collection
  // instead of events because we get the name and thumbnail from the location.
  //

  // Validate arguments
  const numLocs = parseInt(req.query.n, 10);
  if (isNaN(numLocs) || numLocs < 0) {
    return res.status(status.BAD_REQUEST).send('Invalid number of locations');
  }

  dal.latest(numLocs, (err, locs) => {
    if (err) {
      return next(err);
    }

    return res.json({
      locations: locs,
    });
  });
};
