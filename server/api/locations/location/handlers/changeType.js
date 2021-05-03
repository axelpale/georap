const locationDal = require('../dal');
const status = require('http-status-codes');
const config = require('georap-config');

module.exports = (req, res, next) => {
  // Update location type
  //

  // Validate type
  if (typeof req.body.type === 'string') {
    if (config.locationTypes.indexOf(req.body.type) < 0) {
      const msg = 'Invalid location type: ' + req.body.type;
      return res.status(status.BAD_REQUEST).send(msg);
    }
  } else {
    return res.status(status.BAD_REQUEST).send('Invalid location type');
  }

  // If no change, everything ok already
  const oldType = req.location.type;
  const newType = req.body.type;
  if (oldType === newType) {
    return res.status(status.OK).send('Type not changed. Same already.');
  }

  locationDal.changeType({
    locationId: req.location._id,
    locationName: req.location.name,
    locationType: oldType,
    username: req.user.name,
    type: newType,
  }, (err) => {
    if (err) {
      return next(err);
    }

    return res.sendStatus(status.OK);
  });
};
