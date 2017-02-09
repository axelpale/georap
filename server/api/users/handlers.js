
var status = require('http-status-codes');

var dal = require('./dal');

exports.getAll = function (req, res) {
  // Fetch all users

  dal.getAll(function (err, users) {
    if (err) {
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    return res.json(users);
  });
};

exports.getOne = function (req, res) {
  // Fetch single location

  dal.getOne(req.username, function (err, user) {
    if (err) {
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    if (!user) {
      return res.sendStatus(status.NOT_FOUND);
    }

    return res.json(user);
  });
};
