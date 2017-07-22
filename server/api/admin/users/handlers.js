var dal = require('./dal');
var status = require('http-status-codes');

exports.get = function (req, res) {
  // Response with JSON array of users with admin-only information

  dal.getUsersForAdmin(function (err, users) {
    if (err) {
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    return res.json(users);
  });
};
