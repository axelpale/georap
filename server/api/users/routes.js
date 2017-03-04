/* eslint-disable new-cap */

var handlers = require('./handlers');
var usernameParser = require('./lib/usernameParser.js');
var userRouter = require('./user/routes');
var express = require('express');
var router = express.Router();

// User collection

router.get('/', handlers.getAll);

// Single user

router.use('/:username', usernameParser, userRouter);

module.exports = router;
