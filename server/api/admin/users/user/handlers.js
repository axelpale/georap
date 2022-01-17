
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
  const adminName = config.admin.username;

  // Prevent author blocking him/herself out.
  if (authorName === targetName) {
    return res.status(status.FORBIDDEN).send(req.__('user-status-noauto'));
  }

  // Prevent config-admin to become blocked
  if (targetName === adminName) {
    return res.status(status.FORBIDDEN).send(req.__('user-status-noadmin'));
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
  const adminName = config.admin.username;

  // Ensure role is valid
  if (!config.roles.includes(newRole)) {
    return res.status(status.BAD_REQUEST).send('Invalid role');
  }

  // Prevent author changing his/her own role.
  // This ensures there is always at least one user with admin role.
  if (authorName === targetName) {
    return res.status(status.FORBIDDEN).send(req.__('user-role-noauto'));
  }

  // Prevent config-admin to become reroled
  if (targetName === adminName) {
    return res.status(status.FORBIDDEN).send('Cannot change root admin role');
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
  const adminName = config.admin.username;

  // Only admin roles can remove. Admin status checked in router.
  // Root-admin cannot be removed.

  if (authorName === targetName) {
    return res.status(status.FORBIDDEN).send(req.__('user-removal-noauto'));
  }

  // Prevent config-admin to become reroled
  if (targetName === adminName) {
    return res.status(status.FORBIDDEN).send(req.__('user-removal-noadmin'));
  }

  dal.removeOne(targetName, (err) => {
    if (err) {
      return next(err);
    }

    // TODO store user event

    return res.sendStatus(status.OK);
  });
};
