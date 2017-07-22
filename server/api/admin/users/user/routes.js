/* eslint-disable new-cap */

var handlers = require('./handlers');
var router = require('express').Router();

// Username parser middleware

router.use(function (req, res, next) {
  // Catches the username
  req.username = req.params.username;
  return next();
});

router.get('/', handlers.getOne);

module.exports = router;
