const dal = require('./dal');
const loggers = require('../../services/logs/loggers');

exports.getAll = function (req, res, next) {
  // Fetch all users

  dal.getAll((err, users) => {
    if (err) {
      return next(err);
    }

    loggers.log(req.user.name + ' viewed users.');

    return res.json(users);
  });
};
