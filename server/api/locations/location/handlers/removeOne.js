const locationDal = require('../dal');
const status = require('http-status-codes');

module.exports = (req, res, next) => {
  // Delete single location

  locationDal.removeOne(req.location._id, req.user.name, (err) => {
    if (err) {
      return next(err);
    }

    return res.sendStatus(status.OK);
  });
};
