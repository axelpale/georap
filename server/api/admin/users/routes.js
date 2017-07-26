/* eslint-disable new-cap */

var router = require('express').Router();
var handlers = require('./handlers');
var userRouter = require('./user/routes');

var usernameParser = function (req, res, next) {
  // Username parser middleware.
  // Finds the username.
  // We need to define the parser in this routing level, because
  // the child router 'userRouter' does receive only the path after /:username
  // In other words, req.params.username will not be defined.
  // This Express routing feature is useful to prevent namespace collisions.
  req.username = req.params.username;
  return next();
};

router.get('/', handlers.get);

router.use('/:username', usernameParser, userRouter);

module.exports = router;
