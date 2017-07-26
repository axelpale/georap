var dal = require('./dal');
var blacklistDal = require('../../../../services/blacklist');
var status = require('http-status-codes');


exports.getOne = function (req, res) {
  // Response with JSON object of user with admin-only information

  var username = req.username;

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


exports.isBlacklisted = function (req, res) {

  blacklistDal.has(req.username, function (err, boolResult) {
    if (err) {
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    return res.json(boolResult);
  });
};


exports.setBlacklisted = function (req, res) {

  var isB = req.body.isBlacklisted;

  var targetName = req.username;
  var authorName = req.user.name;

  // Prevent author blacklisting him/herself
  if (authorName === targetName) {
    return res.sendStatus(status.BAD_REQUEST);
  }

  blacklistDal.set(req.username, isB, function (err) {
    if (err) {
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    return res.sendStatus(status.OK);
  });
};
