
var status = require('http-status-codes');

var dal = require('./dal');

exports.getOne = function (req, res) {
  // Fetch single location
  //
  // Parameters:
  //   req.username
  //     string

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
