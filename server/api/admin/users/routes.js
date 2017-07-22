/* eslint-disable new-cap */

var router = require('express').Router();
var userRouter = require('./user/routes');

// Username parser middleware
var usernameParser = function (req, res, next) {
  // Catches the username
  req.username = req.params.username;
  return next();
};

router.use('/:username', usernameParser, userRouter);

module.exports = router;
