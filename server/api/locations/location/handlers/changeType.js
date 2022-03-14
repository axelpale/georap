const locationDal = require('../dal');
const status = require('http-status-codes');
const config = require('georap-config');

module.exports = (req, res, next) => {
  // Update location type
  //

  const oldStatus = req.location.status;
  const newStatus = req.body.status;
  const oldType = req.location.type;
  const newType = req.body.type;

  // Validate status
  if (typeof newStatus === 'string') {
    if (config.locationStatuses.indexOf(newStatus) < 0) {
      const msg = 'Invalid location status: ' + newStatus;
      return res.status(status.BAD_REQUEST).send(msg);
    }
  } else {
    return res.status(status.BAD_REQUEST).send('Invalid location status');
  }
  // Validate type
  if (typeof newType === 'string') {
    if (config.locationTypes.indexOf(newType) < 0) {
      const msg = 'Invalid location type: ' + newType;
      return res.status(status.BAD_REQUEST).send(msg);
    }
  } else {
    return res.status(status.BAD_REQUEST).send('Invalid location type');
  }

  // If no change, everything ok already
  if (oldStatus === newStatus && oldType === newType) {
    const msg = 'Status and type did not change. Same already.';
    return res.status(status.OK).send(msg);
  }

  locationDal.changeType({
    locationId: req.location._id,
    locationName: req.location.name,
    username: req.user.name,
    oldStatus: oldStatus,
    newStatus: newStatus,
    oldType: oldType,
    newType: newType,
  }, (err) => {
    if (err) {
      return next(err);
    }

    return res.sendStatus(status.OK);
  });
};
