const locationDal = require('../dal');
const status = require('http-status-codes');
const config = require('georap-config');

module.exports = (req, res, next) => {
  // Update location status
  //

  // Validate status
  if (typeof req.body.status === 'string') {
    if (config.locationStatuses.indexOf(req.body.status) < 0) {
      const msg = 'Invalid location status: ' + req.body.status;
      return res.status(status.BAD_REQUEST).send(msg);
    }
  } else {
    return res.sendStatus(status.BAD_REQUEST);
  }

  // If no change, everything ok already
  const oldStatus = req.location.status;
  const newStatus = req.body.status;
  if (oldStatus === newStatus) {
    return res.status(status.OK).send('Status not changed. Same already.');
  }

  locationDal.changeStatus({
    locationId: req.location._id,
    locationName: req.location.name,
    locationStatus: oldStatus,
    username: req.user.name,
    status: newStatus,
  }, (err) => {
    if (err) {
      return next(err);
    }

    return res.sendStatus(status.OK);
  });
};
