
var dal = require('./dal');
var status = require('http-status-codes');


exports.getOne = function (req, res) {
  // Response with JSON object of user with admin-only information
  //
  // Response:
  //   {
  //     admin: <bool>,
  //     email: <string>,
  //     name: <string>,
  //     points: <int>,
  //     status: <'active' | 'deactivated'>
  //   }

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


exports.setStatus = function (req, res) {

  var isActive = req.body.isActive;

  var targetName = req.username;
  var authorName = req.user.name;

  // Prevent author blocking him/herself out.
  if (authorName === targetName) {
    return res.sendStatus(status.BAD_REQUEST);
  }

  var newStatus = isActive ? 'active' : 'deactivated';

  dal.setStatus(targetName, newStatus, function (err) {
    if (err) {
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    return res.sendStatus(status.OK);
  });
};


exports.setRole = function (req, res) {

  var isAdmin = req.body.isAdmin;

  var targetName = req.username;
  var authorName = req.user.name;

  // Prevent author changing his/her own role
  if (authorName === targetName) {
    return res.sendStatus(status.BAD_REQUEST);
  }

  dal.setRole(targetName, isAdmin, function (err) {
    if (err) {
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    return res.sendStatus(status.OK);
  });
};
