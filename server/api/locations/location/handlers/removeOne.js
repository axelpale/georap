const locationDal = require('../dal');
const status = require('http-status-codes');
const isAble = require('georap-able').isAble;

const isAbleToRemove = function (user, location) {
  // Allow only admins and creators to delete if they are able.
  if (isAble(user, 'locations-delete-any')) {
    return true;
  } else if (isAble(user, 'locations-delete-own')) {
    if (user.name === location.creator) {
      return true;
    }
  }
  return false;
};

module.exports = (req, res, next) => {
  // Delete single location

  // Ensure only owner or admin can delete
  if (!isAbleToRemove(req.user, req.location)) {
    return res.sendStatus(status.FORBIDDEN);
  }

  locationDal.removeOne(req.location._id, req.user.name, (err) => {
    if (err) {
      return next(err);
    }

    return res.sendStatus(status.OK);
  });
};
