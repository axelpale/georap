const locationDal = require('../dal');
const status = require('http-status-codes');

module.exports = (req, res, next) => {
  // Delete single location

  // Ensure only owner or admin can delete
  const username = req.user.name;
  const role = req.user.role;
  const creator = req.location.creator;

  if (username !== creator && role !== 'admin') {
    return res.sendStatus(status.FORBIDDEN);
  }

  locationDal.removeOne(req.location._id, req.user.name, (err) => {
    if (err) {
      return next(err);
    }

    return res.sendStatus(status.OK);
  });
};
