var dal = require('./dal');

exports.get = function (req, res, next) {
  // Response with JSON array of users with admin-only information

  dal.getUsersForAdmin(function (err, users) {
    if (err) {
      return next(err);
    }

    return res.json(users);
  });
};
