/* eslint-disable new-cap */

var handlers = require('./handlers');
var express = require('express');
var router = express.Router();

// User collection

router.get('/', handlers.getAll);

// Single user

router.use('/:username', function (req, res, next) {
  // Catches the username
  req.username = req.params.username;
  return next();
});

router.get('/:username', handlers.getOne);

module.exports = router;
