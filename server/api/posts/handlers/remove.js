const status = require('http-status-codes');
const postsDal = require('../dal');

module.exports = (req, res, next) => {
  // Remove entry by setting deleted:true

  const locationId = req.location._id;
  const locationName = req.location.name;
  const username = req.user.name;
  const entry = req.entry;

  postsDal.removeLocationEntry({
    locationId: locationId,
    locationName: locationName,
    entryId: entry._id,
    username: username,
    entry: entry,
  }, (err) => {
    if (err) {
      return next(err);
    }
    return res.sendStatus(status.OK);
  });
};
