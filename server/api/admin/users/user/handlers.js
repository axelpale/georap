
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


exports.setRole = function (req, res, next) {
  // Set user role
  const targetRole = req.body.role;
  const targetName = req.username;
  const authorName = req.user.name;
  const siteAdminName = config.admin.username;

  // Ensure role is valid for persistence.
  // Note that config.capabilities has extra role names in which
  // no true long-term user can be.
  if (!config.roles.includes(targetRole)) {
    return res.status(status.BAD_REQUEST).send('Invalid role');
  }

  // Prevent author changing his/her own role.
  // This ensures there is always at least one user with admin role.
  if (authorName === targetName) {
    return res.status(status.FORBIDDEN).send(req.__('user-role-noauto'));
  }

  // Prevent config-admin to become reroled.
  // This prevents a hacked admin account closing all other admin accounts.
  if (targetName === siteAdminName) {
    return res.status(status.FORBIDDEN).send('Cannot change root admin role');
  }

  // For next part, we need to know the target users role and deletion status.
  dal.getUserForAdmin(targetName, (err, targetUser) => {
    if (err) {
      return next(err);
    }

    if (!targetUser) {
      return res.status(status.NOT_FOUND).send('No user with this name.');
    }

    // Prevent author promoting to a higher role than herself.
    // Also, prevent author demoting from a higher role than herself.
    const sourceRole = targetUser.role;
    const authorRole = req.user.role;
    // Find positions for order comparison
    const sourceRoleIndex = config.roles.indexOf(sourceRole);
    const targetRoleIndex = config.roles.indexOf(targetRole);
    const authorRoleIndex = config.roles.indexOf(authorRole);

    if (sourceRoleIndex > authorRoleIndex) {
      const msg = 'Cannot change from a role higher than yours.';
      return res.status(status.FORBIDDEN).send(msg);
    }

    if (targetRoleIndex > authorRoleIndex) {
      const msg = 'Cannot change to a role higher than yours.';
      return res.status(status.FORBIDDEN).send(msg);
    }

    dal.setRole(targetName, targetRole, (errr) => {
      if (errr) {
        return next(errr);
      }

      return res.sendStatus(status.OK);
    });
  });
};


exports.removeOne = function (req, res, next) {
  const targetName = req.username;
  const authorName = req.user.name;
  const siteAdminName = config.admin.username;

  // Only admin roles can remove. Admin status checked in router.
  // Root-admin cannot be removed.

  if (authorName === targetName) {
    return res.status(status.FORBIDDEN).send(req.__('user-removal-noauto'));
  }

  // Prevent config-admin to become reroled.
  // This prevents a hacked admin account closing all other admin accounts.
  if (targetName === siteAdminName) {
    return res.status(status.FORBIDDEN).send(req.__('user-removal-noadmin'));
  }

  dal.removeOne(targetName, (err) => {
    if (err) {
      return next(err);
    }

    // TODO store a user event

    return res.sendStatus(status.OK);
  });
};
