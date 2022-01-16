
const dal = require('./dal');
const status = require('http-status-codes');
const config = require('georap-config');


exports.getOne = function (req, res, next) {
  // Response with JSON object of user with admin-only information
  //
  // Response:
  //   {
  //     email: <string>,
  //     name: <string>,
  //     points: <int>,
  //     role: <string>,
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
  // Set user role
  const newRole = req.body.role;
  const targetName = req.username;
  const authorName = req.user.name;

  // Ensure role is valid
  if (!config.roles.includes(newRole)) {
    return res.status(status.BAD_REQUEST).send('Invalid role');
  }

  // Prevent author changing his/her own role.
  // This ensures there is always at least one user with admin role.
  if (authorName === targetName) {
    return res.status(status.FORBIDDEN).send('Cannot change own role');
  }

  dal.setRole(targetName, newRole, (err) => {
    if (err) {
      return next(err);
    }

    return res.sendStatus(status.OK);
  });
};


exports.removeOne = function (req, res, next) {
  const targetName = req.username;
  const authorName = req.user.name;

  // Only admins can remove. Admin status checked in router.

  if (authorName === targetName) {
    return res.status(status.FORBIDDEN).send('Cannot remove self');
  }

  dal.removeOne(targetName, (err) => {
    if (err) {
      return next(err);
    }

    // TODO store user event

    return res.sendStatus(status.OK);
  });
};
