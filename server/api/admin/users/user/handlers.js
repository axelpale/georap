var dal = require('./dal');
var status = require('http-status-codes');

exports.getOne = function (req, res) {
  // Response with JSON object of user with admin-only information

  var username = req.user.name;

  dal.getUserForAdmin(username, function (err, user) {
    if (err) {
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    if (user === null) {
      return res.sendStatus(status.NOT_FOUND);
    }

    return res.json(user);
  });
};
