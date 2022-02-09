const locationDal = require('../dal');
const status = require('http-status-codes');

module.exports = (req, res, next) => {
  // Update location name

  let newLocName = req.body.newName;

  if (typeof newLocName !== 'string') {
    return res.status(status.BAD_REQUEST).send('Invalid name');
  }

  // Remove excess whitespaces and prevent only-whitespace names.
  newLocName = newLocName.trim();

  const minNameLen = 2;
  const maxNameLen = 120;
  if (newLocName.length < minNameLen || newLocName.length > maxNameLen) {
    const msg = req.__('location-rename-bad-size');
    return res.status(status.BAD_REQUEST).send(msg);
  }

  const params = {
    locationId: req.location._id,
    locationName: req.location.name,
    newName: req.body.newName,
    username: req.user.name,
  };

  locationDal.changeName(params, (err) => {
    if (err) {
      return next(err);
    }

    return res.sendStatus(status.OK);
  });
};
