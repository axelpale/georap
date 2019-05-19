var dal = require('./dal');

exports.getAll = function (req, res, next) {
  // Fetch all users

  dal.getAll(function (err, users) {
    if (err) {
      return next(err);
    }

    return res.json(users);
  });
};
