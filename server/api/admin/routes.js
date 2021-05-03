/* eslint-disable new-cap */

const router = require('express').Router();
const status = require('http-status-codes');
const usersRouter = require('./users/routes');
const testsRouter = require('./tests/routes');

// Allow requests only by admin users.
router.use((req, res, next) => {
  if (req.user.admin) {
    return next();
  }

  // User is authenticated but does not have permission to admin.
  return res.sendStatus(status.FORBIDDEN);
});

router.use('/users', usersRouter);
router.use('/tests', testsRouter);

module.exports = router;
