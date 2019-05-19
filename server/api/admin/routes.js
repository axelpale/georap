/* eslint-disable new-cap */

var router = require('express').Router();
var status = require('http-status-codes');
var usersRouter = require('./users/routes');
var testsRouter = require('./tests/routes');

// Allow requests only by admin users.
router.use(function (req, res, next) {
  if (req.user.admin) {
    return next();
  }

  // User is authenticated but does not have permission to admin.
  return res.sendStatus(status.FORBIDDEN);
});

router.use('/users', usersRouter);
router.use('/tests', testsRouter);

module.exports = router;
