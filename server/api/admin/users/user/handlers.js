
const dal = require('./dal');
const status = require('http-status-codes');


exports.getOne = function (req, res, next) {
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

  const username = req.username;

  dal.getUserForAdmin(username, (err, user) => {
    if (err) {
      return next(err);
    }

    if (user === null) {
      return res.sendStatus(status.NOT_FOUND);
    }

    return res.json(user);
  });
};


exports.setStatus = function (req, res, next) {

  const isActive = req.body.isActive;

  const targetName = req.username;
  const authorName = req.user.name;

  // Prevent author blocking him/herself out.
  if (authorName === targetName) {
    return res.sendStatus(status.BAD_REQUEST);
  }

  const newStatus = isActive ? 'active' : 'deactivated';

  dal.setStatus(targetName, newStatus, (err) => {
    if (err) {
      return next(err);
    }

    return res.sendStatus(status.OK);
  });
};


exports.setRole = function (req, res, next) {

  const isAdmin = req.body.isAdmin;

  const targetName = req.username;
  const authorName = req.user.name;

  // Prevent author changing his/her own role
  if (authorName === targetName) {
    return res.sendStatus(status.BAD_REQUEST);
  }

  dal.setRole(targetName, isAdmin, (err) => {
    if (err) {
      return next(err);
    }

    return res.sendStatus(status.OK);
  });
};
